# Phase 1 — Category Taxonomy Redesign + "Latest First" Re-ranking

**Date:** 2026-06-30
**Status:** Approved design, ready for implementation plan
**Project:** 2026 Samsung Display Solutions catalog expansion (Phase 1 of 2)

## Context

The site sells Samsung commercial displays. Products live in `data/products.ts`
(~40 products) and are grouped by a `category` string that must match a
`ProductCategory.name` in `data/categories.ts`. Categories are a hard-coded set
of four (`digital-signage`, `video-walls`, `interactive`, `commercial-tv`)
enumerated as the `CategorySlug` union type.

The user supplied the **Samsung 2026 Display Solutions Catalog** PDF and wants
the website to **showcase the latest (2026-catalog) products first**, everywhere
products appear, then older models. This is Phase 1 of a two-phase project:

- **Phase 1 (this spec):** redesign the category taxonomy + re-rank so 2026
  products surface first.
- **Phase 2 (later spec):** add the new catalog products (full data +
  web-sourced images) into the new taxonomy.

## Goals

1. Add a new top-level **LED Signage** category (for Phase 2's The Wall, Indoor
   LED, All-in-One LED — **Onyx excluded** per user).
2. Make 2026-catalog products rank **first** in every product listing.
3. Make the "New" badge reflect real 2026-catalog membership instead of a random
   hash.
4. Do all of the above **without breaking existing URLs or SEO** (keep the four
   current category slugs unchanged).

## Non-goals (deferred)

- Adding the actual new products (Phase 2).
- A "Solutions" category for Samsung VXT / LYNK Cloud software — explicitly
  deferred by the user (see memory `solutions-category-deferred`).
- Refreshing existing products' spec text from the PDF.
- Collapsing Digital Signage / Video Walls / Interactive into a single "Smart
  Signage" group — rejected to preserve buyer-facing use-case categories,
  existing URLs, and SEO.

## Approved taxonomy

Keep the four existing **use-case** categories (their slugs unchanged) and add
one new top-level category:

| Category | Slug | Status | Phase 2 additions |
|---|---|---|---|
| Digital Signage | `digital-signage` | keep | Spatial, Color E-Paper, Supersized, Outdoor, Window, Stretched, Small (via `subCategory` chips) |
| Video Walls | `video-walls` | keep | (catalog series already represented) |
| Interactive Displays | `interactive` | keep | Samsung Flip WMFX |
| Hospitality & Business TV | `commercial-tv` | keep | Crystal UHD HU8000F |
| **LED Signage** | `led-signage` | **NEW** | The Wall (MPF/MMF), Indoor LED (IEA/IEF), All-in-One LED (IAB/IAC/MMF-A) |

The LED Signage category ships in Phase 1 **empty**, showing the existing
"Products coming soon — contact us for availability" placeholder.

### `subCategory` chip vocabulary (Digital Signage)

Phase 2 will assign these `subCategory` values (no products carry them yet, so
Phase 1 only documents the set as a comment in `products.ts`):
`Standalone Signage`, `Supersized`, `Outdoor`, `Window`, `Stretched`,
`Small Signage`, `Spatial`, `Color E-Paper`, `Touch Signage`, `LED Display`,
`Large Format`.

## Data model changes

### `data/categories.ts`
- Add `"led-signage"` to the `CategorySlug` union.
- Append a fifth `ProductCategory` entry:
  - `id: "led-signage"`, `name: "LED Signage"`, `navLabel: "LED Signage"`.
  - `tagline`, `subtitle`, `useCases`, `description` written from the catalog
    (fine-pitch / direct-view LED for large-format walls, lobbies, control
    rooms, retail flagship installs; The Wall, Indoor LED, All-in-One LED).

### `data/products.ts`
- Add an optional field to the `Product` interface:
  ```ts
  /** True for products in the current (2026) Samsung catalog.
   *  Drives "latest first" ranking and the "New" card badge. */
  catalog2026?: boolean;
  ```
- Mark confirmed 2026-catalog products with `catalog2026: true`:
  **QBC, QHC, QMC, QPDX (QPDX-5K), QH115FX (≈QHFX), WAFX-P, WAF, BEFX-H2**,
  and the Video Wall series that map to the catalog's VHC-R/VMC-R/VHC-E/VMC-E/
  VMB-U family (`samsung-vhc-e`, `samsung-videowall-vmc-r`, `samsung-vmb-e`,
  `vh55c-e`, `vh55c-r`, `vm55c-e`, `vm55c-r`, `vmb-u-46`, `vmb-u-55`).
  *(Exact membership list is finalized in the implementation plan after a
  series-by-series check against the catalog text; ambiguous mappings are
  surfaced to the user, not guessed.)*

## Re-ranking ("latest first")

The site sorts by `popularity` desc in four places
(`ProductCatalogSection`, `ProductsClientShell`, `solutions/[industry]`,
`categories/[slug]`). Per the user's chosen approach we **bump popularity**
rather than change the sort:

- Reserve a **90–99 "current catalog" band** for `catalog2026` products.
- Pull clearly-superseded older models (Flip 2, Flip 3, QET, QBR-B, older
  AU-series hotel TVs) **below 90**.
- Preserve relative order within each band by existing popularity where
  possible.
- Document the band convention in a comment block at the top of `products.ts`
  so future edits respect it. `catalog2026` is the source of truth for
  "is latest"; the popularity band is the sort mechanism.

The four sort sites are **not** modified — bumping the numbers is sufficient and
keeps the change centralized in data.

## "New" badge

`lib/productBadges.ts` `getProductBadge(productId)` currently returns "New" for
~5% of products via a hash. Change it to return **"New" when the product is a
`catalog2026` product**, falling back to the existing hash distribution for
"Best Seller" / "Popular" on non-2026 products.

- Signature change: `getProductBadge` needs access to the product, not just its
  id. Update the call site in `ProductCard.tsx` (line 46) to pass the product
  (or a boolean `isLatest`). The function stays pure and unit-testable.

## Surfaces that show categories (blast radius)

Adding `led-signage` flows automatically through everything that iterates
`productCategories` (no per-slug `switch` exists — verified by grep):
- `components/ProductsCategoryNav.tsx` — nav tabs (iterates `productCategories`)
- `app/categories/[slug]/page.tsx` — generates static params + empty-state UI
  (already present, lines 117-128)
- `app/sitemap.ts`, `lib/jsonLd.ts`, OG-image routes — read from data
- `components/finderConfig.ts` `finderCategoryHref` — resolves name→slug

Surfaces that **hard-code** the four categories and need a manual 5th entry:
- `components/sections/CategoryGrid.tsx` — `CATEGORY_CARDS` array: add an LED
  card with an icon (lucide; e.g. `Grid3x3` / `Cpu`) + colour. Card shows the
  product count, which will be `0` until Phase 2 — acceptable per user
  ("show it empty with coming soon").
- `components/finderConfig.ts` — `DISPLAY_TYPES` array: add `LED Signage`.

Each is patched explicitly in the plan.

## Empty-LED-category behaviour

User choice: **show it empty with "coming soon."**

- **Dedicated category page** (`/categories/led-signage`): empty-state
  placeholder already implemented (`app/categories/[slug]/page.tsx` lines
  117-128) — works for free.
- **Homepage `CategoryGrid` card:** renders with `count: 0`; acceptable.
- **`/products` page — REQUIRES A CODE CHANGE.**
  `components/ProductsClientShell.tsx` line 40 currently does
  `.filter((g) => g.items.length > 0)`, which **drops any zero-product
  category entirely**. With that filter in place, the LED Signage section
  would *not* render on `/products`, and the `ProductsCategoryNav` LED tab
  would scroll to a section that doesn't exist — directly violating the user's
  "show it empty with coming soon" choice.
  **Fix:** keep zero-product categories in `grouped` (don't filter them out
  when there are no *active filters*), and render an inline
  "Products coming soon — contact us for availability" placeholder for a
  category whose `items` is empty. When the empty state is caused by the user's
  *filters* (vs. a genuinely empty catalog), preserve the existing
  "No products match your filters" behaviour — i.e. only show the coming-soon
  placeholder for categories that are empty before filtering, not after.

## Testing / verification

- `npm run build` (or `tsc`) passes — the `CategorySlug` union change must
  type-check across all 27 consuming files.
- `getProductBadge` unit behaviour: a `catalog2026` product → "New"; a known
  non-2026 product → its prior hash badge (or null).
- Manual: `/products` shows 2026 products first within each category; the LED
  Signage tab/card/finder option appears and its page shows the coming-soon
  placeholder.
- Existing URLs unchanged: `/products?category=video-walls`,
  `/categories/commercial-tv`, etc. still resolve.

## Risks

- **Popularity-band fragility:** bumping numbers conflates "new" with "popular."
  Mitigated by `catalog2026` being the explicit truth signal + a documented
  band comment.
- **Catalog-match ambiguity:** some site series don't map 1:1 to catalog model
  codes. The plan resolves each by reading the catalog text; genuinely
  ambiguous ones are surfaced to the user rather than guessed.
- **Empty LED category** is intentional and user-approved for the Phase 1
  interval.
