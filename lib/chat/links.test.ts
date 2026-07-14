import { describe, it, expect } from "vitest";
import {
  buildProductLink,
  buildSpecSheetLink,
  buildCategoryLink,
  buildCatalogueLink,
  searchCatalogue,
  siteUrl,
} from "./links";
import { products } from "@/data/products";
import { getCategoryById } from "@/data/categories";

const product = products[0];

describe("link builders", () => {
  it("builds a product link pointing at the PDP", () => {
    expect(buildProductLink(product)).toEqual({
      url: `${siteUrl()}/products/${product.id}`,
      label: product.name,
      kind: "product",
    });
  });

  it("builds a spec-sheet link that auto-triggers the PDP download", () => {
    const link = buildSpecSheetLink(product);
    expect(link.url).toBe(`${siteUrl()}/products/${product.id}?download=spec`);
    expect(link.kind).toBe("specSheet");
    expect(link.label).toContain("spec sheet");
  });

  it("builds a category link", () => {
    const category = getCategoryById("video-walls")!;
    expect(buildCategoryLink(category)).toEqual({
      url: `${siteUrl()}/categories/video-walls`,
      label: `${category.name} range`,
      kind: "category",
    });
  });

  it("builds the full-catalogue link", () => {
    expect(buildCatalogueLink()).toEqual({
      url: `${siteUrl()}/products`,
      label: "Full Samsung catalogue",
      kind: "catalogue",
    });
  });

  it("emits absolute URLs — a chat link may be opened from an email", () => {
    for (const link of [buildProductLink(product), buildSpecSheetLink(product), buildCatalogueLink()]) {
      expect(link.url.startsWith("https://")).toBe(true);
    }
  });
});

describe("searchCatalogue", () => {
  it("matches on product name, case-insensitively", () => {
    const hits = searchCatalogue(product.name.toLowerCase());
    expect(hits.map((p) => p.id)).toContain(product.id);
  });

  it("matches on series and on category", () => {
    expect(searchCatalogue(product.series).length).toBeGreaterThan(0);
    expect(searchCatalogue("video wall").length).toBeGreaterThan(0);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchCatalogue("")).toEqual([]);
    expect(searchCatalogue("   ")).toEqual([]);
  });

  it("caps the number of results", () => {
    expect(searchCatalogue("samsung", 3)).toHaveLength(3);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchCatalogue("zzzznotathing")).toEqual([]);
  });
});
