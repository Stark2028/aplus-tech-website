import type { Product } from "@/data/products";

export type Brand = "Samsung" | "Logitech";

/** Resolve a product's brand. Absent brand means Samsung (the historical
 *  default): no existing entry sets the field, so Samsung behaviour is
 *  preserved everywhere without touching data. */
export function brandOf(product: Pick<Product, "brand">): Brand {
  return product.brand ?? "Samsung";
}

export function isLogitech(product: Pick<Product, "brand">): boolean {
  return brandOf(product) === "Logitech";
}

/** manufacturer node for Product JSON-LD, keyed by brand. */
export const BRAND_MANUFACTURER: Record<Brand, { name: string; url: string }> = {
  Samsung: { name: "Samsung Electronics Co., Ltd.", url: "https://www.samsung.com" },
  Logitech: { name: "Logitech International S.A.", url: "https://www.logitech.com" },
};

/** `brand` node name for Product JSON-LD, keyed by brand. */
export const BRAND_JSONLD_NAME: Record<Brand, string> = {
  Samsung: "Samsung",
  Logitech: "Logitech",
};
