import type { Product } from "@/data/products";
import { isLogitech } from "@/lib/brand";

/** OG image alt text, brand-aware. Logitech gets a neutral, Samsung-free alt. */
export function ogAltFor(product: Pick<Product, "name" | "brand">): string {
  return isLogitech(product)
    ? `${product.name} — Aplus Technology Solutions`
    : "Samsung Commercial Display — Aplus Technology Solutions";
}
