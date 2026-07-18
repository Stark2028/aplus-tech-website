/**
 * Quick-send links (spec §4.1 A) — the cheap half of "send me the spec sheet".
 *
 * The site already produces every asset the salesperson wants to send, so the
 * console can send a LINK rather than a file: no Storage write, no egress, and
 * the visitor lands back on-site where the lead gate and PostHog still apply.
 *
 * Spec sheets are built client-side (pdf-lib in SpecSheetButton), so there is no
 * PDF URL to link to — a spec-sheet link points at the PDP with ?download=spec,
 * which SpecSheetButton picks up and fires on mount.
 *
 * URLs are ABSOLUTE: a link message is also inlined into the offline-customer
 * reply email (spec §6.3), where a relative path would be dead.
 */

import { products, type Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { ChatLink } from "./types";

const DEFAULT_SITE_URL = "https://www.aplustechsol.com";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function buildProductLink(product: Product): ChatLink {
  return {
    url: `${siteUrl()}/products/${product.id}`,
    label: product.name,
    kind: "product",
  };
}

export function buildSpecSheetLink(product: Product): ChatLink {
  return {
    url: `${siteUrl()}/products/${product.id}?download=spec`,
    label: `${product.name} — spec sheet (PDF)`,
    kind: "specSheet",
  };
}

export function buildCategoryLink(category: ProductCategory): ChatLink {
  return {
    url: `${siteUrl()}/categories/${category.id}`,
    label: `${category.name} range`,
    kind: "category",
  };
}

export function buildCatalogueLink(): ChatLink {
  return {
    url: `${siteUrl()}/products`,
    label: "Full Samsung catalogue",
    kind: "catalogue",
  };
}

/** Catalogue search behind the console's LinkPicker. Name, series, category. */
export function searchCatalogue(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: Product[] = [];
  for (const product of products) {
    const haystack = `${product.name} ${product.series} ${product.category} ${product.subCategory ?? ""}`.toLowerCase();
    if (haystack.includes(q)) hits.push(product);
    if (hits.length >= limit) break;
  }
  return hits;
}
