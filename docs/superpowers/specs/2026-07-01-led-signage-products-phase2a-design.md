# Phase 2a — LED Signage Products

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation plan
**Project:** 2026 Samsung Display Solutions catalog expansion (Phase 2a)

## Context

Phase 1 created the empty **LED Signage** category (`led-signage`) with a
"coming soon" placeholder on `/products`, the homepage catalog tabs, and the
category page. Phase 2a populates it with the catalog's direct-view LED lineup
so the category becomes real and the placeholders disappear automatically (the
Phase 1 `comingSoon` guard keys on `totalInCategory === 0`).

This is the first slice of Phase 2. Later slices (2b: Smart Signage additions —
Spatial, Color E-Paper, Outdoor, Window, Stretched, Small, Flip WMFX; 2c:
Crystal UHD hotel TV) are separate specs/plans.

## Goals

1. Add **5 LED product entries** to `data/products.ts`, category `LED Signage`,
   each `catalog2026: true`.
2. Author accurate, **web-verified** specs for each (pixel pitch, brightness,
   cabinet, diode type, refresh, IP, etc.).
3. Source **real Samsung product images** (best-effort ~10 each, minimum 3) into
   `public/products/led-signage/<id>/`.
4. Confirm the LED category now renders products (not "coming soon") and that
   the new products lead the category via the existing latest-first sort.

## Non-goals (deferred)

- Onyx Cinema LED (ICD) — excluded by user.
- The Wall for Virtual Production (IVC, 12,288 Hz) — niche broadcast product,
  skipped in 2a.
- Smart Signage additions (Phase 2b) and Crystal UHD (Phase 2c).
- Any change to `ProductCard` or the `Product` type — LED reuses existing fields
  (see "Spec shape").
- Solutions/VXT/LYNK (still deferred — memory `solutions-category-deferred`).

## The 5 products

All `category: "LED Signage"`, `catalog2026: true`. `subCategory` groups them on
the category page.

| id | name | series | subCategory | pixel pitch (catalog) |
|----|------|--------|-------------|----------------------|
| `samsung-the-wall-mpf` | Samsung The Wall (MPF) | MPF | The Wall | P0.8 / P1.2 / P1.6 |
| `samsung-the-wall-mmf` | Samsung The Wall (MMF) | MMF | The Wall | P0.9 / P1.2 / P1.5 |
| `samsung-indoor-led-ie` | Samsung Indoor LED (IE Series) | IEA/IEF | Indoor LED | P1.2 / P1.5 / P2.0 / P2.5 / P4.0 |
| `samsung-all-in-one-led-iab` | Samsung All-in-One LED (IAB) | IAB | All-in-One LED | P0.8 / P1.2 / P1.6 |
| `samsung-all-in-one-led-iac` | Samsung All-in-One LED (IAC) | IAC | All-in-One LED | P1.5 |

### Verified spec anchors (catalog PDF + web)

Values authored into each entry are cross-checked against the 2026 catalog spec
tables and Samsung/reseller pages. Confirmed so far:

- **The Wall MPF** — flip-chip RGB LED; catalog: 1,600 nit (P1.6) / 1,800 nit
  (P0.8, P1.2) peak; contrast 29,000:1 (P0.8) / 41,000:1 (P1.2) / 43,000:1
  (P1.6); EMC Class B; TUV Eye Comfort; IP40/20 (front/rear); front service.
  Current global model codes: LH012MPFAAA (P1.2), LH016MPFAAA (P1.6).
- **The Wall MMF** — flip-chip RGB; catalog: 600 nit; 8,000:1 (P0.9, P1.2) /
  10,000:1 (P1.5); EMC Class A; TUV Eye Comfort.
- **Indoor LED (IE)** — SMD; catalog IEA P1.5/P2.0/P2.5/P4.0: 1,000 nit
  (P1.5–P2.5) / 800 nit (P4.0); contrast 6,000:1 (P1.5) / 7,500:1 (P2.0) /
  5,000:1 (P2.5, P4.0); IEF P1.2: 600 nit, 4,000:1; HDR10/10+, GoB, NQM AI
  Processor, 4K AI upscaling. Current codes: IE015A (P1.5), IE020A (P2.0),
  IE025A (P2.5).
- **All-in-One IAB** — 146" (3.70 m); P0.8 (1,600 nit, 24,000:1) / P1.6 (1,400
  nit, 22,000:1); Quick Build, built-in control box, all-inclusive; EMC Class A;
  TUV Eye Comfort; IP20; ~160 kg.
- **All-in-One IAC** — 130" (3.30 m) 2K; P1.5; 1,000 nit; 6,000:1; 3,840 Hz
  refresh; all-inclusive (control box, wall brackets, speakers, décor bezels).
  Current code: LH015IACCHS.

The implementation plan finalizes any remaining spec cell by reading the catalog
table + one authoritative web source per product; genuinely uncertain values are
flagged, not invented.

## Spec shape (reuse existing `Product` fields — no schema change)

LED has no fixed "resolution" or single diagonal, so map to the existing shape:

- `specs.resolution` → pixel-pitch options string, e.g. `"P1.2 / P1.6 pixel pitch"`.
- `specs.brightness` → headline peak brightness, e.g. `"1,600 nit (peak)"`.
- `specs.operationTime` → `"24/7"` (LED is 24/7-rated).
- `specs.screenSizes` → representative diagonals for the size filter:
  - IAB → `["146"]`; IAC → `["130", "146"]`.
  - The Wall / Indoor LED are modular → common configured diagonals
    `["110", "130", "146"]` (Indoor LED may add `["165"]`). Chosen so the size
    filter stays meaningful; documented as "representative, modular/any-size."
- Full LED detail lives in **`specGroups`**: `Pixel Pitch`, `Diode Type`,
  `Brightness (peak)`, `Contrast Ratio`, `Refresh Rate`, `Cabinet Size`,
  `Weight (per cabinet)`, `Service`, `IP Rating`, `Certification`, plus a
  `Features`/`Processor` group (NQM AI, HDR, Quick Build, etc.) and
  `Connectivity` where the catalog lists it.

The card's two pills therefore show **Brightness** + pixel-pitch (via
`resolution`); the detail-page `specGroups` table shows everything. No
`ProductCard` or `Product`-type change. Same information as a dedicated-field
approach — only the storage differs.

## Images

- Location: `public/products/led-signage/<id>/1..N.<ext>` (webp/jpg/png, matching
  existing convention).
- Source: **real Samsung product images from the web**, downloaded during the
  build. Target ~10 per product, **minimum 3** (hero + 2); actual count per
  product is reported. No fabricated/placeholder imagery in the shipped set
  beyond the guaranteed minimum.
- **URL resolution first:** guessing Samsung CDN paths 404s (verified). The plan
  resolves real image URLs per product via WebSearch/WebFetch on the product
  page or gallery before downloading. Downloads themselves work in this env
  (verified: Samsung asset fetch returned HTTP 200).
- `images[]` in each product lists only files that actually downloaded, in
  hero-first order.

## Verification

- `npx tsc --noEmit` — data type-checks against `Product`.
- `npm run build` — succeeds; `/products/<new-id>` static pages generate.
- `npm test` — existing comparator tests still pass (no logic change).
- Manual/curl: `/categories/led-signage` and the `/products` LED section now
  show the 5 product cards (NOT "coming soon"); the homepage LED tab shows
  cards; every product's images load (HTTP 200, non-empty).
- Ordering: the 5 LED products appear (all `catalog2026`, so ordered by
  popularity among themselves — assign sensible popularity values, e.g. The
  Wall highest as the flagship).

## Risks

- **Image sourcing variance:** some models may yield fewer than 10 good images;
  mitigated by the min-3 guarantee + reported actuals. Rights: use Samsung's own
  product/press imagery (same practice as existing catalog).
- **Spec-cell gaps:** a few catalog cells are ambiguous in the PDF; resolved via
  web per product, flagged when uncertain rather than guessed.
- **Model-naming drift:** India-catalog names (IEA/IEF, IAB/IAC) vs. current
  global codes (IE015A, LH015IACCHS) — entries use the catalog series names with
  current model codes noted in `specGroups`.
