# Quote Drawer + Finder Presets + Mobile Overlap Fix — Design

**Date:** 2026-07-25
**Status:** Approved (design), pending implementation plan

## Overview

Round 1 of a frontend conversion/polish pass on the Aplus Technology Solutions
site (`b2b-website`). Three self-contained changes, in low-risk order:

1. **Mobile overlap fix** — one-line positioning fix for `ComparisonFloatingBar`.
2. **Quote drawer + toast** — a slide-over drawer giving instant feedback when a
   product is added to the quote, opened from a non-intrusive toast.
3. **Finder use-case presets** — 1-click chips on the product finder's Step 1.

### Out of scope (deferred, by decision)

- **2-tier lead gate** (email-only light mode) — dropped this round; higher
  bug risk / effort than its value warrants right now.
- **Desktop mega-menu** — the largest, most cosmetic item; deferred to its own
  round where it gets proper attention and series-code verification.

## Context (verified against the codebase)

- `context/QuoteContext.tsx` already holds `isQuoteOpen` + `toggleQuote`, and
  `addItem` already calls `setIsQuoteOpen(true)` — but **nothing consumes that
  state today** (orphaned). The drawer will consume it; the auto-open call is
  being replaced by a toast per the decision below.
- `<Toaster richColors position="bottom-right" />` is mounted globally in
  `app/layout.tsx`, so `toast()` from `sonner` works anywhere client-side.
- `MobileStickyCTA` is `md:hidden`, `fixed inset-x-0 bottom-0 z-40`.
  `ComparisonFloatingBar` is `fixed bottom-6 … z-50` and renders on mobile — so
  it currently overlaps the sticky bar. `BackToTop` already uses `bottom-20` to
  clear the same bar.
- `ProductFinderSection` Step 1→2→3→results is driven by three state fields:
  `industry` (`IndustryId | ""`), `displayType` (a category name string), and
  `sizeRangeId`. `goToResults()` sets `step="results"`; a `useMemo` scorer keyed
  on `[step, industry, displayType, sizeConfig]` produces results.
- Finder data (`DISPLAY_TYPES`, `SIZE_RANGES`, `availableSizeRangeIds`,
  `INDUSTRY_CATEGORY_SCORE`) lives in `components/finderConfig.ts` and is
  unit-tested — the right home for preset data.

## Resolved decisions

- **Add-to-quote feedback:** toast with a "View Quote" action button
  (**not** auto-open drawer, **not** inline-only).
- **Mega-menu style / lead-gate caching:** N/A — both features deferred.

---

## Feature A — Quote drawer + toast feedback

### A1. `context/QuoteContext.tsx` (modify)

- Remove the `setIsQuoteOpen(true)` auto-open from `addItem`.
- Add `openQuote` and `closeQuote` callbacks over the **existing** single
  `isQuoteOpen` state (no new/duplicate state). Keep `toggleQuote`.
- On a **successful** add, fire:
  `toast.success("<product.name> added to quote", { action: { label: "View Quote", onClick: openQuote } })`.
- **Refactor to avoid the functional-updater side-effect trap:** decide
  add-vs-limit by reading current `quoteItems` (add it to `addItem`'s deps)
  rather than mutating a flag inside the `setQuoteItems` updater. The
  `limitReached` path stays silent — the existing `QuoteLimitToast` already
  surfaces it, so no double toast.
- Extend `QuoteContextType` with `openQuote` / `closeQuote`.

### A2. `components/quote/QuoteDrawer.tsx` (new)

- `"use client"`; **portaled to `document.body`** with the standard SSR mount
  guard (mirrors `LeadGateModal` / `ChatPanel`).
- Right-side slide-over: dimmed backdrop (click-to-close), `Escape` closes,
  body-scroll lock while open, focus moved into the panel on open. Respects
  `prefers-reduced-motion` for the slide transition.
- Reads from `useQuote()`: `quoteItems`, `updateQuantity`, `removeItem`,
  `clearQuote`, `isQuoteOpen`, `closeQuote`.
- Layout:
  - Header: "Your Quote (n)" + close button.
  - Item rows: thumbnail, name, SKU line (`formatSkuLine`), −/+ quantity
    stepper (`updateQuantity`, min 1), remove button (`removeItem`).
  - Footer: total item count, **"Proceed to Quote Request"** → `/quote`
    (calls `closeQuote` on click), and a "Clear" action (`clearQuote`).
  - Empty state: friendly "No items yet" message (drawer can be opened with an
    empty cart in future entry points).
- Accessibility: `role="dialog"`, `aria-modal="true"`, labelled header;
  `aria-hidden`/`inert` when closed.

### A3. `components/ClientFloats.tsx` (modify)

- Mount `<QuoteDrawer />` (dynamic import, `ssr: false`, consistent with the
  other floats). `ClientFloats` already returns `null` on `/admin`.

### Non-goal (this round)

- Navbar cart icon keeps linking to `/quote` (unchanged). The drawer's entry
  point this round is the toast action.

---

## Feature B — Mobile overlap fix

### `components/ComparisonFloatingBar.tsx` (modify)

- Outer container: `fixed bottom-6` → `fixed bottom-20 md:bottom-6`.
- Rationale: `bottom-20` (80px) clears the `md:hidden` sticky bar on mobile
  (matching `BackToTop`); at `md`+ the sticky bar is gone, so revert to
  `bottom-6`. `md:` (not `sm:`) matches the sticky bar's `md:hidden` boundary —
  a `sm:` revert would re-introduce the overlap in the 640–767px range.

---

## Feature C — Finder use-case presets

### C1. `components/finderConfig.ts` (modify)

- Add `USE_CASE_PRESETS: UseCasePreset[]` where
  `UseCasePreset = { id: string; label: string; sub: string; industry: IndustryId; category: string; sizeRangeId: string }`.
- `category` MUST equal a `DISPLAY_TYPES` id; `sizeRangeId` is `""` (skip size)
  or a value within `availableSizeRangeIds(category)`.
- Initial presets (final size ranges chosen during implementation against
  `SIZE_RANGES` / `availableSizeRangeIds`):
  - `boardroom` — "10-Person Boardroom" → `corporate` + `Interactive Display`
  - `hotel-lobby` — "Hotel Lobby Video Wall" → `hospitality` + `Video Wall`
  - `classroom` — "Smart Classroom" → `education` + `Interactive Display`
  - `retail-signage` — "Retail Storefront Signage" → `retail` + `Digital Signage`

### C2. `components/ProductFinderSection.tsx` (modify)

- Render presets as 1-click chips on **Step 1** (near the industry grid).
- Clicking a preset sets `industry`, `displayType`, `sizeRangeId` and jumps to
  `results` via the existing `goToResults()` path (reusing the current scorer).
- Track `product_finder_preset` with `{ preset: id }`.

---

## Testing & verification

### Automated (TDD)

- **Preset integrity test** (extend `finderConfig` tests): for every preset,
  assert `industry` is a valid `IndustryId`, `category` matches a `DISPLAY_TYPES`
  id, and `sizeRangeId` is `""` or in `availableSizeRangeIds(category)`. Written
  first (red → green).
- `npm run test` — full suite, no regressions.

### Runtime (`verify` skill)

- **Mobile (375px):** comparison bar sits above `MobileStickyCTA` with no
  overlap; "Add to Quote" shows a toast; "View Quote" opens the drawer; drawer
  qty stepper + remove + "Proceed to Quote Request" work.
- **Desktop:** clicking a finder preset lands on results with scored products;
  quote drawer slide-over opens/closes cleanly.

## Risks / notes

- On mobile, sonner toasts render bottom-right near the sticky bar — pre-existing
  behavior for all toasts on the site; leave as-is unless the runtime check shows
  a genuine collision.
- The finder and `ProductCard` keep their inline "Added!" button state in
  addition to the new toast; the inline state is a subtle button-label flip, the
  toast carries the "View Quote" affordance — acceptable, not redundant enough to
  remove.
