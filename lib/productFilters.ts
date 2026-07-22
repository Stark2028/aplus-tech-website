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

// A brightness figure: a number immediately followed by a nit unit — "nit" or
// "cd/m²" (with or without the ², slash, or spaces). Anchoring on the unit is
// what keeps parenthesised inch diagonals ("(13\")", "(43\", 55\")") out of the
// value set — those digits carry no unit token.
const NIT_VALUE = /([\d,]+)\s*(?:nit|cd\s*\/?\s*m)/gi;

/**
 * Parse a nit value from a brightness string, or null when it carries no
 * brightness figure (e.g. "HDR", "Standard", a VC "113° FOV"). Null products
 * are excluded from numeric brightness bands rather than being treated as 0 and
 * bucketed into "Under 350 nit".
 *
 * Recognises both "nit" and "cd/m²" (the same unit). For a multi-value spec
 * like "500 nit (13\") / 250 nit (24\")" it averages the min and max nit
 * figures — the inch diagonals in parentheses are ignored because they carry no
 * unit token, so a 500-nit panel is no longer mis-filed by averaging in "24".
 */
export function parseBrightnessNit(brightness: string | undefined): number | null {
  if (!brightness) return null;
  const values = [...brightness.matchAll(NIT_VALUE)].map((m) =>
    Number(m[1].replace(/,/g, ""))
  );
  if (values.length === 0) {
    // A bare number with no unit is still a nit figure (legacy data shape).
    const bare = /^\s*([\d,]+)\s*$/.exec(brightness);
    return bare ? Number(bare[1].replace(/,/g, "")) : null;
  }
  if (values.length === 1) return values[0];
  return Math.round((Math.min(...values) + Math.max(...values)) / 2);
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
