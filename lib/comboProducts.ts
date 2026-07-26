import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { Solution } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { byLatestThenPopularity } from "@/lib/productSort";

export interface ComboProducts {
  products: Product[];
  /** True when neither curated ids nor the series match produced anything. */
  usedFallback: boolean;
}

/**
 * Resolve the product list for an industry+category combo, in precedence order:
 *
 *   1. combo.productIds — hand-curated, order preserved
 *   2. solution.recommendedSeries substring match on product.series
 *   3. fallback: the category's top products
 *
 * Ids that do not resolve, or resolve to a product outside the combo's
 * category, are dropped rather than trusted — a typo must not surface a
 * Samsung panel on a Logitech page.
 */
export function resolveComboProducts(
  combo: UseCaseCombo,
  category: ProductCategory,
  solution: Solution
): ComboProducts {
  const inCategory = showcaseProducts.filter((p) => p.category === category.name);

  if (combo.productIds?.length) {
    const byId = new Map(inCategory.map((p) => [p.id, p]));
    const curated = combo.productIds
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p));
    if (curated.length > 0) return { products: curated, usedFallback: false };
  }

  const matched = inCategory
    .filter((p) => solution.recommendedSeries.some((s) => p.series.includes(s)))
    .sort(byLatestThenPopularity);
  if (matched.length > 0) return { products: matched.slice(0, 8), usedFallback: false };

  return {
    products: [...inCategory].sort(byLatestThenPopularity).slice(0, 4),
    usedFallback: true,
  };
}
