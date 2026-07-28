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
  // GA-observed legacy SKU URL (…/samsung-business-tv-beh-k2) — same BEFX-H2 display.
  "samsung-business-tv-beh-k2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-uhd-crystal-4k-bec-h": "samsung-business-tv-bec-h",

  // ── Hotel TV ──
  "samsung-hotel-tv-hg55u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg75u700f": "samsung-hotel-tv-hg75u700f",
  "samsung-hotel-tv-hg85u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-4k-uhd-crystal-hgbu800": "samsung-hotel-tv-hgbu800",

  // ── Search-Console-observed slugs (GSC "Soft 404" export, 2026-07-28) ──
  // These four accounted for 128 of the 133 soft-404s Google reported. They are
  // absent from the archived WordPress sitemap, so only Search Console surfaced
  // them — do not remove without re-checking that report.
  //
  // NOTE the misspelling: the old site published "dispaly", and that typo'd URL
  // is the one Google indexed across 96 city/role pages. The correctly spelled
  // slug above is kept too; both must resolve.
  "samsung-led-dispaly-mp016f": "samsung-mp016f",
  // QBC-N has no catalog entry of its own; QBC is the same Crystal UHD line.
  "samsung-crystal-uhd-signage-display-qbc-n-series": "samsung-signage-qbc",
  "samsung-be50d-h": "samsung-business-tv-bed-h",
  "samsung-55-inch-video-wall-display-vmc-e-series": "samsung-vmc-e",

  // From the archived WordPress sitemap rather than GSC — 99 city/role URLs.
  // The discontinued UH55F-E has no catalog entry; VHB-E is its successor on the
  // same FHD extreme-narrow-bezel line.
  "samsung-videowall-extreme-narrow-bezels-uh55fe-series": "samsung-vhb-e",

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

  // ── The city × SKU matrix ───────────────────────────────────────────────────
  // The old site published one page per SKU per city (/mumbai/samsung-qb43c/).
  // Only the SKUs with measurable traffic were ever mapped above, which left the
  // long tail 404ing: 49 unmapped SKUs × 110 city/role roots ≈ 5,400 URLs. That
  // reconciles the archived sitemap (2,195 URLs) with the ~7,650 pages Search
  // Console reports, so this block is the rest of the old site.
  //
  // Slugs are reconstructed from each series and its screen sizes, using the
  // spellings proven by URLs known to be real: samsung-qb43c, samsung-qm32r-t,
  // samsung-be50d-h (GSC), samsung-business-tv-be85f-h2 (GSC), and the client-
  // reported samsung-qm55c. The old CMS was inconsistent about hyphens and about
  // the samsung-business-tv-/samsung-hotel-tv- prefix, so both spellings are
  // listed. An entry for a URL that never existed is inert — an unused key —
  // whereas a missing one costs ~110 live URLs, so this errs toward listing more.
  "samsung-be43c-h": "samsung-business-tv-bec-h",
  "samsung-be50c-h": "samsung-business-tv-bec-h",
  "samsung-be55c-h": "samsung-business-tv-bec-h",
  "samsung-be65c-h": "samsung-business-tv-bec-h",
  "samsung-be70c-h": "samsung-business-tv-bec-h",
  "samsung-be75c-h": "samsung-business-tv-bec-h",
  "samsung-be85c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be43c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be50c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be55c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be65c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be70c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be75c-h": "samsung-business-tv-bec-h",
  "samsung-business-tv-be85c-h": "samsung-business-tv-bec-h",
  "samsung-be43d-h": "samsung-business-tv-bed-h",
  "samsung-be55d-h": "samsung-business-tv-bed-h",
  "samsung-be60d-h": "samsung-business-tv-bed-h",
  "samsung-be65d-h": "samsung-business-tv-bed-h",
  "samsung-be70d-h": "samsung-business-tv-bed-h",
  "samsung-be75d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be43d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be50d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be55d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be60d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be65d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be70d-h": "samsung-business-tv-bed-h",
  "samsung-business-tv-be75d-h": "samsung-business-tv-bed-h",
  "samsung-be43f-h2": "samsung-business-tv-befx-h2",
  "samsung-be50f-h2": "samsung-business-tv-befx-h2",
  "samsung-be55f-h2": "samsung-business-tv-befx-h2",
  "samsung-be65f-h2": "samsung-business-tv-befx-h2",
  "samsung-be75f-h2": "samsung-business-tv-befx-h2",
  "samsung-be85f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be43f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be50f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be55f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be65f-h2": "samsung-business-tv-befx-h2",
  "samsung-business-tv-be75f-h2": "samsung-business-tv-befx-h2",
  "samsung-hg43bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hg55bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hg65bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hotel-tv-hg43bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hotel-tv-hg50bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hotel-tv-hg55bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hotel-tv-hg65bu800": "samsung-hotel-tv-hgbu800",
  "samsung-hg43u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hg50u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hg55u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hg65u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hg75u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg43u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg50u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg65u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hg75u701f": "samsung-hotel-tv-hu7010f",
  "samsung-hg43u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hg50u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hg55u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hg65u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hg75u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hg85u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-hg43u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-hg50u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-hg55u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-hg65u800f": "samsung-hotel-tv-hu8000f",
  "samsung-hotel-tv-hg75u800f": "samsung-hotel-tv-hu8000f",
  "samsung-wa86c": "samsung-interactive-wac",
  "samsung-wa86d": "samsung-interactive-wad",
  "samsung-qb13c-t": "samsung-qbc-t",
  "samsung-qb13ct": "samsung-qbc-t",
  "samsung-qb24c-t": "samsung-qbc-t",
  "samsung-qb24ct": "samsung-qbc-t",
  "samsung-qe43t": "samsung-qet-series",
  "samsung-qe50t": "samsung-qet-series",
  "samsung-qe65t": "samsung-qet-series",
  "samsung-qe70t": "samsung-qet-series",
  "samsung-qe82t": "samsung-qet-series",
  "samsung-qp105dx": "samsung-qpdx105",
  "samsung-qb13r-b": "samsung-signage-qbr-b",
  "samsung-qb13rb": "samsung-signage-qbr-b",
  "samsung-qb24r-b": "samsung-signage-qbr-b",
  "samsung-qb24rb": "samsung-signage-qbr-b",
  "samsung-qh43c": "samsung-signage-qhc",
  "samsung-qh50c": "samsung-signage-qhc",
  "samsung-qh55c": "samsung-signage-qhc",
  "samsung-qh65c": "samsung-signage-qhc",
  "samsung-qh75c": "samsung-signage-qhc",
  "samsung-qm43c": "samsung-signage-qmc",
  "samsung-qm50c": "samsung-signage-qmc",
  "samsung-qm55c": "samsung-signage-qmc",
  "samsung-qm85c": "samsung-signage-qmc",
  "samsung-qm32rt": "samsung-touch-qmr-t",
  "samsung-qm43r-t": "samsung-touch-qmr-t",
  "samsung-qm43rt": "samsung-touch-qmr-t",
  "samsung-qm55r-t": "samsung-touch-qmr-t",
  "samsung-qm55rt": "samsung-touch-qmr-t",
  "samsung-vh55b-e": "samsung-vhb-e",
  "samsung-vh55be": "samsung-vhb-e",
  "samsung-vh55c-e": "samsung-vhc-e",
  "samsung-vh55ce": "samsung-vhc-e",
  "samsung-vh55c-r": "samsung-vhc-r",
  "samsung-vh55cr": "samsung-vhc-r",
  "samsung-vm55b-r": "samsung-videowall-vmb-r",
  "samsung-vm55br": "samsung-videowall-vmb-r",
  "samsung-vm55c-r": "samsung-videowall-vmc-r",
  "samsung-vm55b-e": "samsung-vmb-e",
  "samsung-vm55b-u": "samsung-vmb-u-55",
  "samsung-vm55c-e": "samsung-vmc-e",
  "samsung-wa65f": "samsung-waf-series",
  "samsung-wa75f": "samsung-waf-series",
  "samsung-wa86f": "samsung-waf-series",
};

/** Old category-root segment → new category id (route becomes /categories/{id}). */
export const OLD_CATEGORY_ROOT_TO_ID: Record<string, string> = {
  "samsung-smart-signage": "digital-signage",
  "video-wall": "video-walls",
  "samsung-interactive-display": "interactive",
  "samsung-interactive-displays": "interactive", // GA-observed plural variant
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
  "our-presence": "/locations",
  "sitemap": "/",
  "distributor": "/products",
  "suppliers": "/products",
  "exporters": "/products",
  // GA-observed legacy pages absent from the sitemap. Sent to the closest live
  // page so they 301 instead of 404 (there is no /solutions index page).
  "services": "/products",
  "displays-screens-india": "/products",
  "dahlv": "/products", // unidentified legacy slug — safe catch-all to the catalog
  // WordPress internal search results (/search/?search=…). Google indexed a few,
  // so send them to the catalog rather than a 404; redirectTo carries the query
  // string across harmlessly. The new site's SearchAction points at /products?q=,
  // so nothing generates these any more.
  "search": "/products",
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
  // Renamed id: this product is the QMB-T series (name, series, and SKU
  // LH43QMBTBGCXXL all say QMB-T); its id was mistakenly "samsung-touch-qbc-t".
  "samsung-touch-qbc-t": "samsung-touch-qmb-t",
  "samsung-hotel-tv-hgu701f": "samsung-hotel-tv-hu7010f",
  "samsung-hotel-tv-hgu800f": "samsung-hotel-tv-hu8000f",
  "samsung-vm55c-r": "samsung-videowall-vmc-r",
  "samsung-vh55c-r": "samsung-vhc-r",
  "samsung-vm55c-e": "samsung-vmc-e",
  "samsung-vh55c-e": "samsung-vhc-e",
};

/**
 * Old WordPress blog-post slug → new destination. The new site rewrote its blog
 * library under different slugs, so /blog/{old-slug} cannot fall through to
 * /blogs/{old-slug} — that 404s. Each of the four legacy posts (which carry
 * inbound links) 301s to its closest live equivalent: a topical new post, or the
 * product it was about. Any unmapped /blog/* path falls back to the /blogs index
 * in proxy.ts, never a 404. Targets sit under reserved roots, so no loop.
 */
export const OLD_BLOG_SLUG_TO_NEW: Record<string, string> = {
  "complete-guide-to-samsung-smart-signage-solutions": "/blogs/planning-your-samsung-digital-signage-rollout",
  "experience-the-benefits-of-visual-marketing-with-samsungs-qmr-series-smart-led-display": "/blogs/planning-your-samsung-digital-signage-rollout",
  "benefits-of-using-samsung-business-tv-uhd-crystal-4k-for-your-office": "/blogs/choosing-between-business-tv-and-smart-signage",
  "samsung-hospitality-tv-hgbu800": "/products/samsung-hotel-tv-hgbu800",
};
