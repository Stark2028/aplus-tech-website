import type { Product } from "@/data/products";

export interface Filters {
  brightness: string | null;
  resolution: string | null;
  operation: string | null;
  sizeBucket: string | null;
}

export const DEFAULT_FILTERS: Filters = {
  brightness: null,
  resolution: null,
  operation: null,
  sizeBucket: null,
};

export const RESOLUTION_OPTIONS = [
  { label: "4K UHD", match: (r: string) => r.includes("4K") || r.includes("3,840") },
  { label: "Full HD", match: (r: string) => r.includes("FHD") || r.includes("1,920") || r.includes("Full HD") },
  { label: "Custom / LED", match: (r: string) => r.includes("Custom") },
];

// Bands are half-open [min, max): each boundary value (350/500/700) belongs to
// exactly one band — the one whose label names it. A product reading "500 nit"
// lands in "500–700 nit", and "700 nit" lands in "700 nit +".
export const BRIGHTNESS_BANDS = [
  { label: "Under 350 nit", min: 0, max: 350 },
  { label: "350–500 nit", min: 350, max: 500 },
  { label: "500–700 nit", min: 500, max: 700 },
  { label: "700 nit +", min: 700, max: Infinity },
];

export const OPERATION_OPTIONS = ["16/7", "24/7"];

// Single-select size buckets, half-open [min, max): each boundary inch belongs
// to exactly one bucket (a 55" panel is '55"+', not also '43"+'). A product's
// size is its LARGEST offered diagonal. Mirrors BRIGHTNESS_BANDS.
export const SIZE_BUCKETS = [
  { label: 'Below 43"', min: 0,  max: 43 },
  { label: '43"+',      min: 43, max: 55 },
  { label: '55"+',      min: 55, max: 75 },
  { label: '75"+',      min: 75, max: 98 },
  { label: '98"+',      min: 98, max: Infinity },
];

/**
 * Parse a nit value from a brightness string, or null when it carries no number
 * (e.g. "HDR", "Standard"). Null products are excluded from numeric brightness
 * bands rather than being treated as 0 and bucketed into "Under 350 nit".
 */
function parseBrightnessNit(brightness: string): number | null {
  // Only strings that actually denote nits participate in nit bands. A VC
  // "113° FOV" / "CollabOS" / "PoE touch controller" must NOT be parsed as a
  // brightness (its leading number is a field-of-view angle, not nits).
  const isNitLike = /nit/i.test(brightness) || /^\s*[\d,]+\s*$/.test(brightness);
  if (!isNitLike) return null;
  const cleaned = brightness.replace(/,/g, "");
  const nums = cleaned.match(/\d+/g);
  if (!nums) return null;
  if (nums.length === 1) return parseInt(nums[0]);
  return Math.round((parseInt(nums[0]) + parseInt(nums[nums.length - 1])) / 2);
}

function parseMaxSize(screenSizes: string[]): number {
  const nums = screenSizes.flatMap((s) => {
    const n = parseInt(s);
    return isNaN(n) ? [] : [n];
  });
  return nums.length ? Math.max(...nums) : 0;
}

export function applyFilters(products: Product[], filters: Filters): Product[] {
  return products.filter((p) => {
    if (filters.resolution) {
      const opt = RESOLUTION_OPTIONS.find((o) => o.label === filters.resolution);
      if (opt && !opt.match(p.specs.resolution)) return false;
    }

    if (filters.brightness) {
      const band = BRIGHTNESS_BANDS.find((b) => b.label === filters.brightness);
      if (band) {
        const nit = parseBrightnessNit(p.specs.brightness);
        // Unparseable brightness ("HDR"/"Standard") matches no numeric band.
        if (nit === null) return false;
        // Half-open [min, max): boundary value belongs to the band it names.
        if (nit < band.min || nit >= band.max) return false;
      }
    }

    if (filters.operation && p.specs.operationTime !== filters.operation) {
      if (!p.specs.operationTime.includes(filters.operation)) return false;
    }

    if (filters.sizeBucket) {
      const bucket = SIZE_BUCKETS.find((b) => b.label === filters.sizeBucket);
      if (bucket) {
        const max = parseMaxSize(p.specs.screenSizes);
        // A product with no numeric size (parseMaxSize → 0, e.g. "Custom") can't
        // satisfy a size bucket, so it's excluded whenever one is selected —
        // including 'Below 43"' (min 0), which the max===0 guard rules out first.
        if (max === 0) return false;
        // Half-open [min, max): boundary inch belongs to the bucket it names.
        if (max < bucket.min || max >= bucket.max) return false;
      }
    }

    return true;
  });
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter((v) => v !== null && v !== 0).length;
}
