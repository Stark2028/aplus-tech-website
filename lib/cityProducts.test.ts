import { describe, it, expect } from "vitest";
import { cities, getCityBySlug } from "@/data/cities";
import { cityProducts } from "@/lib/cityProducts";
import { showcaseProducts } from "@/lib/showcaseProducts";

const LIMIT = 8;

describe("cityProducts", () => {
  it("returns the requested count for every city", () => {
    const short = cities.filter((c) => cityProducts(c, LIMIT).length !== LIMIT);
    expect(short.map((c) => c.slug)).toEqual([]);
  });

  it("never repeats a product within one city grid", () => {
    const bad = cities.filter((c) => {
      const g = cityProducts(c, LIMIT);
      return new Set(g.map((p) => p.id)).size !== g.length;
    });
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it("never showcases a discontinued product", () => {
    const showcaseIds = new Set(showcaseProducts.map((p) => p.id));
    const bad = cities.filter((c) =>
      cityProducts(c, LIMIT).some((p) => !showcaseIds.has(p.id))
    );
    expect(bad.map((c) => c.slug)).toEqual([]);
  });

  it("mixes categories rather than filling a page from one", () => {
    for (const c of cities) {
      const cats = new Set(cityProducts(c, LIMIT).map((p) => p.category));
      expect(cats.size).toBeGreaterThanOrEqual(3);
    }
  });

  // The regression this module exists for: the old module-level `FEATURED`
  // constant pointed all 122 city pages at the same 8 products, so the rest of
  // the catalog received zero inbound links from the city surface.
  it("spreads inbound links across the whole showcase catalog", () => {
    const inbound = new Map<string, number>(showcaseProducts.map((p) => [p.id, 0]));
    for (const c of cities) {
      for (const p of cityProducts(c, LIMIT)) {
        inbound.set(p.id, (inbound.get(p.id) ?? 0) + 1);
      }
    }
    const counts = [...inbound.values()];
    // No showcase product is orphaned by this surface.
    expect(Math.min(...counts)).toBeGreaterThan(0);
    // And no small clique hoards the links: the busiest product must not exceed
    // 4x the mean. (The old implementation had 8 products at 122 and the rest 0.)
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    expect(Math.max(...counts)).toBeLessThanOrEqual(mean * 4);
  });

  it("gives neighbouring cities different grids", () => {
    const a = cityProducts(getCityBySlug("jaipur")!, LIMIT).map((p) => p.id);
    const b = cityProducts(getCityBySlug("kota")!, LIMIT).map((p) => p.id);
    expect(a).not.toEqual(b);
  });

  it("is deterministic across calls", () => {
    const a = cityProducts(getCityBySlug("mumbai")!, LIMIT).map((p) => p.id);
    const b = cityProducts(getCityBySlug("mumbai")!, LIMIT).map((p) => p.id);
    expect(a).toEqual(b);
  });
});
