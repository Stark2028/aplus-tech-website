import type { Product } from "@/data/products";
import { isLogitech } from "@/lib/brand";

/** Top-bar badge text on the product OG share image. Samsung keeps the
 *  authorized-partner claim; Logitech shows a neutral product-line label
 *  (positioning rule: no authorized/partner/certified near Logitech). */
export function ogBadgeLabel(product: Pick<Product, "brand" | "category">): string {
  return isLogitech(product) ? "Logitech Video Conferencing" : "Authorized Samsung Partner";
}
