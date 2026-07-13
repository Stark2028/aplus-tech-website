// Representative Samsung model codes per product series.
//
// Each product page covers a whole series (multiple sizes, each with its own
// Samsung order code). We surface ONE representative code — the smallest/base
// size — because B2B buyers frequently search the exact model number, and a
// real `mpn` in Product structured data is far more valuable than the previous
// placeholder (`id.toUpperCase()`, which emitted junk like "SAMSUNG-VHC-R").
//
// Codes are the Samsung INDIA order codes, verified against product URLs on
// samsung.com/in/business. Representative = smallest listed India size.
// A trailing `// ~` marks a code that is a valid Samsung SKU but whose India
// page could not be confirmed (kept pending verification, not fabricated).
export const REPRESENTATIVE_MODEL_CODE: Record<string, string> = {
  // Digital Signage
  "samsung-qet-series": "LH43QETELGCXXL",
  "samsung-qpdx105": "LH105QPD5BGXXL",
  "samsung-signage-qbc": "LH43QBCEBGCLXL",
  "samsung-qh115fx": "LH115QHFEBGXXL",
  "samsung-signage-qhc": "LH43QHCEBGCXXL",
  "samsung-signage-qmc": "LH43QMCEBGCLXL",
  "samsung-signage-qbr-b": "LH24QBRBBGCXXL",
  "samsung-spatial-smhx": "LH85SMHPBGCXXL",
  "samsung-outdoor-oh": "LH75OHAEBGBXXL",
  "samsung-small-qbc": "LH13QBCEBGBXXL",
  // India sells the Window OM as the OMN series (46"/55" only).
  "samsung-window-om": "LH46OMNSLGB",
  // Touch
  "samsung-touch-qbc-t": "LH43QMBTBGCXXL",
  "samsung-touch-qmc-t": "LH32QMCTBGCXXL",
  "samsung-touch-qmr-t": "LH32QMRTBGCXXL",
  "samsung-qbc-t": "LH24QBCTBGCXEN", // ~ India page not found
  // Interactive
  "samsung-flip-2": "LH55WMRWBGCXXL",
  "samsung-interactive-flip-3": "LH75WMAWLGCXXL",
  "samsung-interactive-wad": "LH65WADWLGCXXS", // ~ India page not found
  "samsung-waf-series": "LH65WAFWLNCXXL",
  "samsung-interactive-wafx-p": "LH65WAFPLGCXXL",
  "samsung-interactive-wac": "LH65WACWLGCXXL", // ~ India page not found
  "samsung-flip-pro-wm85b": "LH85WMBWLGCXXL",
  "samsung-flip-wmfx": "LH55WMFWBGCXXL",
  // Video Wall
  "samsung-vhc-e": "LH55VHCEBGBXXL",
  "samsung-vhc-r": "LH55VHCRBGBXXL",
  "samsung-vmc-e": "LH55VMCEBGBXXL",
  "samsung-videowall-vmc-r": "LH55VMCRBGBXXL",
  "samsung-videowall-vmb-r": "LH55VMBRBGBXXL",
  "samsung-vmb-e": "LH55VMBEBGBXXL",
  "samsung-vh55r": "LH55VHRRBGBXXL",
  "samsung-vhb-e": "LH55VHBEBGBXXL",
  "samsung-vmb-u-55": "LH55VMBUBGBXXL",
  "samsung-vmb-u-46": "LH46VMBUBGBXXL",
  // LED Signage
  "samsung-the-wall-mpf": "LH012MPFAAA",
  // MP016F is The Wall MPF at 1.6mm pitch — its own India SKU, distinct from
  // the 1.2mm code above (the digits here are pitch, not a diagonal).
  "samsung-mp016f": "LH016MPFAAA",
  "samsung-the-wall-mmf": "LH012MMFRGS",
  "samsung-the-wall-ivc": "LH016IVCMVS",
  "samsung-all-in-one-led-iab": "LH008IABMUS",
  "samsung-all-in-one-led-iac": "LH015IACCHS",
  "samsung-all-in-one-led-mmf-a": "LHA15MMFRHS",
  "samsung-indoor-led-ie": "LH015IEACLS",
  // Business / Hotel TV
  // India lists BED-H in 98" only, so that IS the representative size here.
  "samsung-business-tv-bed-h": "LH98BEDHLGUXXL",
  "samsung-business-tv-befx-h2": "LH43BEFH8GULXL",
  "samsung-business-tv-bec-h": "LH43BECHLGKLXL", // ~ India page not found
  "samsung-hotel-tv-hg75u700f": "HG75U700FAUXXL",
  "samsung-hotel-tv-hgbu800": "HG43BU800AKLXL",
  "samsung-hotel-tv-hu8000f": "HG43U800FAULXL",
  // A hospitality series name drops a zero to form its order code — HU8000F is
  // HG43U800F above, and by the same rule HU7010F is HG43U701F. That is why the
  // duplicate HGU701F page carried this code: it was the same TV.
  "samsung-hotel-tv-hu7010f": "HG43U701FAULXL",
};

/** Representative Samsung model code for a product, or undefined if unknown. */
export function modelCodeFor(productId: string): string | undefined {
  return REPRESENTATIVE_MODEL_CODE[productId];
}

/**
 * Product ids where the representative code's size digits equal a real
 * `screenSizes` entry (so the substitution guard below would normally pass),
 * but substitution is still wrong because the product page bundles multiple
 * distinct Samsung sub-series rather than one size-only SKU family.
 *
 * Confirmed for "samsung-outdoor-oh": screenSizes ["24","46","55","75"] span
 * three different sub-series per the product's own specGroups — 75" is OHA
 * (the representative code's family), 46"/55" is OHDX, 24" is OHB. Naively
 * substituting the size would fabricate an OHA-branded code for what's
 * actually an OHDX/OHB model.
 */
const MIXED_SUBSERIES_PRODUCTS = new Set<string>(["samsung-outdoor-oh"]);

/**
 * Every plausible Samsung order code for a product's series, derived from the
 * representative code by substituting the diagonal size.
 *
 * SKUs within a display series differ only by the size digits right after the
 * two-letter prefix (`LH65WAFP…` → `LH75WAFP…`), so we generate one code per
 * numeric entry in `screenSizes`. The catch: we only substitute when the
 * representative code's own digits are themselves one of those sizes — proof
 * that the digit field really encodes the diagonal — and the product isn't
 * flagged in `MIXED_SUBSERIES_PRODUCTS` above. For products whose code
 * encodes something else (The Wall's pixel pitch `LH012MPF…`, All-in-One LED
 * `LH008IAB…`), the guard fails and we return just the representative code
 * rather than fabricate a wrong one. Because the model family (everything after
 * the size) is always preserved, a bad guess could only ever miss — never
 * surface the wrong product.
 */
export function modelCodesForProduct(
  productId: string,
  screenSizes: string[]
): string[] {
  const rep = REPRESENTATIVE_MODEL_CODE[productId];
  if (!rep) return [];
  if (MIXED_SUBSERIES_PRODUCTS.has(productId)) return [rep];

  const m = /^([A-Za-z]{2})(\d+)([A-Za-z].*)$/.exec(rep);
  if (!m) return [rep];

  const [, prefix, sizeDigits, rest] = m;
  const numericSizes = screenSizes.filter((s) => /^\d+$/.test(s));
  if (!numericSizes.includes(sizeDigits)) return [rep];

  const codes = numericSizes.map((size) => `${prefix}${size}${rest}`);
  // Dedupe; the representative is already among `codes` since its size qualifies.
  return Array.from(new Set([rep, ...codes]));
}
