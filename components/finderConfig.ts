import { getCategoryByName } from "@/data/categories";
import { products } from "@/data/products";

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
  { id: "LED Signage", label: "LED Signage", sub: "Direct-view LED walls" },
];

export type IndustryId = "hospitality" | "corporate" | "education" | "retail";

export interface UseCasePreset {
  id: string;
  label: string;
  sub: string;
  industry: IndustryId;
  category: string;
  sizeRangeId: string;
}

export const USE_CASE_PRESETS: UseCasePreset[] = [
  {
    id: "boardroom",
    label: "10-Person Boardroom",
    sub: "Interactive collaboration screen",
    industry: "corporate",
    category: "Interactive Display",
    sizeRangeId: "large",
  },
  {
    id: "hotel-lobby",
    label: "Hotel Lobby Video Wall",
    sub: "High-impact grand entrance display",
    industry: "hospitality",
    category: "Video Wall",
    sizeRangeId: "",
  },
  {
    id: "classroom",
    label: "Smart Classroom",
    sub: "Interactive learning & teaching screen",
    industry: "education",
    category: "Interactive Display",
    sizeRangeId: "large",
  },
  {
    id: "retail-signage",
    label: "Retail Storefront Signage",
    sub: "High-brightness promotional displays",
    industry: "retail",
    category: "Digital Signage",
    sizeRangeId: "medium",
  },
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

/**
 * Per-industry preference scores by display category. Higher = stronger fit;
 * 0 = not a fit (disables the category in the wizard's step 2). Moved here
 * from ProductFinderSection so gating and result ranking share one table.
 */
export const INDUSTRY_CATEGORY_SCORE: Record<
  "hospitality" | "corporate" | "education" | "retail",
  Record<string, number>
> = {
  hospitality: { "Commercial TV": 3, "Digital Signage": 2, "Interactive Display": 1, "Video Wall": 1, "LED Signage": 1 },
  corporate:   { "Interactive Display": 3, "Digital Signage": 2, "Video Wall": 2, "Commercial TV": 1, "LED Signage": 1 },
  education:   { "Interactive Display": 3, "Digital Signage": 1, "Video Wall": 1, "Commercial TV": 0, "LED Signage": 0 },
  retail:      { "Digital Signage": 3, "Video Wall": 3, "Interactive Display": 1, "Commercial TV": 0, "LED Signage": 2 },
};

/**
 * Step-2 gate: can this display category be picked for the chosen industry?
 * "any"/empty industry only requires the category to have products at all;
 * otherwise the industry score must be positive too.
 */
export function categoryEnabledForIndustry(category: string, industry: string): boolean {
  const hasProducts = products.some((p) => p.category === category);
  if (!industry || industry === "any") return hasProducts;
  const scores = INDUSTRY_CATEGORY_SCORE[industry as keyof typeof INDUSTRY_CATEGORY_SCORE];
  return hasProducts && (scores?.[category] ?? 0) > 0;
}

/**
 * Step-3 gate: SIZE_RANGES ids that contain at least one screen size of at
 * least one product in the category. Non-numeric sizes ("Custom") are skipped,
 * matching how the results filter already treats them.
 */
export function availableSizeRangeIds(category: string): Set<string> {
  const ids = new Set<string>();
  for (const p of products) {
    if (p.category !== category) continue;
    for (const s of p.specs.screenSizes) {
      const n = parseInt(s);
      if (isNaN(n)) continue;
      for (const r of SIZE_RANGES) {
        if (sizeInRange(n, r)) ids.add(r.id);
      }
    }
  }
  return ids;
}
