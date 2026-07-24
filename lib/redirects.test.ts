import { describe, it, expect } from "vitest";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  MERGED_PRODUCT_TO_CANONICAL,
} from "@/lib/redirects";

const productIds = new Set(products.map((p) => p.id));
const categoryIds = new Set(productCategories.map((c) => c.id));

// Mirrors RESERVED_ROOTS in middleware.ts. A redirect target whose first segment
// is NOT reserved would be re-matched by the middleware and could redirect again.
const RESERVED_ROOTS = new Set([
  "products", "categories", "solutions", "blogs", "product-finder",
  "compare", "quote", "about", "contact", "privacy", "terms", "api", "locations",
]);

describe("legacy WordPress redirects", () => {
  it("every product-slug target is a live product id", () => {
    const dead = Object.entries(OLD_PRODUCT_SLUG_TO_ID)
      .filter(([, id]) => !productIds.has(id))
      .map(([slug, id]) => `${slug} -> ${id}`);
    // A target that no longer exists 301s Google straight into a 404, throwing
    // away the ranking equity the redirect layer exists to preserve.
    expect(dead).toEqual([]);
  });

  it("every category-root target is a live category id", () => {
    const dead = Object.entries(OLD_CATEGORY_ROOT_TO_ID)
      .filter(([, id]) => !categoryIds.has(id as never))
      .map(([slug, id]) => `${slug} -> ${id}`);
    expect(dead).toEqual([]);
  });

  it("no redirect target lands somewhere the middleware would redirect again", () => {
    const targets = [
      ...Object.values(OLD_PRODUCT_SLUG_TO_ID).map((id) => `/products/${id}`),
      ...Object.values(OLD_CATEGORY_ROOT_TO_ID).map((id) => `/categories/${id}`),
      ...Object.values(OLD_EXACT_PATH_TO_NEW),
    ];
    const loopable = targets.filter((t) => {
      const first = t.split("/").filter(Boolean)[0];
      return first !== undefined && !RESERVED_ROOTS.has(first);
    });
    expect(loopable).toEqual([]);
  });
});

describe("merged duplicate products", () => {
  it("every merged-away product is really gone from the catalog", () => {
    const stillPresent = Object.keys(MERGED_PRODUCT_TO_CANONICAL).filter((id) =>
      productIds.has(id)
    );
    // If it still exists, we have two live pages for one Samsung display again —
    // and the middleware would redirect a page that renders fine.
    expect(stillPresent).toEqual([]);
  });

  it("every surviving twin actually exists", () => {
    const missing = Object.entries(MERGED_PRODUCT_TO_CANONICAL)
      .filter(([, id]) => !productIds.has(id))
      .map(([from, to]) => `${from} -> ${to}`);
    expect(missing).toEqual([]);
  });

  it("cannot loop: no survivor is itself a merged-away id", () => {
    const removed = new Set(Object.keys(MERGED_PRODUCT_TO_CANONICAL));
    const looping = Object.values(MERGED_PRODUCT_TO_CANONICAL).filter((id) =>
      removed.has(id)
    );
    expect(looping).toEqual([]);
  });

  it("no old WordPress slug still points at a merged-away product", () => {
    const removed = new Set(Object.keys(MERGED_PRODUCT_TO_CANONICAL));
    // These would still resolve (via a second 301 hop), but chaining redirects
    // leaks link equity and slows crawling — point them straight at the survivor.
    const chained = Object.entries(OLD_PRODUCT_SLUG_TO_ID)
      .filter(([, id]) => removed.has(id))
      .map(([slug, id]) => `${slug} -> ${id}`);
    expect(chained).toEqual([]);
  });
});
