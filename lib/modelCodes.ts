// Representative Samsung model codes per product series.
//
// Each product page covers a whole series (multiple sizes, each with its own
// Samsung order code). We surface ONE representative code — the smallest/base
// size — because B2B buyers frequently search the exact model number, and a
// real `mpn` in Product structured data is far more valuable than the previous
// placeholder (`id.toUpperCase()`, which emitted junk like "SAMSUNG-VHC-R").
//
// Only confident, verified codes are listed. Products without an entry simply
// omit `mpn` — better than shipping a fabricated identifier.
export const REPRESENTATIVE_MODEL_CODE: Record<string, string> = {
  // Digital Signage
  "samsung-qet-series": "LH43QETELGCXXL",
  "samsung-qpdx105": "LH105QPD5BGXZA",
  "samsung-signage-qbc": "LH43QBCEBGCXUE",
  "samsung-qh115fx": "LH115QHFEBGXZA",
  "samsung-signage-qhc": "LH43QHCEBGCXUE",
  "samsung-signage-qmc": "LH43QMCEPGCXUE",
  "samsung-signage-qbr-b": "LH24QBRBBGCXXL",
  // Interactive
  "samsung-flip-2": "LH55WMRWBGCXXL",
  "samsung-interactive-flip-3": "LH75WMAWLGCXXL",
  "samsung-interactive-wad": "LH65WADWLGCXXS",
  "samsung-waf-series": "LH65WAFWLGCXEN",
  "samsung-qbc-t": "LH24QBCTBGCXEN",
  "samsung-interactive-wac": "LH65WACWLGCXXL",
  "samsung-flip-pro-wm85b": "LH85WMBWLGCXXL",
  "samsung-touch-qmr-t": "LH32QMRTBGCXXL",
  // Video Wall
  "samsung-vhc-e": "LH55VHCEBGBXZA",
  "samsung-vhc-r": "LH55VHCRBGBXXL",
  "samsung-vmc-e": "LH55VMCEBGBXZA",
  "samsung-videowall-vmc-r": "LH55VMCRBGBXZA",
  "samsung-videowall-vmb-r": "LH55VMBRBGBXXL",
  "samsung-vmb-e": "LH55VMBEBGBXXL",
  "samsung-vh55r": "LH55VHRRBGBXXL",
  "samsung-vhb-e": "LH55VHBEBGBXXL",
  "samsung-vmb-u-55": "LH55VMBUBGBXXL",
  // Business / Hotel TV
  "samsung-business-tv-bed-h": "LH43BEDHLGFXGO",
  "samsung-business-tv-befx-h2": "LH43BEFH8GULXL",
  "samsung-business-tv-bec-h": "LH43BECHLGKLXL",
  "samsung-hotel-tv-hgu701f": "HG43U701FAULXL",
  "samsung-hotel-tv-hg75u700f": "HG75U700FAUXXL",
  "samsung-hotel-tv-hgu800f": "HG65U800FAWXXS",
  "samsung-hotel-tv-hgbu800": "HG43BU800NFXZA",
};

/** Representative Samsung model code for a product, or undefined if unknown. */
export function modelCodeFor(productId: string): string | undefined {
  return REPRESENTATIVE_MODEL_CODE[productId];
}
