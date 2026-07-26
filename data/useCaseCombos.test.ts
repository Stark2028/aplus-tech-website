import { describe, it, expect } from "vitest";
import { useCaseCombos } from "./useCaseCombos";
import { solutions } from "./solutions";
import { productCategories } from "./categories";
import { products } from "./products";

const BANNED = /authoriz|partner|certif|samsung/i;
const byId = new Map(products.map((p) => [p.id, p]));

describe("useCaseCombos integrity", () => {
  it("every combo references a real industry and category", () => {
    for (const c of useCaseCombos) {
      expect(solutions.some((s) => s.slug === c.industry), c.industry).toBe(true);
      expect(productCategories.some((p) => p.id === c.category), c.category).toBe(true);
    }
  });

  it("has unique industry+category pairs", () => {
    const keys = useCaseCombos.map((c) => `${c.industry}/${c.category}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every curated productId resolves inside the combo's category", () => {
    for (const c of useCaseCombos) {
      const cat = productCategories.find((p) => p.id === c.category)!;
      for (const id of c.productIds ?? []) {
        const p = byId.get(id);
        expect(p, `${c.industry}/${c.category} -> ${id}`).toBeDefined();
        expect(p!.category).toBe(cat.name);
      }
    }
  });

  it("every combo has 4+ use cases and 3+ faqs", () => {
    for (const c of useCaseCombos) {
      expect(c.useCases.length).toBeGreaterThanOrEqual(4);
      expect(c.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("video-conferencing combos content policy", () => {
  const vc = useCaseCombos.filter((c) => c.category === "video-conferencing");

  it("has exactly 3 VC combos: corporate, education, hospitality", () => {
    expect(vc.map((c) => c.industry).sort()).toEqual([
      "corporate",
      "education",
      "hospitality",
    ]);
  });

  it("carries curated productIds and no banned wording", () => {
    for (const c of vc) {
      expect(c.productIds?.length, c.industry).toBeGreaterThan(0);
      expect(BANNED.test(JSON.stringify(c)), c.industry).toBe(false);
    }
  });
});
