# Phase 1 — Category Taxonomy + "Latest First" Ranking + Spec Audit

**Date:** 2026-06-30 (revised after data audit)
**Status:** Approved design, ready for implementation plan
**Project:** 2026 Samsung Display Solutions catalog expansion (Phase 1 of 2)

## Context

The site sells Samsung commercial displays. Products live in `data/products.ts`
(40 products) grouped by a `category` string matching a `ProductCategory.name`
in `data/categories.ts`. Categories are a hard-coded set of four
(`digital-signage`, `video-walls`, `interactive`, `commercial-tv`) enumerated as
the `CategorySlug` union type.

The user supplied the **Samsung 2026 Display Solutions Catalog** PDF and wants
the website to **showcase the latest (2026-catalog) products first**, then older
models. This is Phase 1 of a two-phase project:

- **Phase 1 (this spec):** taxonomy change (add LED Signage), "latest first"
  ranking, and a **spec-accuracy audit** of existing products vs. the catalog.
- **Phase 2 (later spec):** add the new catalog products (full data +
  web-sourced images) into the taxonomy.

## Goals

1. Add a new top-level **LED Signage** category (for Phase 2's The Wall, Indoor
   LED, All-in-One LED — **Onyx excluded** per user).
2. Make 2026-catalog products rank **first** in every product listing, via a
   **two-key sort** (latest-flag, then popularity).
3. **Audit** existing product specs against the catalog and **report** mismatches
   for user sign-off before correcting them.
4. Do all of the above **without breaking existing URLs or SEO** (keep the four
   current category slugs unchanged).

## Non-goals (deferred)

- Adding the actual new products (Phase 2).
- A "Solutions" category for Samsung VXT / LYNK Cloud (deferred — memory
  `solutions-category-deferred`).
- Any badge changes — leave `lib/productBadges.ts` untouched (user is leaning
  toward removing all badges; memory `product-badges-maybe-remove`).
- Collapsing Digital Signage / Video Walls / Interactive into one "Smart Signage"
  group (rejected — preserve use-case categories, URLs, SEO).

## Approved taxonomy

Keep the four existing **use-case** categories (slugs unchanged) and add one new
top-level category:

| Category | Slug | Status | Phase 2 additions |
|----------|------|--------|-------------------|
| Digital Signage | `digital-signage` | keep | Spatial, Color E-Paper, Supersized, Outdoor, Window, Stretched, Small (via `subCategory` chips) |
| Video Walls | `video-walls` | keep | (catalog series already represented) |
| Interactive Displays | `interactive` | keep | Samsung Flip WMFX |
| Hospitality & Business TV | `commercial-tv` | keep | Crystal UHD HU8000F |
| **LED Signage** | `led-signage` | **NEW** | The Wall (MPF/MMF), Indoor LED (IEA/IEF), All-in-One LED (IAB/IAC/MMF-A) |

LED Signage ships in Phase 1 **empty**, showing a "Products coming soon" state on
every surface (see "Empty-LED-category behaviour").

## Data model changes

### `data/categories.ts`
- Add `"led-signage"` to the `CategorySlug` union.
- Append a fifth `ProductCategory` (`id: "led-signage"`, `name: "LED Signage"`,
  `navLabel: "LED Signage"`, plus catalog-derived tagline/subtitle/useCases/
  description for direct-view / fine-pitch LED walls).

### `data/products.ts`
- Add an optional field to the `Product` interface:
  ```ts
  /** True for products in the current (2026) Samsung catalog. Drives the
   *  two-key "latest first" sort. */
  catalog2026?: boolean;
  ```

## The `catalog2026` mapping (user-approved)

**13 products flagged `catalog2026: true`** (exact catalog model-code matches):

| id | series | catalog section |
|----|--------|-----------------|
| samsung-signage-qbc | QBC | UHD Signage |
| samsung-signage-qhc | QHC | UHD Signage |
| samsung-signage-qmc | QMC | UHD Signage |
| samsung-qpdx105 | QPDX-5K | Supersized |
| samsung-qh115fx | QHFX | Supersized |
| samsung-touch-qbc-t | QMB-T | Touch Signage |
| samsung-qbc-t | QBC-T | Touch Signage |
| samsung-interactive-wafx-p | WAFX-P | Interactive |
| samsung-waf-series | WAF | Interactive |
| samsung-business-tv-befx-h2 | BEFX-H2 | Business TV |
| samsung-vhc-e | VHC-E | Video Wall |
| samsung-videowall-vmc-r | VMC-R | Video Wall |
| samsung-vmb-u-46, samsung-vmb-u-55 | VMB-U | Video Wall |

**Everything else is OLDER** (no `catalog2026` flag), including — per explicit
user decision — the legacy 55"-SKU video walls (`vm55c-r`, `vh55c-r`,
`vh55c-e`, `vm55c-e`) and `vmb-e`. Other legacy models: QET, QBR-B, QMR-T,
MP016F, VMB-R, VH55R, VHB-E, Flip Pro/3/2, WAC, WAD, BEA-H, BEC-H, BED-H, and
all AU/BU/U-series hotel TVs.

Note: in Phase 1 the only **Commercial TV** latest product is BEFX-H2 (Business
TV). The catalog's Crystal UHD hotel TVs (HU8000F/HU7010F) are Phase 2
additions, so "latest first" in that category mostly takes effect in Phase 2.

## Ranking — two-key sort (replaces the rejected popularity-bump)

Listings sort by `popularity` desc in four places: `ProductCatalogSection`,
`ProductsClientShell`, `app/solutions/[industry]/page.tsx`,
`app/categories/[slug]/page.tsx`. **Sorting is per-category** (each listing
filters by category, then sorts), so "latest first" is a *within-category*
ordering.

**Why the original "bump popularity into a 90-99 band" was rejected:** the
existing popularity numbers actively contradict catalog recency. Example
(Interactive Display): forcing the 2026 models (WAFX-P=91, WAF=66) above the
non-2026 WAC/Flip-Pro/Flip-3 (all 99) and Flip-2 (98) would put the *older* WAF
above the flagship Flip Pro — bad merchandising — and requires hand-juggling
~40 numbers into a cramped band.

**Approved approach** — change each of the four sort comparators to a two-key
sort, leaving every `popularity` value as-is:
```ts
.sort((a, b) =>
  (b.catalog2026 ? 1 : 0) - (a.catalog2026 ? 1 : 0)   // latest group first
  || (b.popularity || 0) - (a.popularity || 0)         // then popularity
)
```
This keeps popularity meaningful as the within-group tiebreaker, is self-
documenting, and is a one-line change per site. Consider extracting a shared
`byLatestThenPopularity` comparator (e.g. in `lib/productSort.ts`) so the four
sites stay identical and it is unit-testable.

## Spec-accuracy audit (new requirement)

The user asked to verify each existing product's specs against the catalog.
Only the **13 `catalog2026` products** can be audited (older models aren't in the
2026 catalog, so there is no authoritative source to check them against — this
limitation is reported, not silently skipped).

**Mismatches already found (to confirm + fix in the plan):**

| Product | Field | Site value | Catalog value |
|---------|-------|-----------|---------------|
| samsung-touch-qbc-t (QMB-T) | operation | 16/7 | **24/7** |
| samsung-touch-qbc-t (QMB-T) | brightness | 300 nit | **500 nit** (w/o glass; 300 is with-glass) |
| samsung-qbc-t (QBC-T) | resolution | 3,840×2,160 (4K) | **1,920×1,080 (FHD)** |
| samsung-qbc-t (QBC-T) | brightness | 300 nit | **250 nit** (w/o glass) |
| samsung-vhc-e (VHC-E) | brightness | 500 nit | **700 nit** |
| samsung-interactive-wafx-p (WAFX-P) | operation | 16/7 | **12/7** |
| samsung-waf-series (WAF) | operation | 16/7 | **12/7** |

Confirmed-correct (sampled): QHC, QMC, QBC, QPDX-5K, QH115FX, BEFX-H2, VMC-R,
VMB-U core specs match the catalog.

**Process:** the implementation plan produces the **full** audit table for all
13 (resolution, brightness, sizes, operation, and key `specGroups`/connectivity
where the catalog lists them), the user signs off, then corrections are applied.
Touch-glass nuance (brightness differs with/without optional touch glass) is
shown explicitly rather than flattened. Where a "mismatch" is actually a defensible
editorial choice (e.g. listing the with-glass brightness), it's flagged as
optional, not force-changed.

## Surfaces that show categories (blast radius)

Adding `led-signage` flows automatically through everything that iterates
`productCategories` (no per-slug `switch` exists — verified by grep):
- `components/navbar/NavbarDesktop.tsx` + `NavbarMobile.tsx` — Products dropdown
- `components/ProductsCategoryNav.tsx` — sticky category tabs on `/products`
- `app/categories/[slug]/page.tsx` — `generateStaticParams` + empty-state UI
- `app/sitemap.ts`, `lib/jsonLd.ts` (`categoryCollectionLd`), OG-image routes
- `components/finderConfig.ts` `finderCategoryHref`

Surfaces that **hard-code** the four categories and need a manual 5th entry:
- `components/sections/CategoryGrid.tsx` — `CATEGORY_CARDS` array: add an LED card
  (icon + colour). `count` will be 0 until Phase 2 — acceptable.
- `components/finderConfig.ts` — `DISPLAY_TYPES` array: add `LED Signage`.

## Empty-LED-category behaviour

User choice: **show it empty with "coming soon."** Three distinct surfaces, two
need code changes:

1. **`/categories/led-signage`** — empty-state placeholder already implemented
   (`app/categories/[slug]/page.tsx` lines 117-128). Works for free.
2. **`/products` (`ProductsClientShell.tsx`)** — line 40 does
   `.filter((g) => g.items.length > 0)`, which **drops zero-product categories
   entirely**. LED would not render and its `ProductsCategoryNav` tab would
   scroll to a missing section. **Fix:** keep categories that are empty
   *before filtering* in `grouped` and render an inline "Products coming soon"
   placeholder for them; still show the existing "No products match your filters"
   message when a category is non-empty but filtered to zero.
3. **`ProductCatalogSection.tsx` (homepage "Browse Our Full Range" tabs)** —
   iterates `productCategories` for tabs (line 76) and maps `filtered` with **no
   empty guard** (line 95). An empty LED tab renders a blank/broken
   `MobileProductScroller`. **Fix:** render a "Products coming soon" placeholder
   when `filtered.length === 0`. (Originally missed; caught in the re-audit.)

`categoryCollectionLd` will emit `numberOfItems: 0` for the empty LED category —
harmless but noted; if undesirable, suppress the ItemList when empty.

## Testing / verification

- `npm run build` (or `tsc --noEmit`) passes — the `CategorySlug` union change
  must type-check across all consuming files.
- Shared sort comparator unit test: a `catalog2026` product sorts before a
  higher-`popularity` non-2026 product; ties break by popularity.
- Manual: `/products`, homepage catalog tabs, and category pages show 2026
  products first within each category; the LED Signage tab/card/finder option
  appears and shows the coming-soon placeholder (not a blank carousel).
- Existing URLs unchanged: `/products?category=video-walls`,
  `/categories/commercial-tv`, etc. still resolve.
- Spec corrections match the user-approved audit table.

## Risks

- **Within-category only:** "latest first" is per-category, not a global feed.
  This matches how every listing works today and is the user's intent (browse by
  category). Documented so it isn't mistaken for a bug.
- **Older products unauditable:** legacy models have no 2026-catalog entry to
  verify against; the audit reports this rather than implying full coverage.
- **Empty LED category** is intentional and user-approved for the Phase 1
  interval; all three empty surfaces are handled.
- **Touch-glass spec nuance:** QMB-T/QBC-T brightness depends on optional touch
  glass; corrections preserve the distinction instead of picking one number
  silently.
