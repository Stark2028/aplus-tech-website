import type { Product } from "@/data/products";

export interface Filters {
  category: string | null;
  brightness: string | null;
  resolution: string | null;
  operation: string | null;
  minSize: number;
}

export const DEFAULT_FILTERS: Filters = {
  category: null,
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

export const BRIGHTNESS_BANDS = [
  { label: "Under 350 nit", min: 0, max: 349 },
  { label: "350–500 nit", min: 350, max: 500 },
  { label: "500–700 nit", min: 501, max: 700 },
  { label: "700 nit +", min: 701, max: Infinity },
];

export const OPERATION_OPTIONS = ["16/7", "24/7"];

export const MIN_SIZE_OPTIONS = [32, 43, 55, 75];

function parseBrightnessNit(brightness: string): number {
  const cleaned = brightness.replace(/,/g, "");
  const nums = cleaned.match(/\d+/g);
  if (!nums) return 0;
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
    if (filters.category && p.category !== filters.category) return false;

    if (filters.resolution) {
      const opt = RESOLUTION_OPTIONS.find((o) => o.label === filters.resolution);
      if (opt && !opt.match(p.specs.resolution)) return false;
    }

    if (filters.brightness) {
      const band = BRIGHTNESS_BANDS.find((b) => b.label === filters.brightness);
      if (band) {
        const nit = parseBrightnessNit(p.specs.brightness);
        if (nit < band.min || nit > band.max) return false;
      }
    }

    if (filters.operation && p.specs.operationTime !== filters.operation) {
      if (!p.specs.operationTime.includes(filters.operation)) return false;
    }

    if (filters.minSize > 0) {
      const max = parseMaxSize(p.specs.screenSizes);
      if (max < filters.minSize && max !== 0) return false;
    }

    return true;
  });
}

export function countActive(filters: Filters): number {
  return Object.values(filters).filter((v) => v !== null && v !== 0).length;
}
