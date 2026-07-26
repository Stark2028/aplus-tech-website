import type { ProductCategory } from "@/data/categories";
import type { Crumb } from "@/lib/jsonLd";

/**
 * Breadcrumb trail for a nested category page. Four levels, because both
 * parents (the category page and the Class Saathi landing) put /products at
 * level two — a shorter child trail would contradict its own parent's
 * BreadcrumbList. The visible nav and the JSON-LD must both use this.
 */
export function subPageCrumbs(
  category: ProductCategory,
  sub: { slug: string; navLabel: string }
): Crumb[] {
  return [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: category.navLabel, url: `/categories/${category.id}` },
    { name: sub.navLabel, url: `/categories/${category.id}/${sub.slug}` },
  ];
}
