import { describe, it, expect } from "vitest";
import { modelCodesForProduct, modelCodeFor, REPRESENTATIVE_MODEL_CODE } from "@/lib/modelCodes";

describe("modelCodesForProduct", () => {
  it("derives one code per screen size for a size-encoded series", () => {
    // rep is LH65WAFPLGCXXL; the "65" is a real diagonal, so every size expands
    const codes = modelCodesForProduct("samsung-interactive-wafx-p", ["65", "75", "86"]);
    expect(codes).toContain("LH65WAFPLGCXXL"); // representative
    expect(codes).toContain("LH75WAFPLGCXXL");
    expect(codes).toContain("LH86WAFPLGCXXL");
  });

  it("does NOT fabricate codes when the code's digits aren't a screen size (The Wall)", () => {
    // rep LH012MPFAAA encodes pixel pitch, not diagonal; sizes are 110/130/146
    const codes = modelCodesForProduct("samsung-the-wall-mpf", ["110", "130", "146"]);
    expect(codes).toEqual(["LH012MPFAAA"]);
  });

  it("does NOT fabricate codes for All-in-One LED (LH008…)", () => {
    const codes = modelCodesForProduct("samsung-all-in-one-led-iab", ["110", "146"]);
    expect(codes).toEqual(["LH008IABMUS"]);
  });

  it("ignores non-numeric sizes like 'Custom' when expanding", () => {
    const codes = modelCodesForProduct("samsung-qet-series", ["43", "Custom"]);
    expect(codes).toContain("LH43QETELGCXXL");
    expect(codes.every((c) => /^LH\d+QETELGCXXL$/.test(c))).toBe(true);
  });

  it("returns an empty list for a product with no known code", () => {
    expect(modelCodesForProduct("does-not-exist", ["55"])).toEqual([]);
  });

  it("does NOT substitute sizes for a product that bundles multiple sub-series (Outdoor OH)", () => {
    // rep LH75OHAEBGBXXL is the OHA family (75"); 46"/55" are OHDX and 24" is
    // OHB per the product's own specGroups — not size variants of one SKU.
    const codes = modelCodesForProduct("samsung-outdoor-oh", ["24", "46", "55", "75"]);
    expect(codes).toEqual(["LH75OHAEBGBXXL"]);
  });

  it("has no two products sharing the same representative code", () => {
    // Regression guard for the hgu701f/hu7010f collision: a duplicate code
    // makes model-code search return two ambiguous, indistinguishable hits.
    const codes = Object.values(REPRESENTATIVE_MODEL_CODE);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("hu7010f has no code until its real one is sourced (was mis-assigned hgu701f's)", () => {
    expect(modelCodeFor("samsung-hotel-tv-hu7010f")).toBeUndefined();
    expect(modelCodeFor("samsung-hotel-tv-hgu701f")).toBe("HG43U701FAULXL");
  });
});
