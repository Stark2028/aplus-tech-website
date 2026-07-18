import type { ProductCategory } from "@/data/categories";

/** Category OG image alt text. The Video Conferencing category is Logitech and must carry no Samsung wording. */
export function categoryOgAltFor(category: Pick<ProductCategory, "id" | "navLabel">): string {
  return category.id === "video-conferencing"
    ? `${category.navLabel} — Aplus Technology Solutions`
    : "Samsung Commercial Display Category — Aplus Technology Solutions";
}
