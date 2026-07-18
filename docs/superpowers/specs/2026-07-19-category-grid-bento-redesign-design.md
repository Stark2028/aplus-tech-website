# Category Grid — Bento Redesign

**Date:** 2026-07-19
**Component:** [components/sections/CategoryGrid.tsx](../../../components/sections/CategoryGrid.tsx)
**Status:** Approved design — ready for implementation plan

## Problem

The homepage "Shop by Category" section forces all seven categories into a single
desktop row (`lg:grid-cols-7`). At seven columns each card is only ~200px wide, so
two-line titles like "Interactive Displays" and "Commercial & Hotel TV" wrap to three
lines, taglines get squeezed, and the whole row reads as cramped. Adding the seventh
category (Software Solutions) pushed an already-tight layout over the edge.

## Goals

- Give each category card room to breathe on desktop.
- Express a **Samsung-first hierarchy**: Samsung categories dominate; the single
  non-Samsung category (Logitech Video Conferencing) reads as a clear outlier.
- Keep the fast-wayfinding purpose of the section (it sits right after the hero).
- Preserve the existing mobile experience (swipe scroller) untouched.

## Non-Goals

- No changes to category data model or copy in `data/categories.ts` (heroes reuse the
  existing `subtitle` field).
- No changes to the mobile `MobileProductScroller` behavior.
- No new routes or navigation changes.
- No unrelated refactoring of the section.

## Design

### Layout — desktop bento grid

A 4-column CSS grid (`lg:grid-cols-4`) with two hero tiles each spanning `2×2`:

```
[ DIGITAL SIGNAGE (2×2 hero) ] [ Video Walls     ] [ Interactive     ]
[ DIGITAL SIGNAGE (2×2 hero) ] [ Commercial TV   ] [ Software        ]
[ LED SIGNAGE     (2×2 hero) ] [ Video Conf*     ] [ View all → CTA  ]
[ LED SIGNAGE     (2×2 hero) ] ...
```

- **2 hero tiles**: `col-span-2 row-span-2` — Digital Signage and LED Signage.
- **5 compact tiles**: single cell — Video Walls, Interactive, Commercial TV, Software,
  and Video Conferencing (muted).
- **1 synthetic "View all products →" tile** fills the leftover cell so the 4×3 grid is
  complete and gains a useful exit to `/products`.

### Hero-tile selection rationale

- **Digital Signage** — deepest catalog (17 products), core Samsung commercial line,
  broadest-appeal entry point → the "volume" hero.
- **LED Signage** — home of *The Wall*, Samsung's flagship / most aspirational product
  → the "flagship" hero, doing the most brand-halo work.

One volume hero + one flagship hero reads better than two similar tiles.

### Tile visual treatment

**Hero tiles (Digital Signage, LED Signage):**
- Full-bleed soft gradient wash in the category accent color behind a large icon
  (blue for Digital Signage, cyan for LED), instead of the small icon-tile chip.
- Larger title (`text-2xl`); tagline gets 1–2 comfortable lines; plus a supporting line
  pulled from the existing `subtitle` field in `categories.ts`.
- Product count + prominent "Browse →" with the existing hover gap-slide animation.
- Fuller color-field top accent.

**Compact tiles (Video Walls, Interactive, Commercial TV, Software):**
- Today's card, denser but roomy at ~1/4 width: icon-tile chip, two-line title, tagline,
  count + Browse. Same white surface, border, hover-lift, colored top-bar — the system
  stays consistent.

**Video Conferencing (non-Samsung outlier):**
- Same compact size but **muted**: neutral gray icon-tile and gray top-bar instead of
  the teal accent, slightly lower text contrast (still AA). Present and clickable, but
  visually the odd one out so Samsung dominates. No "authorized" or Samsung-adjacent
  styling — consistent with the Logitech VC integration decision.

**"View all products" CTA tile:**
- Quieter dashed-border or tinted tile — arrow + "View all products" linking to
  `/products`. Completes the grid, adds a useful exit.

### Data / config changes

- Extend the `CATEGORY_CARDS` array in `CategoryGrid.tsx` with two per-card fields:
  - `tier: "hero" | "compact" | "muted"`
  - a `gradient` value (or derive the wash from the existing `iconColor`).
- Order the array so grid flow places heroes and fillers correctly.
- Render the synthetic "View all" tile as an element after the `.map()` (it is not a
  category and must not appear in `categories.ts`).
- Keep `getCategoryById` + product-count logic exactly as-is.

### Responsive behavior

- `lg` (≥1024px): 4-col bento as designed.
- `md` (768–1023px): 2-col — heroes span both columns (full-width banners), compacts
  pair up, VC + View-all close the grid.
- `< md`: **unchanged** — existing `MobileProductScroller` swipe carousel. The bento grid
  is gated to `md:`/`lg:`; the scroller remains the mobile branch, matching the current
  mobile/desktop split so tested mobile behavior is undisturbed.

### Accessibility

- Keep the `aria-label` two-line-title fix so screen readers don't hear "DigitalSignage".
- Muted VC stays fully keyboard-focusable; text held at AA contrast — only the accent
  chrome is softened.
- Gradient washes are decorative (behind content); text contrast is validated against the
  card surface, not the gradient.

## Testing / Verification

Presentational change with no unit-testable logic. Verify via the `verify` skill:
build + launch + eyeball the homepage at `lg`, `md`, and mobile widths to confirm no
cramping and that the mobile scroller still works.

## Open Questions

None. Design fully approved across layout, tile treatment, and data/responsiveness.
