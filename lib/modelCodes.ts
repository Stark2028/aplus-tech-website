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
  "samsung-interactive-wac": "LH65WACWLGCXXL",
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
  "samsung-the-wall-mmf": "LH012MMFRGS",
  "samsung-the-wall-ivc": "LH016IVCMVS",
  "samsung-all-in-one-led-iab": "LH008IABMUS",
  "samsung-all-in-one-led-iac": "LH015IACCHS",
  "samsung-all-in-one-led-mmf-a": "LHA15MMFRHS",
  "samsung-indoor-led-ie": "LH015IEACLS",
  // Business / Hotel TV
  "samsung-business-tv-bed-h": "LH43BEDHLGFXGO", // ~ India lists 98" LH98BEDHLGUXXL
  "samsung-business-tv-befx-h2": "LH43BEFH8GULXL",
  "samsung-business-tv-bec-h": "LH43BECHLGKLXL", // ~ India page not found
  "samsung-hotel-tv-hgu701f": "HG43U701FAULXL",
  "samsung-hotel-tv-hg75u700f": "HG75U700FAUXXL",
  "samsung-hotel-tv-hgu800f": "HG65U800FAWXXS", // ~ likely same product as hu8000f
  "samsung-hotel-tv-hgbu800": "HG43BU800AKLXL",
  "samsung-hotel-tv-hu8000f": "HG43U800FAULXL",
  "samsung-hotel-tv-hu7010f": "HG43U701FAULXL",
};

/** Representative Samsung model code for a product, or undefined if unknown. */
export function modelCodeFor(productId: string): string | undefined {
  return REPRESENTATIVE_MODEL_CODE[productId];
}
