import { describe, it, expect } from "vitest";
import { vcRoomGuides, getVcRoomGuide } from "./vcRoomGuides";
import { products } from "./products";

const BANNED = /authoriz|partner|certif|samsung/i;

/** Bands that apply to any room — accessories, not size-specific hardware. */
const ACCESSORY_BANDS = new Set([
  "Any Room",
  "Companion Camera",
  "Outside-room Scheduling",
]);

const byId = new Map(products.map((p) => [p.id, p]));

describe("vcRoomGuides shape", () => {
  it("has 5 guides with unique slugs", () => {
    expect(vcRoomGuides).toHaveLength(5);
    const slugs = vcRoomGuides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("exposes every guide through getVcRoomGuide", () => {
    for (const g of vcRoomGuides) {
      expect(getVcRoomGuide(g.slug)).toBe(g);
    }
    expect(getVcRoomGuide("nope")).toBeUndefined();
  });

  it("every guide carries a navLabel, 3+ sections and 3+ faqs", () => {
    for (const g of vcRoomGuides) {
      expect(g.navLabel.length).toBeGreaterThan(0);
      expect(g.sections.length).toBeGreaterThanOrEqual(3);
      expect(g.faqs.length).toBeGreaterThanOrEqual(3);
      for (const f of g.faqs) expect(f.q.endsWith("?")).toBe(true);
    }
  });

  it("room guides declare roomBands and platform guides do not", () => {
    for (const g of vcRoomGuides) {
      if (g.kind === "room") expect(g.roomBands?.length).toBeGreaterThan(0);
      else expect(g.roomBands).toBeUndefined();
    }
  });
});

describe("vcRoomGuides product curation", () => {
  it("every productId resolves to a Logitech video-conferencing product", () => {
    for (const g of vcRoomGuides) {
      expect(g.productIds.length).toBeGreaterThan(0);
      for (const id of g.productIds) {
        const p = byId.get(id);
        expect(p, `${g.slug} -> ${id}`).toBeDefined();
        expect(p!.brand).toBe("Logitech");
        expect(p!.category).toBe("Video Conferencing");
      }
    }
  });

  it("room-guide products match the guide's declared bands or are accessories", () => {
    for (const g of vcRoomGuides.filter((x) => x.kind === "room")) {
      for (const id of g.productIds) {
        const band = byId.get(id)!.specs.operationTime;
        const ok = g.roomBands!.includes(band) || ACCESSORY_BANDS.has(band);
        expect(ok, `${g.slug} -> ${id} has band "${band}"`).toBe(true);
      }
    }
  });

  it("covers all 16 Logitech products across the room guides", () => {
    const covered = new Set(
      vcRoomGuides.filter((g) => g.kind === "room").flatMap((g) => g.productIds)
    );
    const all = products.filter((p) => p.brand === "Logitech").map((p) => p.id);
    for (const id of all) expect(covered.has(id), `uncovered: ${id}`).toBe(true);
  });
});

describe("vcRoomGuides content policy", () => {
  it("contains no authorization/partner/certification/Samsung wording", () => {
    expect(BANNED.test(JSON.stringify(vcRoomGuides))).toBe(false);
  });

  it("the two platform guides share no identical section or faq text", () => {
    const [teams, zoom] = ["microsoft-teams-rooms", "zoom-rooms"].map(
      (s) => getVcRoomGuide(s)!
    );
    const strings = (g: typeof teams) => [
      g.intro,
      ...g.sections.flatMap((s) => [s.heading, s.body]),
      ...g.faqs.flatMap((f) => [f.q, f.a]),
    ];
    const overlap = strings(teams).filter((s) => strings(zoom).includes(s));
    expect(overlap).toEqual([]);
  });
});
