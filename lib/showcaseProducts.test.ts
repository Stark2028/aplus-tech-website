import { describe, it, expect } from "vitest";
import { products } from "@/data/products";
import { showcaseProducts, isShowcased } from "@/lib/showcaseProducts";
import { computeSearchResults } from "@/lib/searchResults";
import sitemap from "@/app/sitemap";

// The exact set the business asked us to stop showcasing (outdated / not in
// production) while keeping their pages live for SEO + direct search. If a
// product is added to or removed from `discontinued` in data/products.ts,
// update this list — the mismatch is the point: it forces a conscious change.
const DISCONTINUED_IDS = [
  "samsung-videowall-vmb-r",
  "samsung-vmb-e",
  "samsung-vh55r",
  "samsung-vhb-e",
  "samsung-interactive-wac",
  "samsung-interactive-wad",
  "samsung-flip-2",
  "samsung-hotel-tv-hg55au800t",
  "samsung-hotel-tv-hg55au700f",
  "samsung-business-tv-bec-h",
  "samsung-business-tv-bea-h",
  "samsung-business-tv-bed-h",
];

describe("discontinued products — hidden from browse, kept for SEO/search", () => {
  it("marks exactly the intended products discontinued", () => {
    const flagged = products.filter((p) => p.discontinued).map((p) => p.id).sort();
    expect(flagged).toEqual([...DISCONTINUED_IDS].sort());
  });

  it("excludes every discontinued product from the showcase list", () => {
    const showcaseIds = new Set(showcaseProducts.map((p) => p.id));
    for (const id of DISCONTINUED_IDS) {
      expect(showcaseIds.has(id)).toBe(false);
    }
  });

  it("keeps every live product in the showcase list", () => {
    const live = products.filter((p) => !p.discontinued);
    expect(showcaseProducts).toHaveLength(live.length);
    expect(showcaseProducts.every(isShowcased)).toBe(true);
  });

  it("keeps discontinued products in the raw catalog (detail page still builds)", () => {
    const allIds = new Set(products.map((p) => p.id));
    for (const id of DISCONTINUED_IDS) {
      expect(allIds.has(id)).toBe(true);
    }
  });

  it("still finds a discontinued product via on-site search", () => {
    // Search by model/series text — the whole reason we don't delete these.
    const results = computeSearchResults("BEC-H");
    expect(results.some((r) => r.id === "samsung-business-tv-bec-h")).toBe(true);
  });

  it("keeps discontinued product URLs in the sitemap (still indexable)", () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const id of DISCONTINUED_IDS) {
      expect(urls.has(`https://www.aplustechsol.com/products/${id}`)).toBe(true);
    }
  });
});
