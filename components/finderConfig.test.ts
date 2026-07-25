import { describe, expect, it } from "vitest";
import {
  availableSizeRangeIds,
  categoryEnabledForIndustry,
  DISPLAY_TYPES,
  INDUSTRY_CATEGORY_SCORE,
  SIZE_RANGES,
  USE_CASE_PRESETS,
} from "./finderConfig";

// These tests run against the real catalog in data/products — they pin the
// wizard's gating to the shipped product data, mirroring productFilters.test.ts.

describe("categoryEnabledForIndustry", () => {
  it("disables Commercial TV for education and retail (score 0)", () => {
    expect(categoryEnabledForIndustry("Commercial TV", "education")).toBe(false);
    expect(categoryEnabledForIndustry("Commercial TV", "retail")).toBe(false);
  });

  it("enables Commercial TV for hospitality and corporate", () => {
    expect(categoryEnabledForIndustry("Commercial TV", "hospitality")).toBe(true);
    expect(categoryEnabledForIndustry("Commercial TV", "corporate")).toBe(true);
  });

  it("enables LED Signage for retail/hospitality/corporate, disables for education", () => {
    expect(categoryEnabledForIndustry("LED Signage", "retail")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "hospitality")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "corporate")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "education")).toBe(false);
  });

  it('disables nothing real when industry is "any" or empty', () => {
    for (const category of ["Digital Signage", "Video Wall", "Interactive Display", "Commercial TV", "LED Signage"]) {
      expect(categoryEnabledForIndustry(category, "any")).toBe(true);
      expect(categoryEnabledForIndustry(category, "")).toBe(true);
    }
  });

  it("disables a category with zero products even if scored", () => {
    // No product carries this category, so even industry "any" disables it.
    expect(categoryEnabledForIndustry("Nonexistent Category", "any")).toBe(false);
    expect(categoryEnabledForIndustry("Nonexistent Category", "hospitality")).toBe(false);
  });

  it("has a score entry for every category in every industry (no accidental gaps)", () => {
    for (const industry of ["hospitality", "corporate", "education", "retail"] as const) {
      for (const category of ["Digital Signage", "Video Wall", "Interactive Display", "Commercial TV", "LED Signage"]) {
        expect(INDUSTRY_CATEGORY_SCORE[industry][category]).toBeTypeOf("number");
      }
    }
  });
});

describe("availableSizeRangeIds", () => {
  const allIds = SIZE_RANGES.map((r) => r.id);

  it('LED Signage (110–165") is only Extra Large', () => {
    expect([...availableSizeRangeIds("LED Signage")].sort()).toEqual(["xlarge"]);
  });

  it('Video Wall (46"/55") is only Compact + Standard', () => {
    expect([...availableSizeRangeIds("Video Wall")].sort()).toEqual(["medium", "small"]);
  });

  it("Digital Signage covers all four buckets", () => {
    const ids = availableSizeRangeIds("Digital Signage");
    for (const id of allIds) expect(ids.has(id)).toBe(true);
  });

  it("Interactive Display and Commercial TV exclude Extra Large", () => {
    for (const category of ["Interactive Display", "Commercial TV"]) {
      const ids = availableSizeRangeIds(category);
      expect(ids.has("xlarge")).toBe(false);
      expect(ids.has("medium")).toBe(true);
    }
  });

  it("returns an empty set for an unknown category", () => {
    expect(availableSizeRangeIds("Nonexistent Category").size).toBe(0);
  });
});

describe("USE_CASE_PRESETS integrity", () => {
  it("has valid industry, category, and sizeRangeId for every preset", () => {
    const categoryIds = DISPLAY_TYPES.map((d) => d.id);
    const validIndustries = ["hospitality", "corporate", "education", "retail"];

    expect(USE_CASE_PRESETS.length).toBeGreaterThan(0);

    for (const preset of USE_CASE_PRESETS) {
      expect(validIndustries).toContain(preset.industry);
      expect(categoryIds).toContain(preset.category);
      if (preset.sizeRangeId !== "") {
        const availableSizes = availableSizeRangeIds(preset.category);
        expect(availableSizes.has(preset.sizeRangeId)).toBe(true);
      }
    }
  });
});
