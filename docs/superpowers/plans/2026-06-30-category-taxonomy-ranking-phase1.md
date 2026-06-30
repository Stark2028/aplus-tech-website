# Phase 1 — Category Taxonomy + Latest-First Ranking + Spec Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "LED Signage" category, make 2026-catalog products rank first within every category listing, correct 7 spec mismatches, and show a clean "coming soon" state for the (initially empty) LED category — without breaking existing URLs.

**Architecture:** A single optional `catalog2026` boolean on `Product` is the source of truth for "latest." A shared `byLatestThenPopularity` comparator (new `lib/productSort.ts`) replaces six duplicated inline `.sort()` calls so every listing orders identically. The category set gains a fifth entry; three listing surfaces that don't yet handle a zero-product category get a "coming soon" guard.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, lucide-react. **No test framework is installed** — verification is `npx tsc --noEmit` for types, a standalone `node` assertion script for the one pure function, and `npm run build` + manual checks for UI.

## Global Constraints

- **Do not change the four existing category slugs** (`digital-signage`, `video-walls`, `interactive`, `commercial-tv`) — URLs/SEO depend on them.
- **Do not touch badge logic** (`lib/productBadges.ts`, `ProductCard.tsx` badge call) — out of scope.
- **Do not add new products** — Phase 2.
- **`catalog2026` is the only new `Product` field.** No `sortOrder`, no popularity edits.
- **The 13 `catalog2026: true` products are exactly:** `samsung-signage-qbc`, `samsung-signage-qhc`, `samsung-signage-qmc`, `samsung-qpdx105`, `samsung-qh115fx`, `samsung-touch-qbc-t`, `samsung-qbc-t`, `samsung-interactive-wafx-p`, `samsung-waf-series`, `samsung-business-tv-befx-h2`, `samsung-vhc-e`, `samsung-videowall-vmc-r`, `samsung-vmb-u-46`, `samsung-vmb-u-55`. (That is 14 ids = 13 series; VMB-U has two size SKUs.)
- **Six sort call sites** must all use the shared comparator: `components/ProductCatalogSection.tsx:25`, `components/ProductsClientShell.tsx:37`, `app/categories/[slug]/page.tsx:65`, `app/solutions/[industry]/page.tsx:80`, `app/solutions/[industry]/[category]/page.tsx:96` and `:102`.
- **Verification commands** run from `c:\Users\samee\b2b-website`. Use `npx tsc --noEmit` (type-check only) and `npm run build` (full build).

---

## Task 1: Add `catalog2026` flag to the Product type and mark the 13 latest products

**Files:**
- Modify: `data/products.ts` (interface near line 1-26; add `catalog2026: true` to 14 product objects)

**Interfaces:**
- Produces: `Product.catalog2026?: boolean` — consumed by Task 2's comparator and read in Tasks 4/5.

- [ ] **Step 1: Add the field to the `Product` interface.**

In `data/products.ts`, inside `export interface Product { ... }`, add after the `popularity?: number;` line:

```ts
  /** True for products in the current (2026) Samsung catalog.
   *  Sole source of truth for the "latest first" sort. */
  catalog2026?: boolean;
```

- [ ] **Step 2: Mark each of the 14 latest product objects.**

For each id below, add `catalog2026: true,` immediately after its `popularity:` line. Use Grep to locate each `id:` then its `popularity:` line. The 14 ids:

```
samsung-signage-qbc
samsung-signage-qhc
samsung-signage-qmc
samsung-qpdx105
samsung-qh115fx
samsung-touch-qbc-t
samsung-qbc-t
samsung-interactive-wafx-p
samsung-waf-series
samsung-business-tv-befx-h2
samsung-vhc-e
samsung-videowall-vmc-r
samsung-vmb-u-46
samsung-vmb-u-55
```

Example (QBC, currently `popularity: 81,`):

```ts
    id: "samsung-signage-qbc",
    popularity: 81,
    catalog2026: true,
    name: "Samsung Crystal UHD Signage QBC Series",
```

- [ ] **Step 3: Verify exactly 14 flags were added and they are the right ones.**

Run:
```bash
grep -c 'catalog2026: true' data/products.ts
```
Expected: `14`

Run (confirm each flagged id matches the approved list — prints the id line preceding each flag):
```bash
grep -B6 'catalog2026: true' data/products.ts | grep 'id:'
```
Expected: the 14 ids above, no others.

- [ ] **Step 4: Type-check.**

Run: `npx tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 5: Commit.**

```bash
git add data/products.ts
git commit -m "feat: add catalog2026 flag to mark 2026 catalog products"
```

---

## Task 2: Create the shared `byLatestThenPopularity` comparator

**Files:**
- Create: `lib/productSort.ts`
- Create: `scripts/productSort.check.mjs` (standalone assertion script — no framework)

**Interfaces:**
- Produces: `byLatestThenPopularity(a: Product, b: Product): number` — a comparator usable directly in `[...].sort(byLatestThenPopularity)`. Consumed by Task 3 at all six sort sites.

- [ ] **Step 1: Write the failing check script.**

Create `scripts/productSort.check.mjs`. It re-implements the spec's expected ordering inline and asserts the real comparator matches. Because the project has no test runner, this is a plain Node script using `assert`.

```js
// Standalone check for byLatestThenPopularity (no test framework in this repo).
// Run: node scripts/productSort.check.mjs
import assert from "node:assert/strict";
import { byLatestThenPopularity } from "../lib/productSort.ts";

const p = (id, popularity, catalog2026) => ({ id, popularity, catalog2026 });

// A latest product outranks a higher-popularity non-latest product.
{
  const latestLowPop = p("latest", 10, true);
  const oldHighPop = p("old", 99, false);
  const sorted = [oldHighPop, latestLowPop].sort(byLatestThenPopularity);
  assert.equal(sorted[0].id, "latest", "latest must sort before higher-pop non-latest");
}

// Within the latest group, higher popularity wins.
{
  const a = p("a", 80, true);
  const b = p("b", 90, true);
  const sorted = [a, b].sort(byLatestThenPopularity);
  assert.equal(sorted[0].id, "b", "within latest, higher popularity first");
}

// Within the non-latest group, higher popularity wins.
{
  const a = p("a", 80, false);
  const b = p("b", 90, false);
  const sorted = [a, b].sort(byLatestThenPopularity);
  assert.equal(sorted[0].id, "b", "within non-latest, higher popularity first");
}

// Missing popularity / missing flag are treated as 0 / false (no throw).
{
  const a = p("a", undefined, undefined);
  const b = p("b", 5, false);
  const sorted = [a, b].sort(byLatestThenPopularity);
  assert.equal(sorted[0].id, "b", "undefined popularity treated as 0");
}

console.log("OK: byLatestThenPopularity checks passed");
```

- [ ] **Step 2: Run the check to verify it fails (module doesn't exist yet).**

Run: `node scripts/productSort.check.mjs`
Expected: FAIL — `Cannot find module '../lib/productSort.ts'` (or a TS-loader error). Either way, it does not print "OK".

> Note: Node may not import `.ts` directly. If the import errors on the `.ts` extension rather than "module not found", that still satisfies "fails before implementation." Task 2 Step 4 resolves loading via `--experimental-strip-types` (Node 22+) or `npx tsx`.

- [ ] **Step 3: Write the comparator.**

Create `lib/productSort.ts`:

```ts
import type { Product } from "@/data/products";

/**
 * Orders products "latest first": 2026-catalog products (catalog2026) come
 * before older ones, and within each group higher popularity comes first.
 *
 * Used by every product listing so ordering is identical everywhere. Sorting
 * is applied AFTER category filtering, so this produces a within-category
 * "latest first" order, not a global feed.
 */
export function byLatestThenPopularity(a: Product, b: Product): number {
  const latest = (a.catalog2026 ? 1 : 0) - (b.catalog2026 ? 1 : 0);
  if (latest !== 0) return -latest; // latest (1) should come first → negative
  return (b.popularity || 0) - (a.popularity || 0);
}
```

- [ ] **Step 4: Run the check to verify it passes.**

The `@/` alias and `.ts` import won't resolve under plain `node`. Use `npx tsx` (already transitively available via Next's toolchain; if not, install dev-only is out of scope — fall back to the inline JS copy below).

Run: `npx tsx scripts/productSort.check.mjs`
Expected: prints `OK: byLatestThenPopularity checks passed`

If `npx tsx` is unavailable, change the script's import to an inline copy of the function body (same logic) so the check is self-contained, and re-run with `node scripts/productSort.check.mjs`. Expected: `OK: ...`.

- [ ] **Step 5: Type-check.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit.**

```bash
git add lib/productSort.ts scripts/productSort.check.mjs
git commit -m "feat: add shared byLatestThenPopularity comparator"
```

---

## Task 3: Apply the shared comparator at all six sort sites

**Files:**
- Modify: `components/ProductCatalogSection.tsx:25`
- Modify: `components/ProductsClientShell.tsx:37`
- Modify: `app/categories/[slug]/page.tsx:65`
- Modify: `app/solutions/[industry]/page.tsx:80`
- Modify: `app/solutions/[industry]/[category]/page.tsx:96` and `:102`

**Interfaces:**
- Consumes: `byLatestThenPopularity` from `lib/productSort.ts` (Task 2).

- [ ] **Step 1: Replace each inline sort.**

In every file above, add the import (path style matching that file's other imports — all use `@/`):

```ts
import { byLatestThenPopularity } from "@/lib/productSort";
```

Then replace each occurrence of:

```ts
.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
```

with:

```ts
.sort(byLatestThenPopularity)
```

There are six occurrences (two in the `[category]` page). Use Grep to confirm none remain:

```bash
grep -rn 'b.popularity || 0) - (a.popularity' app components
```
Expected: no matches.

- [ ] **Step 2: Confirm the import is present in all five files.**

Run:
```bash
grep -rln 'byLatestThenPopularity' app components
```
Expected: five files listed (`ProductCatalogSection.tsx`, `ProductsClientShell.tsx`, `categories/[slug]/page.tsx`, `solutions/[industry]/page.tsx`, `solutions/[industry]/[category]/page.tsx`).

- [ ] **Step 3: Type-check.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit.**

```bash
git add app components
git commit -m "refactor: sort all product listings latest-first via shared comparator"
```

---

## Task 4: Add the LED Signage category

**Files:**
- Modify: `data/categories.ts` (union type + `productCategories` array)

**Interfaces:**
- Produces: a fifth `ProductCategory` with `id: "led-signage"`, `name: "LED Signage"`. Consumed by nav, finder, CategoryGrid, sitemap, category page — all of which iterate `productCategories`.

- [ ] **Step 1: Extend the `CategorySlug` union.**

In `data/categories.ts`, change:

```ts
export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv";
```

to add the new slug:

```ts
export type CategorySlug =
  | "digital-signage"
  | "video-walls"
  | "interactive"
  | "commercial-tv"
  | "led-signage";
```

- [ ] **Step 2: Append the fifth category entry.**

Add as the last element of the `productCategories` array (after the `commercial-tv` entry, before the closing `];`):

```ts
  {
    id: "led-signage",
    name: "LED Signage",
    navLabel: "LED Signage",
    tagline: "Seamless direct-view LED at any scale",
    subtitle: "Fine-pitch direct-view LED for large-format walls, lobbies, and flagship spaces.",
    useCases: ["Corporate Lobbies", "Control Rooms", "Retail Flagships", "Auditoriums", "Experience Centres"],
    description: "Direct-view LED display solutions — from The Wall's micro-LED to all-in-one packages — delivering bezel-free, large-format visuals that scale to any space.",
  },
```

- [ ] **Step 3: Type-check (the union widening must not break any consumer).**

Run: `npx tsc --noEmit`
Expected: no errors. (If a `switch` somewhere became non-exhaustive it would error here — none is expected, per the spec's grep.)

- [ ] **Step 4: Commit.**

```bash
git add data/categories.ts
git commit -m "feat: add LED Signage category"
```

---

## Task 5: Register LED Signage in the two hard-coded category lists

**Files:**
- Modify: `components/sections/CategoryGrid.tsx` (`CATEGORY_CARDS` array, ~lines 13-54)
- Modify: `components/finderConfig.ts` (`DISPLAY_TYPES` array, lines 9-14)

**Interfaces:**
- Consumes: the `led-signage` category name `"LED Signage"` from Task 4.

- [ ] **Step 1: Add the LED card to `CategoryGrid.tsx`.**

At the top of `components/sections/CategoryGrid.tsx`, add `Cpu` to the lucide import:

```ts
import {
  ArrowRight,
  Monitor,
  LayoutGrid,
  MousePointerClick,
  Tv,
  Cpu,
} from "lucide-react";
```

Append to the `CATEGORY_CARDS` array (after the `commercial-tv` card):

```ts
  {
    id: "led-signage",
    Icon: Cpu,
    title: "LED Signage",
    tagline: "Seamless direct-view LED",
    href: "/products?category=led-signage",
    iconColor: "#0891b2",
    iconColorLight: "rgba(8, 145, 178, 0.1)",
    count: products.filter((p) => p.category === "LED Signage").length,
  },
```

(`count` evaluates to `0` until Phase 2 — intended.)

- [ ] **Step 2: Add the LED display type to `finderConfig.ts`.**

Append to the `DISPLAY_TYPES` array:

```ts
  { id: "LED Signage", label: "LED Signage", sub: "Direct-view LED walls" },
```

- [ ] **Step 3: Type-check + lint.**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit.**

```bash
git add components/sections/CategoryGrid.tsx components/finderConfig.ts
git commit -m "feat: register LED Signage in category grid and product finder"
```

---

## Task 6: Show "coming soon" for the empty LED category on `/products`

**Files:**
- Modify: `components/ProductsClientShell.tsx` (the `grouped` memo ~lines 30-41 and the render block)

**Interfaces:**
- Consumes: `productCategories` (now includes LED), `applyFilters`, `countActive` (already imported).

**Background:** Line 40 currently drops zero-product categories with `.filter((g) => g.items.length > 0)`. We must keep categories that are empty *before filtering* (genuinely empty catalog, e.g. LED) so they render a placeholder, while still hiding categories that became empty *only because of active filters*.

- [ ] **Step 1: Compute per-category total (pre-filter) counts and keep genuinely-empty categories.**

Replace the `grouped` memo (currently):

```ts
  const grouped = useMemo(() => {
    return productCategories
      .map((cat) => ({
        category: cat,
        items: declusterByImage(
          filtered
            .filter((p) => p.category === cat.name)
            .sort(byLatestThenPopularity)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [productCategories, filtered]);
```

with:

```ts
  const grouped = useMemo(() => {
    return productCategories
      .map((cat) => {
        const totalInCategory = products.filter((p) => p.category === cat.name).length;
        return {
          category: cat,
          // A category with zero products in the whole catalog (e.g. LED Signage
          // before Phase 2) is "comingSoon" and renders a placeholder. A category
          // that HAS products but is filtered to zero is dropped (the page-level
          // "no matches" message covers that case).
          comingSoon: totalInCategory === 0,
          items: declusterByImage(
            filtered
              .filter((p) => p.category === cat.name)
              .sort(byLatestThenPopularity)
          ),
        };
      })
      .filter((g) => g.comingSoon || g.items.length > 0);
  }, [productCategories, filtered]);
```

> `products` here is the component **prop** (`ProductsClientShell({ products, productCategories })`, line 21), which the parent `app/products/page.tsx:50` passes as the full unfiltered `products` list. So `products.filter(...)` gives the true pre-filter category total — no extra import needed. (`filtered` is the post-filter set derived from it via `applyFilters`.)

- [ ] **Step 2: Render a placeholder for `comingSoon` categories.**

Find where `grouped` is mapped to category sections in the JSX (each `g` renders a section with `g.category` and `g.items`). For a `comingSoon` group, render the same "Products coming soon" treatment used on the category page instead of an empty grid. Inside the per-group render, branch:

```tsx
{g.comingSoon ? (
  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
    <p className="text-lg font-medium text-gray-500">
      Products coming soon — contact us for availability.
    </p>
    <a
      href="/contact"
      className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
    >
      Contact Sales
    </a>
  </div>
) : (
  /* existing grid of g.items */
)}
```

Preserve the existing section header (category name + anchor id) so the `ProductsCategoryNav` LED tab still scrolls to it.

- [ ] **Step 3: Type-check.**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Build and manually verify.**

Run: `npm run build`
Expected: build succeeds.

Then `npm run dev`, open `http://localhost:3000/products`:
- The LED Signage section appears with the "Products coming soon" placeholder.
- The sticky LED Signage tab scrolls to that section.
- Applying a filter that excludes all of another category does NOT show "coming soon" for it (it just drops out / page shows no-match message).

- [ ] **Step 5: Commit.**

```bash
git add components/ProductsClientShell.tsx
git commit -m "feat: show coming-soon placeholder for empty LED category on /products"
```

---

## Task 7: Show "coming soon" for the empty LED tab on the homepage catalog section

**Files:**
- Modify: `components/ProductCatalogSection.tsx` (the product grid block ~lines 93-203)

**Background:** Line 95 maps `filtered` with no empty guard. When the active tab is LED (zero products), the `MobileProductScroller` renders empty/broken.

- [ ] **Step 1: Guard the grid with an empty-state branch.**

Wrap the `MobileProductScroller` block so that when `filtered.length === 0` a placeholder renders instead. Immediately before the `<MobileProductScroller ...>` opening tag, add the conditional and move the scroller into the `else`:

```tsx
{filtered.length === 0 ? (
  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
    <p className="text-lg font-medium text-gray-500">
      Products coming soon — contact us for availability.
    </p>
    <Link
      href="/contact"
      className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
    >
      Contact Sales
    </Link>
  </div>
) : (
  <MobileProductScroller gridCols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" autoPlay={true} autoPlayInterval={3900} initialDelay={3300}>
    {filtered.map((product, index) => (
      /* ...existing card JSX unchanged... */
    ))}
  </MobileProductScroller>
)}
```

(`Link` is already imported in this file.)

- [ ] **Step 2: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 3: Manually verify.**

`npm run dev`, open `http://localhost:3000` (homepage), scroll to "Browse Our Full Range", click the **LED Signage** tab:
- Shows the "Products coming soon" placeholder, not a blank carousel.
- Other tabs still show their product grids normally.

- [ ] **Step 4: Commit.**

```bash
git add components/ProductCatalogSection.tsx
git commit -m "feat: show coming-soon placeholder for empty LED tab on homepage"
```

---

## Task 8: Correct the 7 spec mismatches on catalog2026 products

**Files:**
- Modify: `data/products.ts` (specs of 5 products)

**Background:** Audit against the 2026 catalog spec tables found these mismatches. Apply each. Where a value also appears in a product's `specGroups`/`additionalSpecs`, update it there too for consistency (read the product block first to find all copies of the value).

| id | field | change |
|----|-------|--------|
| samsung-touch-qbc-t (QMB-T) | `specs.operationTime` | `16/7` → `24/7` |
| samsung-touch-qbc-t (QMB-T) | `specs.brightness` | `300 nit` → `500 nit (w/o touch glass)` |
| samsung-qbc-t (QBC-T) | `specs.resolution` | `3,840 × 2,160 (4K UHD)` → `1,920 × 1,080 (FHD)` |
| samsung-qbc-t (QBC-T) | `specs.brightness` | `300 nit` → `250 nit (w/o touch glass)` |
| samsung-vhc-e (VHC-E) | `specs.brightness` | `500 nit` → `700 nit` |
| samsung-interactive-wafx-p (WAFX-P) | `specs.operationTime` | `16/7` → `12/7` |
| samsung-waf-series (WAF) | `specs.operationTime` | `16/7` → `12/7` |

- [ ] **Step 1: For each product, read its full block and update every copy of the changed value.**

For each of the 5 ids, Grep the `id:` line to find the block, Read ~70 lines from there, and apply the change in `specs` **and** in any `specGroups`/`additionalSpecs` entry that repeats the same field (e.g. a "Display" group's "Brightness" or "Operation" row, a screenSizes mismatch). Do not change fields not listed above.

> QBC-T resolution caveat: if the product's `specGroups`/sizes describe 4K-only sizing, only correct the `resolution`/`brightness` strings named in the table — do NOT invent new sizes. If correcting resolution makes an existing spec internally contradictory (e.g. a "4K UHD" panel-type label), update that label string to match FHD; flag anything ambiguous in the commit body rather than guessing.

- [ ] **Step 2: Verify the old values are gone for these products.**

Run:
```bash
grep -n '300 nit' data/products.ts
```
Expected: the two touch-signage `300 nit` values for `samsung-touch-qbc-t` and `samsung-qbc-t` are no longer present (other products legitimately at 300 nit, if any, are unaffected — confirm by checking which id each remaining hit belongs to).

- [ ] **Step 3: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 4: Commit.**

```bash
git add data/products.ts
git commit -m "fix: correct 7 spec values to match 2026 catalog (QMB-T, QBC-T, VHC-E, WAFX-P, WAF)"
```

---

## Task 9: Full-build verification + sitemap/JSON-LD sanity

**Files:** none modified — verification only.

- [ ] **Step 1: Clean production build.**

Run: `npm run build`
Expected: succeeds; build output lists a static route for `/categories/led-signage` (proves `generateStaticParams` picked up the new slug).

- [ ] **Step 2: Confirm LED appears in nav, finder, grid, sitemap.**

`npm run dev`, then verify:
- Navbar "Products" dropdown (desktop + mobile) lists "LED Signage" → links to `/categories/led-signage`, which shows the existing coming-soon placeholder.
- `/product-finder` (or the finder section) lists "LED Signage" as a display type.
- Homepage "Shop by Category" grid shows the LED card (count 0).
- `http://localhost:3000/sitemap.xml` contains `/categories/led-signage`.

- [ ] **Step 3: Confirm latest-first ordering in a category with mixed products.**

On `/products`, in the **Interactive Displays** section, confirm WAFX-P and WAF (latest) appear before Flip Pro / Flip 3 / WAC (older, higher popularity). This proves the two-key sort beats raw popularity.

On the **Digital Signage** section, confirm QBC/QHC/QMC/QPDX/QH115FX/QMB-T/QBC-T (latest) lead, with QET/QBR-B/MP016F/QMR-T after.

- [ ] **Step 4: Run the comparator check once more.**

Run: `npx tsx scripts/productSort.check.mjs` (or `node` per Task 2 fallback)
Expected: `OK: byLatestThenPopularity checks passed`

- [ ] **Step 5: Final commit if any verification-driven tweaks were made; otherwise none.**

(No code change expected in this task. If a manual check surfaced a bug, fix it under the relevant task's pattern and commit with a `fix:` message.)

---

## Notes on scope boundaries

- **Older products are not spec-audited** — they have no 2026-catalog entry to verify against. This is expected and stated in the spec; do not fabricate corrections for them.
- **`categoryCollectionLd` emits `numberOfItems: 0`** for empty LED — harmless; not changed in Phase 1.
- **Badges untouched** — the random `getProductBadge` stays as-is per user direction.
- **Phase 2** (new products, web-sourced images, LED population, subCategory chips) is a separate spec/plan.
