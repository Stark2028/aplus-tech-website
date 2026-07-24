import { describe, it, expect } from "vitest";
import { cities, getCityBySlug } from "@/data/cities";
import { citySectors, cityServeCards, cityFaqs } from "@/lib/cityContent";
import { solutions } from "@/data/solutions";

describe("citySectors", () => {
  it("only ever returns real solutions", () => {
    const valid = new Set(solutions.map((s) => s.slug));
    const bad = cities.filter((c) => citySectors(c).some((s) => !valid.has(s.slug)));
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  // The honesty invariant: a sector may only surface on a city page when that
  // city's client-reviewed intro actually names it. Never inferred, never
  // guessed from region or population.
  it("only names a sector the reviewed intro supports", () => {
    const PROOF: Record<string, RegExp> = {
      hospitality: /hospitality|hotel|resort|tourism/i,
      retail: /retail|showroom|mall|store/i,
      education: /education|school|universit|college|campus|coaching|institute/i,
      corporate: /corporate|office|industrial|industry|manufacturing|government|steel|tower|enterprise/i,
    };
    for (const c of cities) {
      for (const s of citySectors(c)) {
        expect(
          PROOF[s.slug].test(c.intro),
          `${c.slug} claims "${s.slug}" but its intro does not support it: "${c.intro}"`
        ).toBe(true);
      }
    }
  });

  it("returns nothing for a generic intro rather than guessing", () => {
    const generic = cities.find((c) => citySectors(c).length === 0);
    // Not every dataset will have one, but if it does it must stay empty.
    if (generic) expect(citySectors(generic)).toEqual([]);
  });

  it("is deterministic and ordered canonically", () => {
    const order = solutions.map((s) => s.slug);
    for (const c of cities) {
      const got = citySectors(c).map((s) => s.slug);
      expect(got).toEqual([...got].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
    }
  });
});

describe("cityServeCards", () => {
  it("always returns three named cards mentioning the city", () => {
    for (const c of cities) {
      const cards = cityServeCards(c);
      expect(cards).toHaveLength(3);
      expect(cards.every((x) => x.title.trim() && x.body.trim())).toBe(true);
      expect(cards.some((x) => x.body.includes(c.name))).toBe(true);
    }
  });

  it("never claims a local office — only the real Noida/Kolkata ones", () => {
    // Noida (HQ) and Kolkata (regional) are genuine offices, so their own pages
    // may say "our Noida headquarters". Every OTHER city must not.
    const REAL_OFFICE_CITIES = new Set(["Noida", "Kolkata"]);
    for (const c of cities) {
      const text = cityServeCards(c).map((x) => x.body).join(" ");
      const office = c.servedFrom === "noida" ? "Noida" : "Kolkata";
      expect(text).toContain(office);
      if (REAL_OFFICE_CITIES.has(c.name)) continue;
      expect(
        text,
        `${c.slug} implies a local office`
      ).not.toMatch(new RegExp(`our ${c.name} (headquarters|office|branch)`, "i"));
    }
  });

  it("varies copy between the two serving offices", () => {
    const noida = cities.find((c) => c.servedFrom === "noida")!;
    const kolkata = cities.find((c) => c.servedFrom === "kolkata")!;
    expect(cityServeCards(noida)[0].body).not.toBe(cityServeCards(kolkata)[0].body);
  });
});

describe("cityFaqs", () => {
  it("returns city-named Q&A for every city", () => {
    for (const c of cities) {
      const faqs = cityFaqs(c);
      expect(faqs.length).toBeGreaterThanOrEqual(4);
      expect(faqs.every((f) => f.q.trim() && f.a.trim())).toBe(true);
      expect(faqs.some((f) => f.q.includes(c.name) || f.a.includes(c.name))).toBe(true);
    }
  });

  it("never repeats a question within a city", () => {
    const bad = cities.filter((c) => {
      const qs = cityFaqs(c).map((f) => f.q);
      return new Set(qs).size !== qs.length;
    });
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  // The point of moving this into lib/: the FAQ block used to be byte-identical
  // (modulo the city name) on all 120 pages. Sector-aware middles break that up.
  it("produces more than one distinct FAQ shape across the dataset", () => {
    const shapes = new Set(
      cities.map((c) =>
        cityFaqs(c)
          .map((f) => f.q.replace(new RegExp(c.name, "g"), "«CITY»"))
          .join("|")
      )
    );
    expect(shapes.size).toBeGreaterThan(1);
  });

  it("asks a hospitality question only where the intro names hospitality", () => {
    for (const c of cities) {
      const asksHotel = cityFaqs(c).some((f) => /hotel|guest-room/i.test(f.q));
      if (asksHotel) expect(c.intro).toMatch(/hospitality|hotel|resort|tourism/i);
    }
  });

  it("is deterministic across calls", () => {
    const a = cityFaqs(getCityBySlug("jaipur")!).map((f) => f.q);
    const b = cityFaqs(getCityBySlug("jaipur")!).map((f) => f.q);
    expect(a).toEqual(b);
  });
});
