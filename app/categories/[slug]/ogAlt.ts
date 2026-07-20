import type { ProductCategory } from "@/data/categories";

/** Category OG image alt text. Video Conferencing (Logitech) and Education (Class Saathi / TagHive) must carry no Samsung wording. */
export function categoryOgAltFor(category: Pick<ProductCategory, "id" | "navLabel">): string {
  return category.id === "video-conferencing" || category.id === "education"
    ? `${category.navLabel} — Aplus Technology Solutions`
    : "Samsung Commercial Display Category — Aplus Technology Solutions";
}
