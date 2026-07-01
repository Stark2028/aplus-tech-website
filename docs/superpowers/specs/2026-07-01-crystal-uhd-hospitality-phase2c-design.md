# Phase 2c — Crystal UHD Hospitality TVs

**Date:** 2026-07-01
**Status:** Approved design, ready for implementation plan
**Project:** 2026 Samsung Display Solutions catalog expansion (Phase 2c — final Phase 2 slice)

## Context

Phase 2a added LED Signage; Phase 2b added the Smart Signage specialty
products. Phase 2c completes the catalog's physical-display coverage by adding
the 2026 **Crystal UHD hospitality TVs** into the existing **Commercial TV**
category (Hotel TV sub-group). This is the last remaining catalog product family
(Solutions/VXT/LYNK remain deferred; Onyx and Virtual Production excluded).

## Goals

1. Add **2 new hotel-TV entries** with web-verified specs and real images:
   Crystal UHD **HU8000F** (global flagship) and **HU7010F** (India-only).
2. Both `catalog2026: true`, `category: "Commercial TV"`, `subCategory: "Hotel TV"`
   — so they lead the Hotel TV group ahead of the older HGU/AU-series models.
3. Reuse existing `Product` fields (hospitality features in `specGroups`) — no
   `ProductCard` / type changes.

## Non-goals

- Solutions/VXT/LYNK (still deferred — memory `solutions-category-deferred`).
- Retiring the older hotel TVs (HGU800F/HGU701F/AU-series) — they stay below.
- Onyx, Virtual Production IVC.

## The 2 products

Both `category: "Commercial TV"`, `subCategory: "Hotel TV"`, `catalog2026: true`.

| id | name | series | sizes | notes |
|----|------|--------|-------|-------|
| `samsung-hotel-tv-hu8000f` | Samsung Crystal UHD Hotel TV (HU8000F) | HU8000F | 43/50/55/65/75/85" | AirSlim, global flagship |
| `samsung-hotel-tv-hu7010f` | Samsung Crystal UHD Hotel TV (HU7010F) | HU7010F | 43/50/55/65/75" | India-only, no AirSlim |

### Verified spec anchors (catalog PDF + web)

- **HU8000F:** 4K UHD (3,840×2,160) VA panel, direct backlight, HDR10/HDR10+,
  60 Hz, **Crystal Processor 4K**, AI 4K upscaling, Dynamic Crystal Color,
  Motion Xcelerator, Contrast Enhancer, 20 W stereo + adaptive sound.
  **AirSlim** design. Hospitality: **LYNK Cloud**, Tizen Enterprise Platform,
  **Google Cast**, **Apple AirPlay**, Smart Hub, Samsung TV Plus, Multi-Code
  Remote, **SmartThings Pro**, **Samsung Knox**. Wi-Fi 5, Bluetooth 5.2, 3×HDMI,
  2×USB-A (per catalog; some sources list 2×HDMI on larger sizes). Sizes
  43/50/55/65/75/85". Model codes HG43U800FNFXZA … HG85U800FNFXZA.
- **HU7010F:** same core (Crystal Processor 4K, Dynamic Crystal Color, 4K
  upscaling, Motion Xcelerator, HDR, Contrast Enhancer, LYNK Cloud, Tizen
  Enterprise, Google Cast, Apple AirPlay, Samsung TV Plus, Multi-Code Remote,
  SmartThings Pro, Samsung Knox) **minus AirSlim**. Sizes 43/50/55/65/75".
  **Launched in India only.** Wi-Fi 5, Bluetooth 5.2, 2×HDMI, 2×USB-A.

The plan finalizes any remaining cell from the catalog table + one authoritative
web source; uncertain cells flagged, not invented.

## Spec shape (reuse existing fields)

Same as the existing hotel TVs on the site:
- `specs.resolution` = "3,840 × 2,160 (4K UHD)"; `brightness` = a hospitality-TV
  appropriate value (existing hotel TVs use a nit figure or "HDR" — match the
  existing entries' convention, e.g. `"HDR10+"` if they don't carry nits, or a
  typical value); `screenSizes` = the size list; `operationTime` = match the
  existing hotel-TV convention (hotel TVs are typically **16/7**).
- `specGroups`: "Display" (panel, resolution, HDR, processor, upscaling),
  "Hospitality Features" (LYNK Cloud, Tizen Enterprise, Google Cast, AirPlay,
  SmartThings Pro, Samsung TV Plus, Multi-Code Remote, Knox), "Connectivity"
  (Wi-Fi 5, BT 5.2, HDMI, USB-A), and "Design/Model" (AirSlim for HU8000F, model
  codes). The plan reads an existing hotel-TV entry first to match field naming.

## Category placement & ranking

- Both → `category: "Commercial TV"`, `subCategory: "Hotel TV"`. They join the
  existing grouped Hotel TV section on the Commercial TV category page (which
  already groups by subCategory).
- `catalog2026: true` + the Phase 1 two-key sort → both lead the Hotel TV group
  ahead of the older HGU/AU models. Assign popularity HU8000F ~97, HU7010F ~93
  (tiebreak within the latest group).

## Images

Same workflow as 2a/2b: real Samsung images downloaded + validated during build
into `public/products/commercial-tv/<id>/`, **minimum 3**, best-effort ~10,
actual counts reported. Reliable sources: Samsung Global Newsroom (HITEC 2025
HU8000F launch press images), knitec.com, B&H. Resolve real URLs before
downloading; `images[]` lists only files that downloaded, hero first. If a model
yields <3 real images, STOP and surface to the user.

## Verification

- `npx tsc --noEmit`, `npm test`, `npm run build` all pass.
- 2 new `/products/<id>` static pages generate; total product count = 54.
- Commercial TV category page shows the 2 new TVs leading the Hotel TV group;
  older hotel TVs follow.
- Both products' images serve HTTP 200; each has ≥3.
- Existing hotel TVs unchanged.

## Risks

- **Image sourcing variance** — mitigated by min-3 + reported actuals; surface
  if short.
- **HU7010F India-only** — correctly labelled; relevant for this India-based
  reseller.
- **HDMI count ambiguity** (catalog says 3×HDMI for HU8000F; some sources 2×) —
  use the catalog value, note in specGroups; flag if a definitive source
  contradicts.
