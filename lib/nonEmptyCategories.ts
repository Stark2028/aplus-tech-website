import { products } from "@/data/products";
import { productCategories, type ProductCategory } from "@/data/categories";

/**
 * Categories with at least one catalog product. A zero-product category
 * (Education — its category page is a standalone landing, not a product grid)
 * keeps its navbar/sitemap presence but must render no chip, tab, or section
 * on product-listing surfaces.
 */
export const categoriesWithProducts: ProductCategory[] = productCategories.filter(
  (cat) => products.some((p) => p.category === cat.name)
);
