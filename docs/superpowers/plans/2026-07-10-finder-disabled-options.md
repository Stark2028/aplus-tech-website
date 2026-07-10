# Product Finder Disabled Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grey out (disable) Product Finder options that can't produce a primary match: step-2 display categories with no fit for the chosen industry, and step-3 size buckets with no products in the chosen category.

**Architecture:** All gating logic lives as pure exported helpers in `components/finderConfig.ts` (already the home of the finder's testable config), reading the real catalog from `@/data/products`. `components/ProductFinderSection.tsx` consumes the helpers and only handles rendering the disabled state. `INDUSTRY_CATEGORY_SCORE` moves from the component into `finderConfig.ts` so both the gating helper and the component's result ranking share one source of truth.

**Tech Stack:** Next.js 16 / React 19 client component, TypeScript, Tailwind classes, vitest (node env, co-located `*.test.ts`).

**Spec:** `docs/superpowers/specs/2026-07-10-finder-disabled-options-design.md`

## Global Constraints

- Step-2 rule: category disabled when industry score is 0/absent OR category has zero products; industry `"any"`/`""` only requires products to exist.
- Step-3 rule: size bucket disabled when no product in the category has a parseable screen size inside the half-open `[min, max)` bucket (reuse `sizeInRange`). Category-only — industry never gates sizes.
- New LED Signage scores (verbatim from spec): Retail 2, Hospitality 1, Corporate 1, Education 0.
- Non-numeric sizes (`"Custom"` on `samsung-mp016f`) are skipped via `isNaN(parseInt(...))`.
- Disabled buttons: `disabled` + `aria-disabled`, greyed styling, no hover affordance; sub-text swaps to "Not typical for {Industry}" (step 2) / "Not available in {displayType}" (step 3).
- Do not remove the results-view fallback branches.
- Test command: `npx vitest run components/finderConfig.test.ts`

---

### Task 1: Gating helpers in finderConfig.ts

**Files:**
- Modify: `components/finderConfig.ts`
- Test: `components/finderConfig.test.ts` (create)

**Interfaces:**
- Consumes: `products` from `@/data/products` (`{ category: string; specs: { screenSizes: string[] } }`), existing `SIZE_RANGES` and `sizeInRange` in the same file.
- Produces (Task 2 relies on these exact names):
  - `export const INDUSTRY_CATEGORY_SCORE: Record<"hospitality" | "corporate" | "education" | "retail", Record<string, number>>`
  - `export function categoryEnabledForIndustry(category: string, industry: string): boolean`
  - `export function availableSizeRangeIds(category: string): Set<string>`

- [ ] **Step 1: Write the failing test**

Create `components/finderConfig.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  availableSizeRangeIds,
  categoryEnabledForIndustry,
  INDUSTRY_CATEGORY_SCORE,
  SIZE_RANGES,
} from "./finderConfig";

// These tests run against the real catalog in data/products — they pin the
// wizard's gating to the shipped product data, mirroring productFilters.test.ts.

describe("categoryEnabledForIndustry", () => {
  it("disables Commercial TV for education and retail (score 0)", () => {
    expect(categoryEnabledForIndustry("Commercial TV", "education")).toBe(false);
    expect(categoryEnabledForIndustry("Commercial TV", "retail")).toBe(false);
  });

  it("enables Commercial TV for hospitality and corporate", () => {
    expect(categoryEnabledForIndustry("Commercial TV", "hospitality")).toBe(true);
    expect(categoryEnabledForIndustry("Commercial TV", "corporate")).toBe(true);
  });

  it("enables LED Signage for retail/hospitality/corporate, disables for education", () => {
    expect(categoryEnabledForIndustry("LED Signage", "retail")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "hospitality")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "corporate")).toBe(true);
    expect(categoryEnabledForIndustry("LED Signage", "education")).toBe(false);
  });

  it('disables nothing real when industry is "any" or empty', () => {
    for (const category of ["Digital Signage", "Video Wall", "Interactive Display", "Commercial TV", "LED Signage"]) {
      expect(categoryEnabledForIndustry(category, "any")).toBe(true);
      expect(categoryEnabledForIndustry(category, "")).toBe(true);
    }
  });

  it("disables a category with zero products even if scored", () => {
    // No product carries this category, so even industry "any" disables it.
    expect(categoryEnabledForIndustry("Nonexistent Category", "any")).toBe(false);
    expect(categoryEnabledForIndustry("Nonexistent Category", "hospitality")).toBe(false);
  });

  it("has a score entry for every category in every industry (no accidental gaps)", () => {
    for (const industry of ["hospitality", "corporate", "education", "retail"] as const) {
      for (const category of ["Digital Signage", "Video Wall", "Interactive Display", "Commercial TV", "LED Signage"]) {
        expect(INDUSTRY_CATEGORY_SCORE[industry][category]).toBeTypeOf("number");
      }
    }
  });
});

describe("availableSizeRangeIds", () => {
  const allIds = SIZE_RANGES.map((r) => r.id);

  it("LED Signage (110–165\") is only Extra Large", () => {
    expect([...availableSizeRangeIds("LED Signage")].sort()).toEqual(["xlarge"]);
  });

  it("Video Wall (46\"/55\") is only Compact + Standard", () => {
    expect([...availableSizeRangeIds("Video Wall")].sort()).toEqual(["medium", "small"]);
  });

  it("Digital Signage covers all four buckets", () => {
    const ids = availableSizeRangeIds("Digital Signage");
    for (const id of allIds) expect(ids.has(id)).toBe(true);
  });

  it("Interactive Display and Commercial TV exclude Extra Large", () => {
    for (const category of ["Interactive Display", "Commercial TV"]) {
      const ids = availableSizeRangeIds(category);
      expect(ids.has("xlarge")).toBe(false);
      expect(ids.has("medium")).toBe(true);
    }
  });

  it("returns an empty set for an unknown category", () => {
    expect(availableSizeRangeIds("Nonexistent Category").size).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/finderConfig.test.ts`
Expected: FAIL — `finderConfig` has no exported member `categoryEnabledForIndustry` (and the others).

- [ ] **Step 3: Write minimal implementation**

In `components/finderConfig.ts`, add below the existing imports (add the `products` import at the top):

```ts
import { products } from "@/data/products";
```

Then append after `sizeInRange`:

```ts
/**
 * Per-industry preference scores by display category. Higher = stronger fit;
 * 0 = not a fit (disables the category in the wizard's step 2). Moved here
 * from ProductFinderSection so gating and result ranking share one table.
 */
export const INDUSTRY_CATEGORY_SCORE: Record<
  "hospitality" | "corporate" | "education" | "retail",
  Record<string, number>
> = {
  hospitality: { "Commercial TV": 3, "Digital Signage": 2, "Interactive Display": 1, "Video Wall": 1, "LED Signage": 1 },
  corporate:   { "Interactive Display": 3, "Digital Signage": 2, "Video Wall": 2, "Commercial TV": 1, "LED Signage": 1 },
  education:   { "Interactive Display": 3, "Digital Signage": 1, "Video Wall": 1, "Commercial TV": 0, "LED Signage": 0 },
  retail:      { "Digital Signage": 3, "Video Wall": 3, "Interactive Display": 1, "Commercial TV": 0, "LED Signage": 2 },
};

/**
 * Step-2 gate: can this display category be picked for the chosen industry?
 * "any"/empty industry only requires the category to have products at all;
 * otherwise the industry score must be positive too.
 */
export function categoryEnabledForIndustry(category: string, industry: string): boolean {
  const hasProducts = products.some((p) => p.category === category);
  if (!industry || industry === "any") return hasProducts;
  const scores = INDUSTRY_CATEGORY_SCORE[industry as keyof typeof INDUSTRY_CATEGORY_SCORE];
  return hasProducts && (scores?.[category] ?? 0) > 0;
}

/**
 * Step-3 gate: SIZE_RANGES ids that contain at least one screen size of at
 * least one product in the category. Non-numeric sizes ("Custom") are skipped,
 * matching how the results filter already treats them.
 */
export function availableSizeRangeIds(category: string): Set<string> {
  const ids = new Set<string>();
  for (const p of products) {
    if (p.category !== category) continue;
    for (const s of p.specs.screenSizes) {
      const n = parseInt(s);
      if (isNaN(n)) continue;
      for (const r of SIZE_RANGES) {
        if (sizeInRange(n, r)) ids.add(r.id);
      }
    }
  }
  return ids;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/finderConfig.test.ts`
Expected: PASS (all tests). Also run the full suite: `npm test` — the two existing `lib/*.test.ts` files must still pass.

- [ ] **Step 5: Commit**

```bash
git add components/finderConfig.ts components/finderConfig.test.ts
git commit -m "feat: add finder gating helpers (industry-category fit, size availability)"
```

---

### Task 2: Wire disabled states into the wizard UI

**Files:**
- Modify: `components/ProductFinderSection.tsx` (score-map import ~line 56-64; step 2 block ~line 328-348; step 3 block ~line 350-380)

**Interfaces:**
- Consumes from Task 1: `INDUSTRY_CATEGORY_SCORE`, `categoryEnabledForIndustry(category, industry)`, `availableSizeRangeIds(category)` from `@/components/finderConfig`.
- Produces: rendered disabled buttons only — no new exports.

- [ ] **Step 1: Replace the local score map with the shared one**

In `components/ProductFinderSection.tsx`, extend the existing `finderConfig` import:

```ts
import {
  DISPLAY_TYPES as DISPLAY_TYPE_DATA,
  SIZE_RANGES,
  INDUSTRY_CATEGORY_SCORE,
  availableSizeRangeIds,
  categoryEnabledForIndustry,
  finderCategoryHref,
  sizeInRange,
} from "@/components/finderConfig";
```

Delete the local `INDUSTRY_CATEGORY_SCORE` const (the block starting with the
"Per-industry preference scores" comment, lines ~56-64). The `scoreFor` /
fallback-2 usages keep working unchanged because the imported table has the
same shape (indexing with `Exclude<IndustryId, "any">` still typechecks since
the imported record uses the same four keys).

- [ ] **Step 2: Disable non-fitting categories in step 2**

Replace the step-2 `DISPLAY_TYPES.map` block with:

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {DISPLAY_TYPES.map(({ id, label, sub, Icon }) => {
    const enabled = categoryEnabledForIndustry(id, industry);
    return (
      <button
        key={id}
        onClick={() => { setDisplayType(id); setStep(3); }}
        disabled={!enabled}
        aria-disabled={!enabled}
        className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
          enabled
            ? "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
        }`}
      >
        <Icon
          size={28}
          className={`mb-3 transition-colors ${
            enabled ? "text-gray-400 group-hover:text-blue-500" : "text-gray-300"
          }`}
        />
        <div className={`font-bold text-sm ${enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</div>
        <div className="text-gray-400 text-xs mt-0.5">
          {enabled ? sub : `Not typical for ${industryLabel ?? "your industry"}`}
        </div>
      </button>
    );
  })}
</div>
```

Note: `industryLabel` is declared later in the component body (~line 171) than
the JSX uses it, but it's a `const` evaluated before render returns — no change
needed. Verify it is declared **before** the `return` statement (it is).

- [ ] **Step 3: Disable unavailable sizes in step 3**

Immediately inside the `{step === 3 && (` block's fragment, the map needs the
available set. Add one line above the step-3 `return`-level JSX — i.e. compute it
in the component body next to `sizeConfig` (~line 76):

```ts
const availableSizes = step === 3 ? availableSizeRangeIds(displayType) : null;
```

Then replace the step-3 `SIZE_RANGES.map` block with:

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {SIZE_RANGES.map(({ id, label, sub }) => {
    const enabled = availableSizes?.has(id) ?? true;
    return (
      <button
        key={id}
        onClick={() => { setSizeRangeId(id); goToResults(); }}
        disabled={!enabled}
        aria-disabled={!enabled}
        className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
          enabled
            ? "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
        }`}
      >
        <div
          className={`text-2xl font-black mb-2 transition-colors ${
            enabled ? "text-gray-200 group-hover:text-blue-100" : "text-gray-100"
          }`}
        >
          {id === "small" ? "S" : id === "medium" ? "M" : id === "large" ? "L" : "XL"}
        </div>
        <div className={`font-bold text-sm ${enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</div>
        <div className="text-gray-400 text-xs mt-0.5">
          {enabled ? sub : `Not available in ${displayType}`}
        </div>
      </button>
    );
  })}
</div>
```

Leave the "Skip — show all sizes" and "← Back" buttons untouched. Leave every
results-view fallback branch untouched.

- [ ] **Step 4: Typecheck, lint, tests**

Run: `npx tsc --noEmit` — Expected: no errors.
Run: `npm run lint` — Expected: no new warnings/errors in the touched files.
Run: `npm test` — Expected: PASS (finderConfig + existing suites).

- [ ] **Step 5: Manual verification in the running app**

Run: `npm run dev`, open the page containing the Product Finder (home page section).
Check:
1. Education → step 2: Commercial TV and LED Signage greyed, not clickable, sub-text "Not typical for Education".
2. Retail → step 2: Commercial TV greyed; LED Signage clickable.
3. Skip industry → step 2: nothing greyed.
4. Any industry → Video Wall → step 3: Large + Extra Large greyed with "Not available in Video Wall".
5. Retail → LED Signage → step 3: only Extra Large clickable.
6. Digital Signage → step 3: all four clickable.
7. Disabled buttons show no hover ring and do nothing on click; "Skip — show all sizes" still works.

- [ ] **Step 6: Commit**

```bash
git add components/ProductFinderSection.tsx
git commit -m "feat: grey out finder options with no matching products"
```
