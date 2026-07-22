import { describe, expect, it } from "vitest";
import { products } from "./products";
import { productIndex } from "./productIndex";

describe("productIndex", () => {
  it("contains an entry for every catalog product", () => {
    expect(Object.keys(productIndex).length).toBe(products.length);
    for (const p of products) {
      expect(productIndex[p.id]).toBeDefined();
    }
  });

  it("carries the fields the comparison UI renders", () => {
    const sample = productIndex[products[0].id];
    expect(sample.id).toBe(products[0].id);
    expect(sample.name).toBe(products[0].name);
    expect(Array.isArray(sample.images)).toBe(true);
  });

  it("stays a projection — it must not carry the heavy prose fields", () => {
    const sample = productIndex[products[0].id] as Record<string, unknown>;
    expect(sample.longDescription).toBeUndefined();
    expect(sample.specGroups).toBeUndefined();
    expect(sample.specs).toBeUndefined();
    expect(sample.features).toBeUndefined();
  });
});
