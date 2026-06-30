import { describe, it, expect } from "vitest";
import type { Product } from "@/data/products";
import { byLatestThenPopularity } from "@/lib/productSort";

// Minimal Product factory — only the fields the comparator reads.
const p = (id: string, popularity?: number, catalog2026?: boolean): Product =>
  ({ id, popularity, catalog2026 } as Product);

describe("byLatestThenPopularity", () => {
  it("ranks a latest product above a higher-popularity non-latest one", () => {
    const sorted = [p("old", 99, false), p("latest", 10, true)].sort(byLatestThenPopularity);
    expect(sorted[0].id).toBe("latest");
  });

  it("within the latest group, higher popularity wins", () => {
    const sorted = [p("a", 80, true), p("b", 90, true)].sort(byLatestThenPopularity);
    expect(sorted[0].id).toBe("b");
  });

  it("within the non-latest group, higher popularity wins", () => {
    const sorted = [p("a", 80, false), p("b", 90, false)].sort(byLatestThenPopularity);
    expect(sorted[0].id).toBe("b");
  });

  it("treats missing popularity / flag as 0 / false without throwing", () => {
    const sorted = [p("a"), p("b", 5, false)].sort(byLatestThenPopularity);
    expect(sorted[0].id).toBe("b");
  });
});
