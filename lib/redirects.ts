// SEO migration redirects — old (WordPress) site → new Next.js site.
//
// The previous site (also on www.aplustechsol.com) used a different URL scheme:
//   - Product pages:   /{category-root}/{product-slug}/
//   - Local SEO pages: /{city}/{product-slug}/  and  /{role}/{product-slug}/
//                      where role ∈ { distributor, suppliers, exporters }
//   - Category roots:  /samsung-smart-signage/, /video-wall/, ...
//   - Static pages:    /about-us/, /contact-us/, /blog/, ...
//
// Every one of those URLs is indexed by Google. To preserve ranking equity we
// 301 each old URL to its closest new equivalent. Because the city/role pages
// all end in a known product slug, a single slug→id map (matched on the LAST
// path segment) covers thousands of old URLs at once — see middleware.ts.

/** Old product/SKU slug → new product id (route becomes /products/{id}). */
export const OLD_PRODUCT_SLUG_TO_ID: Record<string, string> = {
  // ── Smart Signage ──
  "samsung-smart-signage-display-qet-series": "samsung-qet-series",
  "samsung-uhd-signage-display-qpdx-5k-series": "samsung-qpdx105",
  "samsung-commercial-display-qpdx105": "samsung-qpdx105",
  "samsung-commercial-display-qh115fx": "samsung-qh115fx",
  "samsung-led-display-mp016f": "samsung-mp016f",
  "samsung-signage-display-qbc-series": "samsung-signage-qbc",
  "samsung-signage-display-qhc-series-high-brightness-uhd": "samsung-signage-qhc",
  "samsung-signage-display-crystal-uhd-qmc-series": "samsung-signage-qmc",
  "samsung-small-display-full-hd-qbr-b-series": "samsung-signage-qbr-b",

  // ── Interactive ──
  "samsung-interactive-display-flip-2-0": "samsung-flip-2",
  "samsung-interactive-display-flip-3": "samsung-interactive-flip-3",
  "samsung-interactive-display-flip-pro-wm55b": "samsung-flip-pro-wm85b",
  "samsung-interactive-display-flip-pro-wm85b": "samsung-flip-pro-wm85b",
  "samsung-interactive-display-flip-pro": "samsung-flip-pro-wm85b",
  "samsung-interactive-display-flip-android": "samsung-interactive-wac",
  "samsung-wad-interactive-display-android-os": "samsung-interactive-wad",
  "samsung-65-inch-interactive-display-waf-series": "samsung-waf-series",
  "samsung-interactive-display-wa86f": "samsung-waf-series",
  "samsung-24-inch-interactive-display-qbc-t-series": "samsung-qbc-t",

  // ── Touch Display (folded into Interactive on the new site) ──
  "samsung-smart-signage-with-compact-touch-display": "samsung-qbc-t",
  "samsung-smart-signage-with-full-hd-touch-display": "samsung-touch-qmr-t",

  // ── Video Wall ──
  "samsung-55-inch-fhd-video-wall-display-vhc-e-series": "samsung-vhc-e",
  "samsung-videowall-vhc-r": "samsung-vhc-r",
  "samsung-videowall-vmc-e": "samsung-vmc-e",
  "samsung-videowall-vmc-r": "samsung-videowall-vmc-r",
  "samsung-videowall-razor-narrow-bezel-vmb-r-series": "samsung-videowall-vmb-r",
  "samsung-video-wall-display-extreme-narrow-bezel-vmb-e-series": "samsung-vmb-e",
  "samsung-video-wall-display-razor-thin-bezels-vh55r-series": "samsung-vh55r",
  "samsung-video-wall-display-extreme-narrow-bezel-vhb-e-series": "samsung-vhb-e",
  "samsung-videowall-display-vmb-u-series": "samsung-vmb-u-55",

  // ── Business TV ──
  "samsung-60-inch-4k-business-pro-tv-bed-h-series": "samsung-business-tv-bed-h",
  "samsung-business-tv-befx-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be85f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-uhd-crystal-4k-bec-h": "samsung-business-tv-bec-h",

  // ── Hotel TV ──
  "samsung-hotel-tv-hg55u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg75u700f": "samsung-hotel-tv-hg75u700f",
  "samsung-hotel-tv-hg85u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-4k-uhd-crystal-hgbu800": "samsung-hotel-tv-hgbu800",

  // ── Legacy per-SKU pages (older R/T-gen), mapped to their current series ──
  "samsung-qb13rt": "samsung-qbc-t",
  "samsung-qb24rt": "samsung-qbc-t",
  "samsung-qb24c": "samsung-small-qbc",
  "samsung-qb43c": "samsung-signage-qbc",
  "samsung-qb50c": "samsung-signage-qbc",
  "samsung-qb55c": "samsung-signage-qbc",
  "samsung-qb65c": "samsung-signage-qbc",
  "samsung-qb75c": "samsung-signage-qbc",
  "samsung-qb85c": "samsung-signage-qbc",
  "samsung-qb98tb": "samsung-signage-qbc",
  "samsung-qb55cn": "samsung-signage-qbc",
  "samsung-qb65cn": "samsung-signage-qbc",
  "samsung-qe55t": "samsung-qet-series",
  "samsung-qe75t": "samsung-qet-series",
  "samsung-qm65c": "samsung-signage-qmc",
  "samsung-qm75c": "samsung-signage-qmc",
  "samsung-qm98c": "samsung-signage-qmc",
  "samsung-qh43r": "samsung-signage-qhc",
  "samsung-qh55r": "samsung-signage-qhc",
  "samsung-qh65r": "samsung-signage-qhc",
  "samsung-qm32r-t": "samsung-touch-qmr-t",
  "samsung-hg50bu800": "samsung-hotel-tv-hgbu800",
  "samsung-vm55be": "samsung-vmb-e",
  "samsung-vm55bu": "samsung-vmb-u-55",
  "samsung-vm55ce": "samsung-vmc-e",
  "samsung-vm55cr": "samsung-videowall-vmc-r",
  "samsung-wa65c": "samsung-interactive-wac",
  "samsung-wa75c": "samsung-interactive-wac",
  "samsung-wa65d": "samsung-interactive-wad",
  "samsung-wa75d": "samsung-interactive-wad",
  "samsung-wm55r": "samsung-flip-2",
  "samsung-wm65r": "samsung-interactive-flip-3",
  "samsung-wm75a": "samsung-interactive-flip-3",
  "samsung-wm85a": "samsung-interactive-flip-3",
  "samsung-wm65b": "samsung-flip-pro-wm85b",
  "samsung-wm75b": "samsung-flip-pro-wm85b",
  "samsung-wm85b": "samsung-flip-pro-wm85b",
};

/** Old category-root segment → new category id (route becomes /categories/{id}). */
export const OLD_CATEGORY_ROOT_TO_ID: Record<string, string> = {
  "samsung-smart-signage": "digital-signage",
  "video-wall": "video-walls",
  "samsung-interactive-display": "interactive",
  "touch-display": "interactive",
  "samsung-business-tv": "commercial-tv",
  "samsung-hotel-tv": "commercial-tv",
};

/**
 * Old single-segment pages → new path. Covers static pages and the role
 * landing-page roots (/distributor/ etc., whose product sub-pages are handled
 * by the product-slug rule).
 */
export const OLD_EXACT_PATH_TO_NEW: Record<string, string> = {
  "about-us": "/about",
  "contact-us": "/contact",
  "privacy-policy": "/privacy",
  "terms-and-conditions": "/terms",
  "our-presence": "/contact",
  "sitemap": "/",
  "distributor": "/products",
  "suppliers": "/products",
  "exporters": "/products",
};

/**
 * Removed product page → the surviving product it was a duplicate of.
 *
 * Each of these described the same Samsung display as its canonical twin, under
 * Samsung's other name for it: a series page and its sole SKU page (VMC-R is
 * only made in 55", and that SKU is called VM55C-R), or a hospitality series
 * whose order code drops a zero (HU7010F → HG43U701FAULXL, exactly as the known
 * HU8000F → HG43U800FAULXL does). Two pages for one product split Google's
 * ranking signals between them, so the duplicates are gone and their URLs 301
 * to the survivor.
 *
 * Unlike every other map here these keys are NEW-site product ids, not old
 * WordPress slugs — /products/{id} is otherwise reserved in middleware.ts, so
 * this map is what lets those specific paths still redirect instead of 404.
 * Values must never appear as keys, or the redirect would loop.
 */
export const MERGED_PRODUCT_TO_CANONICAL: Record<string, string> = {
  "samsung-hotel-tv-hgu701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hgu800f": "samsung-hotel-tv-hu8000f",
  "samsung-vm55c-r": "samsung-videowall-vmc-r",
  "samsung-vh55c-r": "samsung-vhc-r",
  "samsung-vm55c-e": "samsung-vmc-e",
  "samsung-vh55c-e": "samsung-vhc-e",
};
