import type { Product } from "@/data/products";

/**
 * Orders products "latest first": 2026-catalog products (catalog2026) come
 * before older ones, and within each group higher popularity comes first.
 *
 * Used by every product listing so ordering is identical everywhere. Sorting
 * is applied AFTER category filtering, so this produces a within-category
 * "latest first" order, not a global feed.
 */
export function byLatestThenPopularity(a: Product, b: Product): number {
  const latest = (a.catalog2026 ? 1 : 0) - (b.catalog2026 ? 1 : 0);
  if (latest !== 0) return -latest; // latest (1) should come first → negative
  return (b.popularity || 0) - (a.popularity || 0);
}
