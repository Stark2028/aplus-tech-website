import { getCategoryByName } from "@/data/categories";

/**
 * Product-finder option config + pure helpers, extracted so the
 * URL-building and size-bucketing logic is unit-testable in isolation.
 * `DISPLAY_TYPES[].id` is the canonical category NAME (matches Product.category);
 * the UI layer in ProductFinderSection re-attaches the icons.
 */
export const DISPLAY_TYPES = [
  { id: "Digital Signage", label: "Digital Signage", sub: "Lobbies & public areas" },
  { id: "Video Wall", label: "Video Wall", sub: "Large-format impact" },
  { id: "Interactive Display", label: "Interactive Display", sub: "Touch & collaboration" },
  { id: "Commercial TV", label: "Commercial TV", sub: "Hotel rooms & offices" },
];

// Half-open [min, max): each boundary inch (50/75/100) belongs to exactly one
// bucket, so a 75" panel is "Large" only — not also "Standard". Mirrors the
// brightness-band partition fix in lib/productFilters.ts.
export const SIZE_RANGES = [
  { id: "small",  label: "Compact",     sub: 'Under 50"',      min: 0,   max: 50   },
  { id: "medium", label: "Standard",    sub: '50" – 74"',      min: 50,  max: 75   },
  { id: "large",  label: "Large",       sub: '75" – 99"',      min: 75,  max: 100  },
  { id: "xlarge", label: "Extra Large", sub: '100" and above', min: 100, max: 9999 },
];

/**
 * Build the "View all {type} products" link. ProductsCategoryNav matches
 * ?category= against category SLUGS (cat.id), so resolve the display-type
 * NAME to its slug. Falls back to /products if the name is somehow unknown.
 */
export function finderCategoryHref(displayType: string): string {
  const slug = getCategoryByName(displayType)?.id;
  return slug ? `/products?category=${slug}` : "/products";
}

/** Membership test for a half-open [min, max) size bucket. */
export function sizeInRange(n: number, r: { min: number; max: number }): boolean {
  return n >= r.min && n < r.max;
}
