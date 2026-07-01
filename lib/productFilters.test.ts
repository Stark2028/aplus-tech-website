import { describe, it, expect } from "vitest";
import type { Product } from "@/data/products";
import { applyFilters, DEFAULT_FILTERS, SIZE_BUCKETS } from "@/lib/productFilters";

// Minimal product with just the sizes the filter reads.
const p = (id: string, sizes: string[]): Product =>
  ({ id, specs: { resolution: "", brightness: "", operationTime: "", screenSizes: sizes } } as Product);

const withBucket = (label: string) => ({ ...DEFAULT_FILTERS, sizeBucket: label });

describe("size bucket filter", () => {
  it("exposes the five buckets in order", () => {
    expect(SIZE_BUCKETS.map((b) => b.label)).toEqual([
      'Below 43"', '43"+', '55"+', '75"+', '98"+',
    ]);
  });

  it("'Below 43\"' matches only sizes under 43", () => {
    const out = applyFilters([p("a", ["32"]), p("b", ["43"]), p("c", ["55"])], withBucket('Below 43"'));
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });

  it("'43\"+' matches 43 to under 55 (half-open)", () => {
    const out = applyFilters([p("a", ["32"]), p("b", ["43"]), p("c", ["50"]), p("d", ["55"])], withBucket('43"+'));
    expect(out.map((x) => x.id)).toEqual(["b", "c"]);
  });

  it("'98\"+' matches 98 and above", () => {
    const out = applyFilters([p("a", ["85"]), p("b", ["98"]), p("c", ["146"])], withBucket('98"+'));
    expect(out.map((x) => x.id)).toEqual(["b", "c"]);
  });

  it("uses the product's LARGEST size when it lists several", () => {
    // A product offered in 43"–85" should satisfy 75"+ via its 85" option.
    const out = applyFilters([p("multi", ["43", "55", "85"])], withBucket('75"+'));
    expect(out.map((x) => x.id)).toEqual(["multi"]);
  });

  it("excludes products with no numeric size when a bucket is set", () => {
    const out = applyFilters([p("custom", ["Custom"])], withBucket('55"+'));
    expect(out).toEqual([]);
  });

  it("no bucket selected → size does not filter", () => {
    const items = [p("a", ["32"]), p("b", ["146"])];
    expect(applyFilters(items, DEFAULT_FILTERS)).toHaveLength(2);
  });
});
