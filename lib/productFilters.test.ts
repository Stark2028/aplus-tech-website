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

function fovProduct(over: Partial<Product>): Product {
  return {
    id: over.id ?? "x", name: "n", category: over.category ?? "Digital Signage",
    series: "s", description: "d", features: ["f"],
    specs: {
      resolution: over.specs?.resolution ?? "4K UHD",
      brightness: over.specs?.brightness ?? "500 nit",
      screenSizes: over.specs?.screenSizes ?? ["55"],
      operationTime: over.specs?.operationTime ?? "24/7",
    },
    images: [], ...over,
  } as Product;
}

describe("applyFilters — FOV must not false-match a nit band", () => {
  it("excludes a '113° FOV' VC product from the 'Under 350 nit' band (not a match)", () => {
    const fov = fovProduct({ id: "fov", specs: { resolution: "4K UHD", brightness: "113° FOV", screenSizes: [], operationTime: "Huddle Rooms" } });
    const out = applyFilters([fov], { ...DEFAULT_FILTERS, brightness: "Under 350 nit" });
    expect(out).toHaveLength(0);
  });

  it("still bands a genuine nit value correctly", () => {
    const nit = fovProduct({ id: "nit", specs: { resolution: "FHD", brightness: "350 nit", screenSizes: ["65"], operationTime: "Large Rooms" } });
    const out = applyFilters([nit], { ...DEFAULT_FILTERS, brightness: "350–500 nit" });
    expect(out).toHaveLength(1);
  });
});
