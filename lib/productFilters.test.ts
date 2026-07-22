import { describe, it, expect } from "vitest";
import type { Product } from "@/data/products";
import { products } from "@/data/products";
import {
  applyFilters,
  countActive,
  DEFAULT_FILTERS,
  parseBrightnessNit,
  SIZE_BUCKETS,
} from "@/lib/productFilters";

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

describe("parseBrightnessNit", () => {
  it("treats cd/m² as nits", () => {
    expect(parseBrightnessNit("450 cd/m²")).toBe(450);
    expect(parseBrightnessNit("400 cd/m2")).toBe(400);
  });

  it("ignores inch diagonals in parenthesised multi-value specs", () => {
    // Averages the NIT values only (250 & 500), not the inch numbers.
    expect(parseBrightnessNit('500 nit (13") / 250 nit (24")')).toBe(375);
    expect(parseBrightnessNit('300 nit (32") / up to 500 nit (43", 55", w/o glass)')).toBe(400);
  });

  it("still handles the simple cases", () => {
    expect(parseBrightnessNit("500 nit")).toBe(500);
    expect(parseBrightnessNit("700")).toBe(700);
    expect(parseBrightnessNit("")).toBeNull();
    expect(parseBrightnessNit("N/A")).toBeNull();
  });

  it("does not treat a field-of-view angle as nits", () => {
    expect(parseBrightnessNit("113° FOV")).toBeNull();
  });
});

describe("applyFilters — real catalog brightness regression", () => {
  it("bands a cd/m² panel (was excluded from every band before the fix)", () => {
    const out = applyFilters(products, { ...DEFAULT_FILTERS, brightness: "350–500 nit" });
    // samsung-interactive-wafx-p is "450 cd/m²" -> 450 -> [350,500)
    expect(out.map((p) => p.id)).toContain("samsung-interactive-wafx-p");
  });

  it("bands a multi-value panel on its nit values, not its inch diagonals", () => {
    // samsung-qbc-t is '500 nit (13") / 250 nit (24")' -> avg(250,500)=375 -> [350,500)
    const band = applyFilters(products, { ...DEFAULT_FILTERS, brightness: "350–500 nit" });
    expect(band.map((p) => p.id)).toContain("samsung-qbc-t");
    // ...and NOT mis-filed under "Under 350 nit" (the old bug filed it at 262).
    const under = applyFilters(products, { ...DEFAULT_FILTERS, brightness: "Under 350 nit" });
    expect(under.map((p) => p.id)).not.toContain("samsung-qbc-t");
  });
});

describe("resolution filter", () => {
  const r = (id: string, resolution: string): Product =>
    ({ id, specs: { resolution, brightness: "", operationTime: "", screenSizes: [] } } as Product);

  it("matches 4K UHD by keyword or pixel count", () => {
    const out = applyFilters([r("a", "4K UHD"), r("b", "3,840 x 2,160"), r("c", "FHD")], { ...DEFAULT_FILTERS, resolution: "4K UHD" });
    expect(out.map((x) => x.id)).toEqual(["a", "b"]);
  });

  it("matches Full HD by its several spellings", () => {
    const out = applyFilters([r("a", "FHD"), r("b", "1,920 x 1,080"), r("c", "Full HD"), r("d", "4K UHD")], { ...DEFAULT_FILTERS, resolution: "Full HD" });
    expect(out.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});

describe("operation filter", () => {
  const o = (id: string, operationTime: string): Product =>
    ({ id, specs: { resolution: "", brightness: "", operationTime, screenSizes: [] } } as Product);

  it("matches on substring so '16/7 (recommended)' still counts as 16/7", () => {
    const out = applyFilters([o("a", "16/7"), o("b", "24/7"), o("c", "16/7 (recommended)")], { ...DEFAULT_FILTERS, operation: "16/7" });
    expect(out.map((x) => x.id)).toEqual(["a", "c"]);
  });
});

describe("multi-facet AND semantics", () => {
  const full = (id: string, resolution: string, operationTime: string): Product =>
    ({ id, specs: { resolution, brightness: "500 nit", operationTime, screenSizes: ["55"] } } as Product);

  it("requires every active facet to match", () => {
    const items = [
      full("both", "4K UHD", "24/7"),
      full("resonly", "4K UHD", "16/7"),
      full("oponly", "FHD", "24/7"),
    ];
    const out = applyFilters(items, { ...DEFAULT_FILTERS, resolution: "4K UHD", operation: "24/7" });
    expect(out.map((x) => x.id)).toEqual(["both"]);
  });
});

describe("countActive", () => {
  it("counts only the set facets", () => {
    expect(countActive(DEFAULT_FILTERS)).toBe(0);
    expect(countActive({ ...DEFAULT_FILTERS, resolution: "4K UHD" })).toBe(1);
    expect(countActive({ brightness: "700 nit +", resolution: "4K UHD", operation: "24/7", sizeBucket: '55"+' })).toBe(4);
  });
});
