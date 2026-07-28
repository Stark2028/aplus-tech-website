import { describe, it, expect } from "vitest";
import { modelCodeRows } from "./modelCodeTable";
import { products } from "@/data/products";

describe("modelCodeRows", () => {
  const rows = modelCodeRows();

  it("returns a row only for products that have a real code", () => {
    expect(rows.length).toBeGreaterThan(30);
    for (const r of rows) expect(r.code).toMatch(/^[A-Z0-9]+$/);
  });

  it("links every row to a product that exists", () => {
    const ids = new Set(products.map((p) => p.id));
    for (const r of rows) expect(ids.has(r.id), `${r.id} not in catalogue`).toBe(true);
  });

  it("never emits an empty name or category", () => {
    for (const r of rows) {
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.category.length).toBeGreaterThan(0);
    }
  });

  it("is sorted by category then name for stable rendering", () => {
    const keys = rows.map((r) => `${r.category}|${r.name}`);
    expect(keys).toEqual([...keys].sort());
  });
});
