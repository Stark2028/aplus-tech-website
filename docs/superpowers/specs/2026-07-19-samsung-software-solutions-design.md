# Samsung Software Solutions category (VXT + LYNK Cloud) — Design

**Date:** 2026-07-19
**Status:** Approved (brainstorm) → implementing
**Related:** `2026-07-18-logitech-video-conferencing-design.md` (the pattern this mirrors),
`solutions-category-deferred` memory (this resolves that open question).

## Summary

Add a 7th product category, **Software** (display name "Software Solutions"),
holding the two Samsung cloud/software platforms from the 2026 Display Solutions
catalog §04 "Solution":

- **Samsung VXT** — cloud content-management / digital-signage platform
  (successor to MagicINFO).
- **Samsung LYNK Cloud** — cloud hospitality platform for managing in-room hotel
  TV content and guest experiences.

They are **standalone, first-class catalog products** with full parity to every
other product: detail page, Add to Quote, WhatsApp/Call, compare, search,
sitemap, JSON-LD. This mirrors the Logitech Video Conferencing integration
(2026-07-18), which already proved the "separate data file + category entry +
`specLabels` remap" pattern end-to-end.

## Key decisions (from brainstorm)

1. **Positioning:** standalone software products (not a marketing page, not
   companion-only). Full button parity.
2. **Brand:** Samsung. `brand` is left **absent** (absent ⇒ Samsung, the
   historical default — never set `brand: "Samsung"` explicitly, matching every
   other Samsung entry). So all the existing "authorized Samsung" trust copy on
   the category/detail pages is CORRECT for these products (unlike VC, which had
   to strip it).
3. **`catalog2026: true`** on both — they are genuine 2026 catalog products.
4. **Spec cells:** software has no screen/brightness/resolution, so the two card
   spec cells + summary line are remapped via `specLabels` to
   **Deployment / Platform / Designed For** (mirrors how VC remapped to
   Field of View / Designed For).
5. **Images:** sourced from the web (official Samsung VXT / LYNK Cloud UI or
   brand imagery). Ship with whatever is found; `images: []` placeholder is an
   acceptable fallback per product (card already renders "Image unavailable").

## Naming — avoiding the `solutions` collision (IMPORTANT)

There is ALREADY a `data/solutions.ts` (`export const solutions`) for **industry**
solutions (hospitality / corporate / education / retail) that power the
`/solutions/[industry]` route tree, and `app/categories/[slug]/page.tsx` imports
it. Therefore the new product category **must NOT use the slug `solutions`**.

- **Category slug (`CategorySlug` / URL):** `software`
  → `/categories/software`, `/products?category=software`
- **Category `name` (matches `Product.category`):** `Software Solutions`
- **Category `navLabel`:** `Software`
- **Data file:** `data/software.ts` (`export const softwareProducts`)

## Architecture — every touchpoint

The category system is data-driven, but a few surfaces hardcode a per-category
list. Full map (verified against the codebase):

### New files
- `data/software.ts` — `softwareProducts: Product[]` (the two products).
- `data/software.test.ts` — invariants (Samsung, catalog2026, category, unique
  ids, required spec fields, valid subCategories).

### Edited files
1. **`data/categories.ts`**
   - Add `"software"` to the `CategorySlug` union.
   - Add the `productCategories` entry (name/navLabel/tagline/subtitle/overview/
     useCases). No screen-size language in the overview (software has none).
2. **`data/products.ts`**
   - Import `softwareProducts` and spread them into the merged `products` array
     (same as `videoConferencingProducts`).
3. **`lib/vcSpecLabels.ts`**
   - Add a `Software Solutions` category branch returning
     `{ resolution: "Deployment", brightness: "Platform", operation: "Designed For" }`.
     (The function already special-cases by category; this is a second one.
     Note: the file is named `vcSpecLabels` for historical reasons but is the
     generic spec-label resolver — leave the filename, it's imported widely.)
4. **`lib/categoryFaq.ts`**
   - Software has **no screen sizes**, so the size-range FAQ branch must be
     skipped for it (the generic branch already guards `if (sizeRange)`, and
     `categorySizeRange` returns "" when there are no numeric sizes — so the
     generic path already handles this correctly). The generic Samsung FAQ copy
     ("authorized Samsung B2B distributor", installation/warranty) is
     appropriate for software EXCEPT the warranty/installation FAQ mentions
     "genuine Samsung units" and "certified installation" which reads oddly for
     cloud software. Add a small `software`-specific FAQ builder branch (like the
     VC one) with software-appropriate answers (deployment/onboarding/support
     instead of installation/sizes).
5. **`lib/whatsapp.ts`**
   - Add a `/categories/software` branch to `getWhatsAppMessage` with a
     software-appropriate pre-filled message.
6. **`components/sections/CategoryGrid.tsx`**
   - Add a 7th `CATEGORY_CARDS` entry (`id: "software"`, an icon, two-line title
     `["Software", "Solutions"]`, colour). Grid is `lg:grid-cols-6` today; with 7
     cards it becomes uneven on desktop — change to `lg:grid-cols-7` OR accept a
     wrap. Decision: bump to `lg:grid-cols-7` and update the `MobileProductScroller`
     `gridCols` prop + the comment. (7 cards, one row on desktop.)
   - Icon: reuse an existing brand icon that reads as "software/cloud". Prefer a
     Cloud or App/Layers style icon from `components/icons`. If none fits, use the
     closest Lucide-backed brand icon already exported.

### Explicitly NOT touched (matches VC precedent)
- **Product finder wizard** (`components/finderConfig.ts` `DISPLAY_TYPES`,
  `INDUSTRY_CATEGORY_SCORE`) — display-only "which screen" tool. VC is absent
  from it; software stays absent too (software isn't sized/placed).
- Navbars, `/products` shell, compare table, quote flow, tel, gallery, search,
  `generateStaticParams`, SKU line, sitemap — all data-driven off
  `products` / `productCategories`, so they pick up the new category and products
  automatically (verified: `generateStaticParams` maps `productCategories`;
  sitemap and product routes map `products`).

## Product data shape (both products)

Reuse the `Product` interface unchanged. `screenSizes: []` (already valid — VC
cameras use it). Repurposed `specs`:

- `resolution` → Deployment value (e.g. `"Cloud SaaS"`)
- `brightness` → Platform value (e.g. `"Signage CMS"` / `"Hospitality"`)
- `operationTime` → Designed-For value (e.g. `"Signage networks"` /
  `"Hotels & resorts"`)
- `specGroups` → real software spec sections (Platform, Deployment,
  Capabilities, Compatibility) for the detail page.

`subCategory`: both share `"Cloud Platform"` (single subcategory ⇒ the category
page renders a flat grid, not grouped — `hasSubCategories` needs >1 distinct).

## Testing

- `data/software.test.ts`: exactly 2 products; every product Samsung
  (brand absent), category `"Software Solutions"`, `catalog2026 === true`, unique
  ids, required spec fields present, `screenSizes` is an (empty) array.
- Existing `lib/vcSpecLabels` behaviour for other categories unchanged (add a
  targeted assertion if a spec-labels test file exists; otherwise the data test
  + typecheck + build cover it).
- `npm test` green, `npx tsc --noEmit` clean, `npm run build` succeeds
  (category page statically generated for `/categories/software`).

## Out of scope

- Real product screenshots beyond what's found on the web now (backfill later).
- Any change to the `/solutions/[industry]` industry route tree.
- Adding software to the product-finder wizard or industry use-case combos.
