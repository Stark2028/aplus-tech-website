# Product Finder: disable unavailable options — design

**Date:** 2026-07-10
**Status:** Approved

## Problem

In the Product Finder wizard (`components/ProductFinderSection.tsx`), every option in
steps 2 and 3 is always clickable, even when picking it can only lead to a
"no exact matches" fallback screen:

- **Step 2 (Display Type):** after choosing an industry in step 1, categories with no
  industry fit are still clickable (e.g. Commercial TV for Education).
- **Step 3 (Screen Size):** size buckets with no products in the chosen category are
  still clickable (e.g. Extra Large for Video Wall, which only ships 46"/55").

Options that cannot produce a primary match should be visibly disabled.

## Decision: what "unavailable" means

- **Step 2:** a category is disabled for an industry when its
  `INDUSTRY_CATEGORY_SCORE` is 0/absent **or** the category has zero products.
  Skipping industry ("any") disables nothing. LED Signage — currently unscored,
  which would disable it everywhere — gets scores added: Retail 2, Hospitality 1,
  Corporate 1, Education 0.
- **Step 3:** a size bucket is disabled when no product in the chosen category has a
  screen size inside the bucket (half-open `[min, max)` via existing `sizeInRange`).
  Size gating is **category-only**: the results query never filters by industry, so
  industry must not gate sizes. "Skip — show all sizes" is always available.
- Non-numeric sizes (`"Custom"` on `samsung-mp016f`) parse to `NaN` and never match a
  bucket — same behavior the results filter already has.

## Design

### Logic — `components/finderConfig.ts` (pure, unit-testable)

1. Move `INDUSTRY_CATEGORY_SCORE` here from `ProductFinderSection.tsx` (unchanged
   shape: `Record<industry, Record<categoryName, number>>`), adding the LED Signage
   scores above. Export it; the component re-imports it for result ranking.
2. `categoryEnabledForIndustry(category: string, industry: string): boolean`
   — `true` if `industry` is `"any"`/empty; otherwise `score > 0` **and** at least one
   product exists in the category.
3. `availableSizeRangeIds(category: string): Set<string>`
   — ids of `SIZE_RANGES` buckets containing at least one screen size of at least one
   product in the category.

Both helpers read the real `products` array from `@/data/products` (module-level
import, same as the component does).

### UI — `components/ProductFinderSection.tsx`

- **Step 2:** disabled buttons get `disabled` + `aria-disabled`, greyed styling
  (`opacity-50 cursor-not-allowed`, hover styles removed), and sub-text replaced with
  "Not typical for {Industry}".
- **Step 3:** compute `availableSizeRangeIds(displayType)` once (memo not required —
  trivial cost); same disabled treatment, sub-text replaced with
  "Not available in {displayType}".
- Existing fallback branches in the results view stay as a safety net even though the
  wizard can no longer reach most of them.

### Expected effect with current catalog

- Step 2: Education and Retail grey out Commercial TV; everything else enabled.
- Step 3: Video Wall → only Compact + Standard; LED Signage → only Extra Large;
  Interactive Display and Commercial TV → Extra Large greyed; Digital Signage → all
  enabled.

## Testing

`components/finderConfig.test.ts` (vitest, node env, co-located like
`lib/productFilters.test.ts`):

- `categoryEnabledForIndustry`: education/retail disable Commercial TV; LED Signage
  enabled for retail/hospitality/corporate, disabled for education; `"any"` and `""`
  disable nothing; unknown category (zero products) disabled for scored industries.
- `availableSizeRangeIds`: LED Signage → `{xlarge}` only; Video Wall →
  `{small, medium}`; Digital Signage → all four; Interactive Display and
  Commercial TV exclude `xlarge`.

Manual verification: run the app, walk the wizard for each industry, confirm disabled
states and that disabled buttons neither navigate nor show hover affordance.
