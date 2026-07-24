import type { Product } from "@/data/products";
import type { Solution } from "@/data/solutions";
import { getCategoryById } from "@/data/categories";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { byLatestThenPopularity } from "@/lib/productSort";

/**
 * Builds the "Featured products" grid for an industry / solution page.
 *
 * Rule: the PRIMARY category (first in `solution.featuredCategories`) fills the
 * top row (up to PRIMARY_MAX), each SECONDARY category contributes up to
 * SECONDARY_MAX, and the whole list is capped at TOTAL. Within a category,
 * products are ordered newest-catalog-then-most-popular (byLatestThenPopularity).
 * Discontinued products are already excluded by `showcaseProducts`.
 *
 * This replaces the old `recommendedSeries` substring matching
 * (`p.series.includes(series)`), which over-matched — e.g. "VM" pulled in every
 * VMB/VMC/VHC video wall — and silently dropped series that had drifted out of
 * the live catalog.
 */
const PRIMARY_MAX = 4;
const SECONDARY_MAX = 2;
const TOTAL = 8;

export function featuredProductsForSolution(solution: Solution): Product[] {
  const out: Product[] = [];
  solution.featuredCategories.forEach((catId, index) => {
    const category = getCategoryById(catId);
    if (!category) return;
    const cap = index === 0 ? PRIMARY_MAX : SECONDARY_MAX;
    const inCategory = showcaseProducts
      .filter((p) => p.category === category.name)
      .sort(byLatestThenPopularity)
      .slice(0, cap);
    out.push(...inCategory);
  });
  return out.slice(0, TOTAL);
}
