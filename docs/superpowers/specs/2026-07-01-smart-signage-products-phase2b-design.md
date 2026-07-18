# Phase 2b — Smart Signage Products

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation plan
**Project:** 2026 Samsung Display Solutions catalog expansion (Phase 2b)

## Context

Phase 1 built the taxonomy + latest-first ranking; Phase 2a populated the new
LED Signage category with 5 products. Phase 2b adds the remaining **Smart
Signage** products from the 2026 catalog that are still missing from the site —
the specialty / environment-specific / next-gen displays — into the existing
**Digital Signage** and **Interactive Display** categories.

Phase 2c (Crystal UHD hospitality TV) remains separate. Onyx and The Wall for
Virtual Production stay excluded.

## Goals

1. Add **7 new product entries** with web-verified specs and real images:
   Spatial, Color E-Paper, Outdoor, Window, Stretched, Small (all Digital
   Signage) and Samsung Flip WMFX (Interactive Display).
2. Each `catalog2026: true` so they lead their category via the existing sort.
3. Reuse existing `Product` fields — no `ProductCard` / type changes.
4. Give **only the new** Digital Signage products `subCategory` chips; leave
   existing signage untagged (renders in the category page's trailing ungrouped
   section, already implemented).

## Non-goals (deferred / excluded)

- Crystal UHD hospitality TV (Phase 2c).
- Retiring older Flip 2 / Flip 3 / Flip Pro entries — they stay (WMFX leads).
- Re-tagging existing Digital Signage products with subCategories.
- Onyx (ICD), Virtual Production (IVC), Solutions/VXT/LYNK.
- Per-model splitting — one entry per catalog series (sub-models in specGroups).

## The 7 products

All `catalog2026: true`.

| id | name | category | subCategory | series |
|----|------|----------|-------------|--------|
| `samsung-spatial-smhx` | Samsung Spatial Signage (SMHX) | Digital Signage | Spatial | SMHX |
| `samsung-color-epaper-emdx` | Samsung Color E-Paper (EMDX) | Digital Signage | Color E-Paper | EMDX |
| `samsung-outdoor-oh` | Samsung Outdoor Signage (OH Series) | Digital Signage | Outdoor | OHA/OHDX/OHB |
| `samsung-window-om` | Samsung Window Signage (OM Series) | Digital Signage | Window | OMA/OMN/OMB/OMDX |
| `samsung-stretched-shc` | Samsung Stretched Signage (SHC) | Digital Signage | Stretched | SHC |
| `samsung-small-qbc` | Samsung Small Signage (QBC) | Digital Signage | Small Signage | QB13C/QB24C |
| `samsung-flip-wmfx` | Samsung Flip (WMFX) | Interactive Display | Flip | WMFX |

### Verified spec anchors (catalog PDF + web)

- **Spatial (SMHX / SM85HX-P):** 85" 4K UHD (2,160×3,840, 9:16 also offered),
  **500 nit**, glasses-free Virtual 3D via 3D Plate tech, 52 mm slim, 24/7,
  Tizen 7.0, Quantum Processor, anti-glare, Samsung VXT + AI Studio. Also a 32"
  FHD (1,080×1,920) portrait model, 8.5 kg, 49.4 mm. CES 2026 Innovation Award.
  Model LH85SMHPBGCXZA.
- **Color E-Paper (EMDX / EM32DX):** 32" WQHD **2,560×1,440** E-Ink Spectra 6
  (also 13" model); up to 77K colors (catalog) / Spectra 6 color; built-in
  **4,600 mAh** battery (~200 days at 1 update/day); **0 W** on static image;
  Wi-Fi, Bluetooth, USB-C; IP5X; Tizen 8.0; Samsung VXT + E-Paper app; recycled
  materials. Model LH32EMDIBGBXZA.
- **Outdoor (OHA/OHDX/OHB):** 1.90m/1.16m/1.39m/61cm; **3,500 nit (peak
  4,000)** (OHB 1,500 nit); UL-verified outdoor visibility; IP56; IK10; auto
  brightness; heat-dissipation; 24/7; Samsung VXT.
- **Window (OMA/OMN/OMB/OMDX):** high-brightness storefront; up to **4,000
  nit** (OMN-D dual-sided 3,000/1,000); IP5X; polarized-sunglass support; auto
  brightness; 24/7; slim (81.2cm OMDX = 4.56 cm depth). FHD/UHD by model.
- **Stretched (SHC):** 94 cm, **16:4.5** stretched ratio, 1,920×540, **700
  nit**, 4,000:1, 24/7, embedded media player, vertical install, Tizen 7.0.
- **Small (QB13C / QB24C):** 33cm (13") / 61cm (24"), FHD 1,920×1,080, **500
  nit (13") / 250 nit (24")**, 16/7, Home UI, Dual Wi-Fi (2.4+5GHz), Samsung
  VXT, slim 19.9 mm (13").
- **Flip WMFX:** 55/65/75/85" 4K UHD, **450 nit**, anti-glare, 26 ms response,
  2,048 pressure levels, Tizen, Samsung Knox, Flip Home, Enhanced Whiteboard,
  rotatable. Model LH55WMFWBGCX…

The implementation plan finalizes any remaining spec cell per product from the
catalog table + one authoritative web source; uncertain values flagged, not
invented.

## Spec shape (reuse existing fields)

Same as 2a — `specs` (resolution / brightness / screenSizes / operationTime) +
full detail in `specGroups`. Special cases:
- **Color E-Paper:** `brightness` = "Reflective e-paper (0 W on static image)";
  `operationTime` = "Always-on (battery)"; `screenSizes` = `["13", "32"]`;
  `resolution` = "2,560 × 1,440 (WQHD)". Pixel/e-ink detail in specGroups.
- **Spatial:** `resolution` = "3,840 × 2,160 (4K UHD)"; note 3D/9:16 in
  specGroups; `screenSizes` = `["32", "85"]`.
- **Outdoor / Window:** `brightness` = headline peak (e.g. "3,500 nit (peak
  4,000)"); per-model nits in specGroups; `screenSizes` from the model set.
- **Stretched:** `screenSizes` = `["37"]` (94 cm ≈ 37"); note 16:4.5 ratio in
  specGroups so the size filter still has a numeric.

## Category placement & grouping

- 6 products → `category: "Digital Signage"`, each with its own `subCategory`.
  This includes Spatial (a 3D display, but grouped under Digital Signage with a
  "Spatial" chip — user-confirmed) and Color E-Paper (kept in Digital Signage as
  the most suitable existing category; user noted it may be moved later if
  needed — not a blocker for 2b).
- Flip WMFX → `category: "Interactive Display"`, `subCategory: "Flip"`.
- On the Digital Signage category page: new products appear in labeled
  subCategory groups; existing untagged signage falls into the trailing
  "products without a subCategory" section — already implemented at
  `app/categories/[slug]/page.tsx` (lines ~149-160). No page-code change.
- Homepage `CategoryGrid` counts and `/products` sections update automatically
  (data-driven).

## Images

Same workflow as 2a: real Samsung images downloaded + validated during build,
**minimum 3**, best-effort ~10, actual counts reported. Location
`public/products/<category-slug>/<id>/` (Digital Signage → `digital-signage/`,
Flip → `interactive/`). Reliable static sources: bluesquare.digital,
knitec.com, creationnetworks.net, and other Shopify/Magento resellers;
Samsung.com galleries are JS-rendered. Resolve real URLs before downloading;
`images[]` lists only files that downloaded, hero first.

## Verification

- `npx tsc --noEmit`, `npm test`, `npm run build` all pass.
- 7 new `/products/<id>` static pages generate; total product count = 52.
- New products lead their categories (all `catalog2026`); assign sensible
  popularity (e.g. Spatial and Flip WMFX high as flagships).
- Digital Signage category page shows the 6 new grouped sections + existing
  ungrouped signage; Interactive shows Flip WMFX leading.
- Every new product's images serve HTTP 200; each has ≥3.
- Size-bucket filter (Phase 2a) still behaves with the new sizes.

## Risks

- **Image sourcing variance** — mitigated by min-3 + reported actuals; if a
  product yields <3 real images, stop and surface to the user.
- **E-Paper / Stretched odd specs** — mapped explicitly above so cards render
  sensibly without a schema change.
- **Digital Signage page mixes grouped + ungrouped** — intended and
  user-approved; the trailing ungrouped section is existing behavior.
