import { describe, it, expect } from "vitest";
import { computeSearchResults } from "@/lib/searchResults";

describe("computeSearchResults — model-code search", () => {
  it("finds a product by its exact representative model code", () => {
    const results = computeSearchResults("LH65WAFPLGCXXL");
    const hit = results.find((r) => r.id === "samsung-interactive-wafx-p");
    expect(hit).toBeDefined();
    expect(hit?.subtitle).toBe("Model LH65WAFPLGCXXL");
  });

  it("finds a product by a derived size-variant code we don't store literally", () => {
    const results = computeSearchResults("LH75WAFPLGCXXL");
    const hit = results.find((r) => r.id === "samsung-interactive-wafx-p");
    expect(hit).toBeDefined();
    expect(hit?.subtitle).toBe("Model LH75WAFPLGCXXL");
  });

  it("matches case-insensitively and ignores separators", () => {
    const results = computeSearchResults("lh65-wafp");
    expect(results.some((r) => r.id === "samsung-interactive-wafx-p")).toBe(true);
  });

  it("still matches products by name/series text", () => {
    const results = computeSearchResults("WAFX-P");
    expect(results.some((r) => r.id === "samsung-interactive-wafx-p")).toBe(true);
  });

  it("does not treat a short numeric query like a model code", () => {
    // "65" is < 4 chars → code matching is skipped, so nothing surfaces as a
    // "Model …" hit purely because its SKU contains 65.
    const results = computeSearchResults("65");
    expect(results.every((r) => !r.subtitle.startsWith("Model "))).toBe(true);
  });

  it("does not fabricate an OHA-branded code for the OHDX/OHB sizes of Outdoor OH", () => {
    // 46"/55" belong to the OHDX sub-series and 24" to OHB, not the 75" OHA
    // family the representative code encodes — substitution must not run.
    const results = computeSearchResults("LH46OHAEBGBXXL");
    expect(results.some((r) => r.id === "samsung-outdoor-oh")).toBe(false);
  });

  it("returns only the surviving product for the code that used to collide", () => {
    // hgu701f and hu7010f both claimed HG43U701FAULXL because they were the same
    // TV; hgu701f was merged away, so the code now resolves to exactly one page.
    const results = computeSearchResults("HG43U701FAULXL");
    const hits = results.filter((r) => r.subtitle === "Model HG43U701FAULXL");
    expect(hits.map((r) => r.id)).toEqual(["samsung-hotel-tv-hu7010f"]);
  });
});
