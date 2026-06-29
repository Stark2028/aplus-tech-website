import type { Product } from "@/data/products";

export interface Filters {
  brightness: string | null;
  resolution: string | null;
  operation: string | null;
  minSize: number;
}

export const DEFAULT_FILTERS: Filters = {
  brightness: null,
  resolution: null,
  operation: null,
  minSize: 0,
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

export const MIN_SIZE_OPTIONS = [32, 43, 55, 75];

/**
 * Parse a nit value from a brightness string, or null when it carries no number
 * (e.g. "HDR", "Standard"). Null products are excluded from numeric brightness
 * bands rather than being treated as 0 and bucketed into "Under 350 nit".
 */
function parseBrightnessNit(brightness: string): number | null {
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

    if (filters.minSize > 0) {
      const max = parseMaxSize(p.specs.screenSizes);
      // A product with no numeric size (parseMaxSize → 0, e.g. "Custom") can't
      // satisfy a minimum-size requirement, so it's excluded when a min is set.
      if (max < filters.minSize) return false;
    }

    return true;
  });
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter((v) => v !== null && v !== 0).length;
}
