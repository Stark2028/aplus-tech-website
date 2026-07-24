import type { Product } from "@/data/products";
import type { City } from "@/data/cities";
import { cities } from "@/data/cities";
import { productCategories } from "@/data/categories";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { byLatestThenPopularity } from "@/lib/productSort";

/**
 * Builds the "Popular Samsung displays" grid for a city landing page.
 *
 * Every city page used to render one module-level `FEATURED` constant — the top
 * 8 of the catalog — which created two problems:
 *
 *  1. LINK EQUITY. Those 8 products absorbed every inbound link from all 122
 *     city pages; the other ~45 showcase products got none from this surface.
 *     Same hoarding shape as the old `.slice(0, 6)` city rail.
 *  2. DUPLICATE CONTENT. The grid is the largest block on the page, so 122 city
 *     pages shipped a near-identical body — a doorway-page signal.
 *
 * The grid is now walked per city: categories are round-robined (so no page is
 * all LED, all TV, etc.) and each category's own list is entered at an offset
 * derived from the city's position in `cities`. Deterministic, so static builds
 * stay stable.
 *
 * This makes NO claim about the city — which Samsung model is shown in Bikaner
 * versus Kota is merchandising, not a fact about either place. City-specific
 * assertions stay confined to the client-reviewed `intro` and the FAQ.
 */
/**
 * The whole showcase catalog in one category-stratified order.
 *
 * Each category's products are spread evenly across the full list by ranking
 * every product on its *fractional* position within its own category, so any
 * run of consecutive entries samples categories in proportion to their size.
 * A naive round-robin instead exhausts the small categories first and leaves a
 * single-category tail (all Digital Signage), which would hand some cities a
 * one-category grid.
 */
const STRATIFIED: Product[] = productCategories
  .map((cat) =>
    showcaseProducts.filter((p) => p.category === cat.name).sort(byLatestThenPopularity)
  )
  .filter((pool) => pool.length > 0)
  .flatMap((pool, poolIndex) =>
    pool.map((product, i) => ({
      product,
      // +0.5 centres each item in its slice so two equal-length pools interleave
      // instead of colliding; poolIndex is a stable tiebreak.
      key: (i + 0.5) / pool.length,
      poolIndex,
    }))
  )
  .sort((a, b) => a.key - b.key || a.poolIndex - b.poolIndex)
  .map((r) => r.product);

export function cityProducts(city: City, limit = 8): Product[] {
  const total = STRATIFIED.length;
  if (total === 0) return [];

  const idx = Math.max(
    0,
    cities.findIndex((c) => c.slug === city.slug)
  );

  // Walk the stratified catalog as a ring, advancing a full page per city, so
  // every product lands in the same number of city grids (±1).
  const start = (idx * limit) % total;
  const out: Product[] = [];
  for (let k = 0; k < limit && k < total; k++) {
    out.push(STRATIFIED[(start + k) % total]);
  }
  return out;
}
