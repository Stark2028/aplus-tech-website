# Logitech VC & Class Saathi SEO Surface — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-26-logitech-class-saathi-seo-design.md` — read it first. It records *why* each decision was made, including alternatives that were rejected and must not be reintroduced.

**Goal:** Give the Logitech Video Conferencing and Class Saathi categories the SEO content surface the Samsung categories already have — 11 new landing pages and 4 blog posts — without introducing thin templated content or brand-policy violations.

**Architecture:** Three new hand-written data files drive two new page components, both served by a single new nested route `app/categories/[slug]/[sub]/page.tsx` that dispatches on the category slug. Three Logitech industry combos reuse the existing `/solutions/[industry]/[category]` route, which first has to be made brand-aware because five sites in it hardcode "Samsung". Products are curated by explicit id everywhere, never by string matching.

**Tech Stack:** Next.js 15 App Router (RSC), TypeScript, Tailwind v4, vitest, `next/og` (Satori) for OG images, `react-markdown` + `remark-gfm` for blog bodies.

## Global Constraints

Every task's requirements implicitly include this section.

- **Logitech content policy.** The regex `/authoriz|partner|certif|samsung/i` must not match anywhere in Logitech data or Logitech-facing page copy. Aplus resells genuine Logitech product under nominative fair use and is **not** an authorized Logitech partner. The trust story is Aplus's own supply, installation, and AMC support. This bans the phrase "Certified for Microsoft Teams" even though it is a true Logitech claim — write "runs Microsoft Teams Rooms out of the box".
- **Class Saathi content policy.** Every claim must trace to the Class Saathi brochure or tag-hive.com. No partnership language. "Samsung" only ever as "Samsung C-Lab". No new numeric claims beyond those already in `data/education.ts`. The blocklist in `data/education.test.ts:29-31` stays blocked.
- **`dynamicParams = false`** on every new dynamic route, plus a full `generateStaticParams`. Without it an unknown param streams through `loading.tsx` and ISR, and `notFound()` returns a soft 200 instead of a real 404 (vercel/next.js#63478, #76501).
- **`revalidate = 3600`** on new routes, matching existing page modules.
- **Satori/OG constraints.** Every container in an `opengraph-image.tsx` needs an explicit `display: "flex"`. `inline-flex` is unsupported and throws, failing the whole image. `width: "fit-content"` is ignored — use `display: "flex"` + `alignSelf: "flex-start"`.
- **Never import `next/font` from a `"use client"` file.** Known Turbopack browserslist bug in this repo.
- **En dash, not hyphen.** The room-band strings in `data/videoConferencing.ts` use U+2013: `"Medium–Large Rooms"`, `"Small–Medium Rooms"`, `"Huddle–Small Rooms"`, `"Small–Large Rooms"`. A hyphen will silently fail the Task 5 test.
- **Canonical site origin** is `SITE` from `lib/jsonLd.ts` (`https://www.aplustechsol.com`). Never hardcode it.
- **Test command** is `npm test` (vitest run). Single file: `npx vitest run <path>`.
- **Every commit message** ends with the trailer `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. The commit steps below pass it as a second `-m`.
- **Do not** add an `offers` node to any Product JSON-LD, do not use `@type: "EducationalApplication"`, and do not rotate internal anchor text. All three were considered and rejected in the spec with reasoning.

## Pre-flight

- [ ] **Run the baseline test suite** so you can tell your failures from pre-existing ones.

Run: `npm test`
Record the pass/fail count. Every task below assumes this baseline.

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `data/vcRoomGuides.ts` | 5 hand-written Logitech room/platform guides; curated product ids |
| `data/vcRoomGuides.test.ts` | Policy + product-resolution + room-band + near-duplicate guards (spec T1) |
| `data/educationSegments.ts` | 3 hand-written Class Saathi segment pages |
| `data/educationSegments.test.ts` | Truth-policy + no-new-numeric-claims guards (spec T2) |
| `data/useCaseCombos.test.ts` | Combo integrity + Logitech policy scan (spec T3) |
| `lib/subPageCrumbs.ts` | Pure 4-level breadcrumb builder for nested category pages |
| `lib/subPageCrumbs.test.ts` | Breadcrumb shape assertions (spec T6) |
| `lib/comboProducts.ts` | Resolves a combo's product list (curated ids, else series match, else fallback) |
| `lib/comboProducts.test.ts` | Resolution-precedence assertions |
| `app/categories/[slug]/[sub]/page.tsx` | Thin route: params, metadata, static params, JSON-LD, dispatch |
| `app/categories/[slug]/[sub]/opengraph-image.tsx` | OG image for both sub-page kinds |
| `components/vc/VcRoomGuide.tsx` | Renders a Logitech room/platform guide |
| `components/education/EducationSegmentPage.tsx` | Renders a Class Saathi segment page |

**Modified:**

| Path | Change |
|---|---|
| `lib/categoryBrand.ts` | Add `hardwareNoun`; add the missing `education` branch |
| `lib/jsonLd.ts` | Brand-aware `industryCategoryServiceLd`; new `classSaathiProductLd` + `itemListLd` |
| `lib/categoryBrand.test.ts` | Cover `hardwareNoun` and the education branch |
| `lib/jsonLd.test.ts` | Pin Samsung output unchanged; assert brand-correct VC output |
| `data/useCaseCombos.ts` | Add optional `productIds`; add 3 Logitech combos |
| `app/solutions/[industry]/[category]/page.tsx` | Replace 3 hardcoded-Samsung strings; use `comboProducts` |
| `app/solutions/[industry]/[category]/opengraph-image.tsx` | Replace 2 hardcoded-Samsung strings |
| `app/categories/[slug]/page.tsx` | Logitech in the VC title; sub-page cross-link strip |
| `app/products/page.tsx` | Metadata + H1 + eyebrow that match what the page renders |
| `app/products/[slug]/page.tsx` | "Rooms this fits" link on Logitech products |
| `components/education/EducationLanding.tsx` | Product + ItemList JSON-LD; segment strip |
| `components/Footer.tsx` | Distinct Class Saathi entry |
| `components/sections/CategoryGrid.tsx` | Optional Education tile + `href` override |
| `data/faqs.ts` | One VC FAQ, one Class Saathi FAQ |
| `data/blogs.ts` | 4 new posts |
| `app/sitemap.ts` | Guides, segments; bump `CATALOG_LAST_UPDATED` |

---

# Phase 1 — Brand-aware chrome (prerequisite)

Nothing in Phase 2 may ship before this phase is green. This code path renders all 16 existing Samsung combo pages, so every task here pins Samsung output as unchanged.

## Task 1: `hardwareNoun` + the missing education branch

**Files:**
- Modify: `lib/categoryBrand.ts:18-68`
- Test: `lib/categoryBrand.test.ts`

**Interfaces:**
- Produces: `CategoryBrand.hardwareNoun: string` — the noun for this category's products in running copy ("display", "room system", "platform", "classroom solution"). Consumed by Tasks 2 and 3.

**Why the education branch matters:** `categoryBrand()` currently has branches for `video-conferencing` and `software`, then falls through to a Samsung default. Passing the education category returns `brand: "Samsung"` and `eyebrow: "Samsung Authorized Distributor"`. Nothing hits that today because `app/categories/[slug]/page.tsx:125` returns early, but the Task 7 route will call it. Fix it before wiring anything up.

- [ ] **Step 1: Write the failing tests**

Append to `lib/categoryBrand.test.ts`:

```ts
import { getCategoryById } from "@/data/categories";

const BANNED = /authoriz|partner|certif|samsung/i;

describe("categoryBrand hardwareNoun", () => {
  it("gives Samsung hardware categories the display noun", () => {
    expect(categoryBrand(getCategoryById("digital-signage")!).hardwareNoun).toBe("display");
    expect(categoryBrand(getCategoryById("video-walls")!).hardwareNoun).toBe("display");
  });

  it("gives video conferencing the room-system noun", () => {
    expect(categoryBrand(getCategoryById("video-conferencing")!).hardwareNoun).toBe("room system");
  });

  it("gives software the platform noun", () => {
    expect(categoryBrand(getCategoryById("software")!).hardwareNoun).toBe("platform");
  });
});

describe("categoryBrand non-Samsung branches", () => {
  it("never returns Samsung wording for video conferencing", () => {
    const blob = JSON.stringify(categoryBrand(getCategoryById("video-conferencing")!));
    expect(BANNED.test(blob)).toBe(false);
  });

  it("never returns Samsung wording for education", () => {
    const blob = JSON.stringify(categoryBrand(getCategoryById("education")!));
    expect(BANNED.test(blob)).toBe(false);
  });

  it("gives education a Class Saathi brand and no size range", () => {
    const b = categoryBrand(getCategoryById("education")!);
    expect(b.brand).toBe("Class Saathi");
    expect(b.showSizeRange).toBe(false);
    expect(b.hardwareNoun).toBe("classroom solution");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/categoryBrand.test.ts`
Expected: FAIL — `hardwareNoun` is `undefined`, and the education assertions fail because the default branch returns `brand: "Samsung"` / `eyebrow: "Samsung Authorized Distributor"`.

- [ ] **Step 3: Add the field and the branch**

In `lib/categoryBrand.ts`, add to the `CategoryBrand` interface:

```ts
  /**
   * Noun for this category's products in running copy — "display" for Samsung
   * panels, "room system" for Logitech VC, "platform" for cloud software. Lets
   * shared chrome say "Other display categories" vs "Other room-system
   * categories" without a per-category branch at the call site.
   */
  hardwareNoun: string;
```

Add `hardwareNoun: "room system"` to the `video-conferencing` branch, `hardwareNoun: "platform"` to the `software` branch, and `hardwareNoun: "display"` to the default branch.

Insert a new branch **before** the default:

```ts
  // Education is Class Saathi (TagHive), not Samsung. Without this branch the
  // category falls through to the Samsung default and returns an "Authorized
  // Samsung Distributor" eyebrow — a content-truth violation the moment any
  // education surface calls this helper.
  if (category.id === "education") {
    return {
      brand: "Class Saathi",
      h1: "Class Saathi Smart Classrooms",
      eyebrow: "Education · Class Saathi by TagHive",
      unitNoun: { one: "solution", many: "solutions" },
      hardwareNoun: "classroom solution",
      showSizeRange: false,
    };
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/categoryBrand.test.ts`
Expected: PASS, including the pre-existing cases.

- [ ] **Step 5: Run the full suite for regressions**

Run: `npm test`
Expected: same pass count as the Pre-flight baseline, plus the new tests.

- [ ] **Step 6: Commit**

```bash
git add lib/categoryBrand.ts lib/categoryBrand.test.ts
git commit -m "feat(brand): add hardwareNoun and the missing education branch to categoryBrand" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 2: Brand-aware `industryCategoryServiceLd`

**Files:**
- Modify: `lib/jsonLd.ts:213-246`
- Test: `lib/jsonLd.test.ts`

**Interfaces:**
- Consumes: `categoryBrand().brand` from Task 1.
- Produces: unchanged signature `industryCategoryServiceLd(combo, solution, category, productsOnPage)`; only the emitted `hasOfferCatalog.name` and `itemOffered.brand` change for non-Samsung categories.

- [ ] **Step 1: Write the failing tests**

Append to `lib/jsonLd.test.ts`:

```ts
import { industryCategoryServiceLd } from "./jsonLd";
import { getCategoryById } from "@/data/categories";
import { solutions } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";

const BANNED = /authoriz|partner|certif|samsung/i;

function fakeCombo(category: "digital-signage" | "video-conferencing"): UseCaseCombo {
  return {
    industry: "corporate",
    category,
    title: "T",
    subtitle: "S",
    intro: "I",
    useCases: [],
    faqs: [],
    ctaHeading: "C",
  };
}

describe("industryCategoryServiceLd brand awareness", () => {
  it("keeps Samsung wording for a Samsung category", () => {
    const ld = industryCategoryServiceLd(
      fakeCombo("digital-signage"),
      solutions.find((s) => s.slug === "corporate")!,
      getCategoryById("digital-signage")!,
      []
    );
    expect(ld.hasOfferCatalog.name).toBe(
      "Samsung Digital Signage recommended for Corporate & Workplace"
    );
  });

  it("emits zero Samsung wording for the video conferencing category", () => {
    const ld = industryCategoryServiceLd(
      fakeCombo("video-conferencing"),
      solutions.find((s) => s.slug === "corporate")!,
      getCategoryById("video-conferencing")!,
      []
    );
    expect(ld.hasOfferCatalog.name).toBe(
      "Logitech Video Conferencing recommended for Corporate & Workplace"
    );
    expect(BANNED.test(JSON.stringify(ld))).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: FAIL on the VC case — the current code emits `"Samsung Video Conferencing recommended for …"`.

- [ ] **Step 3: Make the OfferCatalog name brand-aware**

In `lib/jsonLd.ts`, import the helper at the top:

```ts
import { categoryBrand } from "@/lib/categoryBrand";
```

In `industryCategoryServiceLd`, replace the hardcoded catalog name:

```ts
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      // Brand comes from categoryBrand, not a literal: Video Conferencing is
      // Logitech and must never carry Samsung wording in structured data.
      name: `${categoryBrand(category).brand} ${category.navLabel} recommended for ${solution.title}`,
      itemListElement: productsOnPage.map((p) => ({
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/jsonLd.ts lib/jsonLd.test.ts
git commit -m "fix(seo): make industryCategoryServiceLd OfferCatalog brand-aware" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 3: Brand-aware combo page and OG image

**Files:**
- Modify: `app/solutions/[industry]/[category]/page.tsx:217, 282, 324`
- Modify: `app/solutions/[industry]/[category]/opengraph-image.tsx:4, 96`

**Interfaces:**
- Consumes: `categoryBrand().brand` and `.hardwareNoun` from Task 1.

There is no unit test for page copy; correctness is enforced by Task 6's data-level scan plus the runtime pass in Phase 5. Make the edits exactly as specified.

- [ ] **Step 1: Replace the three strings in `page.tsx`**

Add near the existing imports:

```ts
import { categoryBrand } from "@/lib/categoryBrand";
```

Inside the component, after `categoryObj` is known to be defined:

```ts
  const brand = categoryBrand(categoryObj);
```

Line ~217 — the recommended-products heading:

```tsx
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {brand.brand} {categoryObj.navLabel.toLowerCase()} for {solution.title.toLowerCase()}
                </h2>
```

Line ~282 — the related-combos heading. "display categories" is wrong for VC:

```tsx
              <h2 className="text-2xl font-bold text-gray-900">
                Other {brand.hardwareNoun} categories used in {solution.title.toLowerCase()}
              </h2>
```

Line ~324 — the final CTA body:

```tsx
                <p className="text-blue-100/90 text-lg max-w-xl leading-relaxed">
                  Share your requirements and our solution architects will recommend the right {brand.brand} {brand.hardwareNoun}s, sizing, and deployment plan.
                </p>
```

- [ ] **Step 2: Replace the two strings in `opengraph-image.tsx`**

The `alt` export is a module constant and cannot read params, so make it brand-neutral:

```ts
export const alt = "Industry + Category Solution | Aplus Technology Solutions";
```

Line ~96, inside the component where `category` is in scope, replace the literal `Samsung Displays` label with the brand-aware pair. Import `categoryBrand` and use:

```tsx
          {`${categoryBrand(category).brand} ${categoryBrand(category).navLabelPlural ?? category.navLabel}`}
```

If `navLabelPlural` does not exist on `CategoryBrand` (it does not — do **not** add it), use exactly:

```tsx
          {`${categoryBrand(category).brand} ${category.navLabel}`}
```

- [ ] **Step 3: Verify the 16 existing Samsung combo pages still build**

Run: `npm run build`
Expected: build succeeds. Spot-check the emitted HTML for one Samsung combo and confirm the headings still read "Samsung digital signage for corporate & workplace" and "Other display categories used in corporate & workplace".

- [ ] **Step 4: Commit**

```bash
git add "app/solutions/[industry]/[category]/page.tsx" "app/solutions/[industry]/[category]/opengraph-image.tsx"
git commit -m "fix(seo): brand-aware chrome on the industry+category combo route" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 4: Curated combo products via `productIds`

**Files:**
- Modify: `data/useCaseCombos.ts` (interface only)
- Create: `lib/comboProducts.ts`
- Create: `lib/comboProducts.test.ts`
- Modify: `app/solutions/[industry]/[category]/page.tsx:93-106`

**Interfaces:**
- Produces: `UseCaseCombo.productIds?: string[]`.
- Produces: `resolveComboProducts(combo, category, solution): { products: Product[]; usedFallback: boolean }` — consumed by the combo page.

**Why:** the page currently matches products via `solution.recommendedSeries.some(s => p.series.includes(s))`. No Logitech series appears in any `recommendedSeries`, so a VC combo would silently render the "From this category" fallback. Adding Logitech series to `recommendedSeries` is the wrong fix — `app/solutions/[industry]/page.tsx:80` reads the same array and would surface Logitech products under its "Samsung displays used in…" heading.

- [ ] **Step 1: Write the failing test**

Create `lib/comboProducts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveComboProducts } from "./comboProducts";
import { getCategoryById } from "@/data/categories";
import { solutions } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";

const corporate = solutions.find((s) => s.slug === "corporate")!;

function combo(over: Partial<UseCaseCombo>): UseCaseCombo {
  return {
    industry: "corporate",
    category: "video-conferencing",
    title: "T",
    subtitle: "S",
    intro: "I",
    useCases: [],
    faqs: [],
    ctaHeading: "C",
    ...over,
  } as UseCaseCombo;
}

describe("resolveComboProducts", () => {
  it("honours curated productIds in the given order", () => {
    const { products, usedFallback } = resolveComboProducts(
      combo({ productIds: ["logitech-rally-bar", "logitech-tap"] }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(products.map((p) => p.id)).toEqual(["logitech-rally-bar", "logitech-tap"]);
    expect(usedFallback).toBe(false);
  });

  it("ignores curated ids that are not in the combo's category", () => {
    const { products } = resolveComboProducts(
      combo({ productIds: ["logitech-rally-bar", "does-not-exist"] }),
      getCategoryById("video-conferencing")!,
      corporate
    );
    expect(products.map((p) => p.id)).toEqual(["logitech-rally-bar"]);
  });

  it("falls back to the series match when no ids are curated", () => {
    const { products, usedFallback } = resolveComboProducts(
      combo({ category: "digital-signage" }),
      getCategoryById("digital-signage")!,
      corporate
    );
    expect(products.length).toBeGreaterThan(0);
    expect(usedFallback).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/comboProducts.test.ts`
Expected: FAIL — `Cannot find module './comboProducts'`.

- [ ] **Step 3: Add the optional field**

In `data/useCaseCombos.ts`, inside the `UseCaseCombo` interface, after `category`:

```ts
  /**
   * Curated product ids, in display order. Takes precedence over the
   * solution's recommendedSeries match.
   *
   * Required for any non-Samsung category: recommendedSeries carries only
   * Samsung series, and adding Logitech series to it would leak Logitech
   * products onto the Samsung-worded /solutions/[industry] hub, which reads
   * the same array.
   */
  productIds?: string[];
```

- [ ] **Step 4: Write the resolver**

Create `lib/comboProducts.ts`:

```ts
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { Solution } from "@/data/solutions";
import type { UseCaseCombo } from "@/data/useCaseCombos";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { byLatestThenPopularity } from "@/lib/productSort";

export interface ComboProducts {
  products: Product[];
  /** True when neither curated ids nor the series match produced anything. */
  usedFallback: boolean;
}

/**
 * Resolve the product list for an industry+category combo, in precedence order:
 *
 *   1. combo.productIds — hand-curated, order preserved
 *   2. solution.recommendedSeries substring match on product.series
 *   3. fallback: the category's top products
 *
 * Ids that do not resolve, or resolve to a product outside the combo's
 * category, are dropped rather than trusted — a typo must not surface a
 * Samsung panel on a Logitech page.
 */
export function resolveComboProducts(
  combo: UseCaseCombo,
  category: ProductCategory,
  solution: Solution
): ComboProducts {
  const inCategory = showcaseProducts.filter((p) => p.category === category.name);

  if (combo.productIds?.length) {
    const byId = new Map(inCategory.map((p) => [p.id, p]));
    const curated = combo.productIds
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p));
    if (curated.length > 0) return { products: curated, usedFallback: false };
  }

  const matched = inCategory
    .filter((p) => solution.recommendedSeries.some((s) => p.series.includes(s)))
    .sort(byLatestThenPopularity);
  if (matched.length > 0) return { products: matched.slice(0, 8), usedFallback: false };

  return {
    products: [...inCategory].sort(byLatestThenPopularity).slice(0, 4),
    usedFallback: true,
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/comboProducts.test.ts`
Expected: PASS.

- [ ] **Step 6: Use the resolver in the page**

In `app/solutions/[industry]/[category]/page.tsx`, delete the `matchingProducts` / `featuredProducts` / `showingFallback` block at lines ~93-106 and replace with:

```ts
  const { products: featuredProducts, usedFallback: showingFallback } =
    resolveComboProducts(combo, categoryObj, solution);
```

Add the import and drop now-unused ones (`showcaseProducts` and `byLatestThenPopularity` if nothing else in the file uses them — check before deleting):

```ts
import { resolveComboProducts } from "@/lib/comboProducts";
```

- [ ] **Step 7: Verify no regression on Samsung combos**

Run: `npm test && npm run build`
Expected: full suite passes; build succeeds. The 16 Samsung combos have no `productIds`, so they take branch 2 exactly as before.

- [ ] **Step 8: Commit**

```bash
git add data/useCaseCombos.ts lib/comboProducts.ts lib/comboProducts.test.ts "app/solutions/[industry]/[category]/page.tsx"
git commit -m "feat(solutions): curate combo products by id, keeping recommendedSeries Samsung-only" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# Phase 2 — Logitech VC surface

## Task 5: `data/vcRoomGuides.ts` + guards

**Files:**
- Create: `data/vcRoomGuides.ts`
- Create: `data/vcRoomGuides.test.ts`

**Interfaces:**
- Produces: `VcRoomGuide` interface, `vcRoomGuides: VcRoomGuide[]`, `getVcRoomGuide(slug: string): VcRoomGuide | undefined`. Consumed by Tasks 7, 8, 9, 17.

**Content note:** this task is copywriting as much as coding. The scaffold, the type, the five slugs, the curated ids, the room bands, and one fully-written entry are given verbatim below. Write the remaining four entries to the same voice, length, and policy — the test enforces the mechanical constraints, you supply the prose. Every `sections[].body` should be 60-110 words. Do not pad.

- [ ] **Step 1: Write the failing test**

Create `data/vcRoomGuides.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { vcRoomGuides, getVcRoomGuide } from "./vcRoomGuides";
import { products } from "./products";

const BANNED = /authoriz|partner|certif|samsung/i;

/** Bands that apply to any room — accessories, not size-specific hardware. */
const ACCESSORY_BANDS = new Set([
  "Any Room",
  "Companion Camera",
  "Outside-room Scheduling",
]);

const byId = new Map(products.map((p) => [p.id, p]));

describe("vcRoomGuides shape", () => {
  it("has 5 guides with unique slugs", () => {
    expect(vcRoomGuides).toHaveLength(5);
    const slugs = vcRoomGuides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("exposes every guide through getVcRoomGuide", () => {
    for (const g of vcRoomGuides) {
      expect(getVcRoomGuide(g.slug)).toBe(g);
    }
    expect(getVcRoomGuide("nope")).toBeUndefined();
  });

  it("every guide carries a navLabel, 3+ sections and 3+ faqs", () => {
    for (const g of vcRoomGuides) {
      expect(g.navLabel.length).toBeGreaterThan(0);
      expect(g.sections.length).toBeGreaterThanOrEqual(3);
      expect(g.faqs.length).toBeGreaterThanOrEqual(3);
      for (const f of g.faqs) expect(f.q.endsWith("?")).toBe(true);
    }
  });

  it("room guides declare roomBands and platform guides do not", () => {
    for (const g of vcRoomGuides) {
      if (g.kind === "room") expect(g.roomBands?.length).toBeGreaterThan(0);
      else expect(g.roomBands).toBeUndefined();
    }
  });
});

describe("vcRoomGuides product curation", () => {
  it("every productId resolves to a Logitech video-conferencing product", () => {
    for (const g of vcRoomGuides) {
      expect(g.productIds.length).toBeGreaterThan(0);
      for (const id of g.productIds) {
        const p = byId.get(id);
        expect(p, `${g.slug} -> ${id}`).toBeDefined();
        expect(p!.brand).toBe("Logitech");
        expect(p!.category).toBe("Video Conferencing");
      }
    }
  });

  it("room-guide products match the guide's declared bands or are accessories", () => {
    for (const g of vcRoomGuides.filter((x) => x.kind === "room")) {
      for (const id of g.productIds) {
        const band = byId.get(id)!.specs.operationTime;
        const ok = g.roomBands!.includes(band) || ACCESSORY_BANDS.has(band);
        expect(ok, `${g.slug} -> ${id} has band "${band}"`).toBe(true);
      }
    }
  });

  it("covers all 16 Logitech products across the room guides", () => {
    const covered = new Set(
      vcRoomGuides.filter((g) => g.kind === "room").flatMap((g) => g.productIds)
    );
    const all = products.filter((p) => p.brand === "Logitech").map((p) => p.id);
    for (const id of all) expect(covered.has(id), `uncovered: ${id}`).toBe(true);
  });
});

describe("vcRoomGuides content policy", () => {
  it("contains no authorization/partner/certification/Samsung wording", () => {
    expect(BANNED.test(JSON.stringify(vcRoomGuides))).toBe(false);
  });

  it("the two platform guides share no identical section or faq text", () => {
    const [teams, zoom] = ["microsoft-teams-rooms", "zoom-rooms"].map(
      (s) => getVcRoomGuide(s)!
    );
    const strings = (g: typeof teams) => [
      g.intro,
      ...g.sections.flatMap((s) => [s.heading, s.body]),
      ...g.faqs.flatMap((f) => [f.q, f.a]),
    ];
    const overlap = strings(teams).filter((s) => strings(zoom).includes(s));
    expect(overlap).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run data/vcRoomGuides.test.ts`
Expected: FAIL — `Cannot find module './vcRoomGuides'`.

- [ ] **Step 3: Write the data file**

Create `data/vcRoomGuides.ts` with this header, type, and first entry verbatim:

```ts
/**
 * Logitech room-size and platform buying guides.
 * One page each at /categories/video-conferencing/{slug}.
 *
 * POSITIONING: Aplus resells genuine Logitech product (nominative fair use) but
 * is NOT an authorized Logitech partner. Nothing in this file may contain
 * "authorized", "partner", "certified", or "Samsung" — including the true
 * Logitech claim "Certified for Microsoft Teams", which must be written as
 * "runs Microsoft Teams Rooms out of the box". Enforced by vcRoomGuides.test.ts.
 *
 * Each guide is hand-written, not template-derived: room-size and platform are
 * the two axes where the recommendation genuinely changes, which is what keeps
 * these pages out of doorway-page territory. See the design spec.
 */

export interface VcRoomGuideSection {
  heading: string;
  /** 60-110 words of indexable body copy. */
  body: string;
}

export interface VcRoomGuide {
  slug: string;
  kind: "room" | "platform";
  /** Short label for breadcrumbs and cross-link cards, e.g. "Huddle Rooms". */
  navLabel: string;
  /** SEO H1, ~50-65 chars. */
  title: string;
  subtitle: string;
  /** ~50-word intro; also the meta description. */
  intro: string;
  /**
   * For kind "room": the exact `specs.operationTime` values this guide covers.
   * Copy them verbatim from data/videoConferencing.ts — the compound bands use
   * an EN DASH (U+2013), and a hyphen will fail the test. Omit for platforms.
   */
  roomBands?: string[];
  /** Curated product ids, in display order. */
  productIds: string[];
  sections: VcRoomGuideSection[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
}

export const vcRoomGuides: VcRoomGuide[] = [
  {
    slug: "huddle-rooms",
    kind: "room",
    navLabel: "Huddle Rooms",
    title: "Logitech Huddle Room Video Conferencing Systems",
    subtitle:
      "All-in-one video bars sized for two-to-six-person rooms, with one-touch join and no room PC.",
    intro:
      "Huddle rooms need a single device that covers camera, microphones and speakers without a rack or a room PC. Logitech's compact bars mount under a display, run Microsoft Teams Rooms or Zoom Rooms on-device, and cover a short table end to end. Aplus supplies, installs and maintains them across India.",
    roomBands: ["Huddle Rooms", "Huddle–Small Rooms"],
    productIds: [
      "logitech-rally-bar-huddle",
      "logitech-meetup-2",
      "logitech-tap-ip",
      "logitech-tap-scheduler",
    ],
    sections: [
      {
        heading: "What counts as a huddle room",
        body:
          "A huddle room seats two to six people at a table roughly 1.5 to 2.5 metres long, usually with a single display on the short wall. The camera has to cover a wide angle at close range rather than reach down a long table, so field of view matters more than optical zoom. One integrated device is almost always the right answer: separate cameras, mics and DSP add cost and cabling that a room this size never recovers.",
      },
      {
        heading: "Why an all-in-one bar fits this size",
        body:
          "Rally Bar Huddle and MeetUp 2 put a wide-angle camera, a beamforming mic array and speakers in one chassis that mounts under the display. Both run Microsoft Teams Rooms and Zoom Rooms on-device, so there is no separate room PC to specify, patch or fail. AI framing keeps whoever is talking in shot without an operator. For a room used ad hoc all day, fewer components means fewer support calls.",
      },
      {
        heading: "Adding a controller and scheduling",
        body:
          "A bar alone joins meetings from its remote, which is fine for a room with a known owner. For shared huddle spaces, Tap IP gives a wall- or table-mounted touch controller over a single network cable, and Tap Scheduler mounted outside the door shows availability and lets someone claim the room on the spot. Both reduce the most common huddle-room complaint, which is people standing in the doorway wondering whether the room is free.",
      },
    ],
    faqs: [
      {
        q: "How many people does a Logitech huddle room bar cover?",
        a: "Rally Bar Huddle and MeetUp 2 are built for two-to-six-person rooms with a short table. Above that, the camera is still fine but the microphone pickup starts to favour the near end — that is the point to move up to a medium-room bar. Tell us your table length and we will confirm.",
      },
      {
        q: "Do I need a room PC for a huddle room?",
        a: "No. Both recommended bars run Microsoft Teams Rooms and Zoom Rooms on the device itself, so a huddle room needs the bar, a display and network. A separate compute appliance only becomes useful when you want to drive a second screen or run a platform the bar does not host on-device.",
      },
      {
        q: "Can one bar switch between Teams and Zoom?",
        a: "Yes. These bars host both platforms and you select which one the room runs; some deployments also allow switching modes. If your organisation runs both, tell us which should be the default and we will configure the room that way before delivery.",
      },
      {
        q: "What does Aplus supply with a huddle room order?",
        a: "Aplus supplies genuine Logitech hardware with GST invoicing, mounts and cabling, on-site installation and configuration for your platform, and AMC support across India. A free installation assessment is available for every order.",
      },
    ],
    ctaHeading: "Fitting out huddle rooms?",
  },
  // ... four more entries, briefs below
];

export function getVcRoomGuide(slug: string): VcRoomGuide | undefined {
  return vcRoomGuides.find((g) => g.slug === slug);
}
```

Write the remaining four entries to these briefs. Same field set, same voice, 3-4 sections and 3-4 FAQs each.

**2. `medium-meeting-rooms`** — `kind: "room"`, navLabel `"Medium Meeting Rooms"`, title `"Logitech Video Conferencing for Medium Meeting Rooms"`.
`roomBands: ["Small–Medium Rooms", "Medium–Large Rooms", "Medium Rooms", "Small–Large Rooms"]` (en dashes).
`productIds: ["logitech-rally-bar-mini", "logitech-rally-bar", "logitech-rally-ai-camera", "logitech-ptz-pro-2", "logitech-rally-camera", "logitech-tap", "logitech-roommate"]`.
Sections: sizing a 6-12 person room and where a mini bar stops being enough; when to move from an all-in-one bar to a separate camera plus compute; the role of a Tap controller in a shared room; cabling and display-count considerations.
FAQs: which bar for a 10-person room; bar vs. separate camera; do I need RoomMate; what Aplus supplies.

**3. `boardrooms`** — `kind: "room"`, navLabel `"Boardrooms"`, title `"Logitech Boardroom Video Conferencing Systems"`.
`roomBands: ["Large Rooms"]`.
`productIds: ["logitech-rally-plus", "logitech-rally-board-65", "logitech-rally-ai-camera-pro", "logitech-sight", "logitech-scribe", "logitech-tap"]`.
Sections: why large rooms need distributed mic pods rather than a single bar; modular Rally Plus vs. all-in-one Rally Board 65; adding a table-view companion camera (Sight) and a whiteboard camera (Scribe); front-of-room control and executive-room expectations.
FAQs: how many mic pods for a 16-seat table; Rally Plus or Rally Board 65; what Sight adds; what Aplus supplies.

**4. `microsoft-teams-rooms`** — `kind: "platform"`, no `roomBands`, navLabel `"Microsoft Teams Rooms"`, title `"Logitech Hardware for Microsoft Teams Rooms"`.
`productIds: ["logitech-rally-bar-huddle", "logitech-rally-bar-mini", "logitech-rally-bar", "logitech-rally-board-65", "logitech-tap-ip", "logitech-roommate", "logitech-tap-scheduler"]`.
Sections: the two deployment shapes — a bar hosting Teams Rooms on-device vs. RoomMate driving the room — and when each is right; the room ladder from huddle to boardroom on Teams; Tap IP and single-cable network deployment; Tap Scheduler outside the room.
FAQs: on-device vs. compute appliance; do I need a Windows PC; which bar per room size; switching an existing room to Teams.
**Every string must differ from the `zoom-rooms` entry** — the test asserts zero identical strings between the two.

**5. `zoom-rooms`** — `kind: "platform"`, no `roomBands`, navLabel `"Zoom Rooms"`, title `"Logitech Hardware for Zoom Rooms"`.
`productIds: ["logitech-rally-bar-huddle", "logitech-rally-bar-mini", "logitech-rally-bar", "logitech-rally-plus", "logitech-rally-board-65", "logitech-tap", "logitech-roommate"]`.
Sections: appliance-mode Zoom Rooms on a Logitech bar and what that removes from the BOM; the room ladder from huddle to boardroom on Zoom; controller options and in-room join; where a separate compute appliance still earns its place.
FAQs: appliance mode vs. a Zoom Rooms PC; which bar per room size; can a room run both platforms; what Aplus supplies.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run data/vcRoomGuides.test.ts`
Expected: PASS on all cases. If the band test fails, you typed a hyphen where the data has U+2013.

- [ ] **Step 5: Commit**

```bash
git add data/vcRoomGuides.ts data/vcRoomGuides.test.ts
git commit -m "feat(vc): add 5 Logitech room and platform buying guides" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 6: Three Logitech industry combos

**Files:**
- Modify: `data/useCaseCombos.ts` (append 3 entries)
- Create: `data/useCaseCombos.test.ts`

**Interfaces:**
- Consumes: `UseCaseCombo.productIds` from Task 4.
- Produces: three combos routable at `/solutions/{corporate,education,hospitality}/video-conferencing`. The existing `generateStaticParams` picks them up with no route change.

- [ ] **Step 1: Write the failing test**

Create `data/useCaseCombos.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { useCaseCombos } from "./useCaseCombos";
import { solutions } from "./solutions";
import { productCategories } from "./categories";
import { products } from "./products";

const BANNED = /authoriz|partner|certif|samsung/i;
const byId = new Map(products.map((p) => [p.id, p]));

describe("useCaseCombos integrity", () => {
  it("every combo references a real industry and category", () => {
    for (const c of useCaseCombos) {
      expect(solutions.some((s) => s.slug === c.industry), c.industry).toBe(true);
      expect(productCategories.some((p) => p.id === c.category), c.category).toBe(true);
    }
  });

  it("has unique industry+category pairs", () => {
    const keys = useCaseCombos.map((c) => `${c.industry}/${c.category}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every curated productId resolves inside the combo's category", () => {
    for (const c of useCaseCombos) {
      const cat = productCategories.find((p) => p.id === c.category)!;
      for (const id of c.productIds ?? []) {
        const p = byId.get(id);
        expect(p, `${c.industry}/${c.category} -> ${id}`).toBeDefined();
        expect(p!.category).toBe(cat.name);
      }
    }
  });

  it("every combo has 4+ use cases and 3+ faqs", () => {
    for (const c of useCaseCombos) {
      expect(c.useCases.length).toBeGreaterThanOrEqual(4);
      expect(c.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("video-conferencing combos content policy", () => {
  const vc = useCaseCombos.filter((c) => c.category === "video-conferencing");

  it("has exactly 3 VC combos: corporate, education, hospitality", () => {
    expect(vc.map((c) => c.industry).sort()).toEqual([
      "corporate",
      "education",
      "hospitality",
    ]);
  });

  it("carries curated productIds and no banned wording", () => {
    for (const c of vc) {
      expect(c.productIds?.length, c.industry).toBeGreaterThan(0);
      expect(BANNED.test(JSON.stringify(c)), c.industry).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run data/useCaseCombos.test.ts`
Expected: FAIL on the VC-combo cases (none exist yet). The integrity cases should already pass against the 16 Samsung combos — if any fail, stop and report it as a pre-existing defect rather than editing Samsung data.

- [ ] **Step 3: Append the three combos**

Add to the end of the `useCaseCombos` array, following the existing entry shape exactly (`industry`, `category`, `title`, `subtitle`, `intro`, `useCases` with 5 entries, `faqs` with 4, `ctaHeading`) plus `productIds`. Zero Samsung/authorized/partner/certified wording in any of them.

```ts
  // ─── VIDEO CONFERENCING (Logitech) ────────────────────────────────────────
  {
    industry: "corporate",
    category: "video-conferencing",
    productIds: [
      "logitech-rally-bar-huddle",
      "logitech-rally-bar-mini",
      "logitech-rally-bar",
      "logitech-rally-plus",
      "logitech-tap",
      "logitech-roommate",
    ],
    title: "Video Conferencing for Corporate Offices & Boardrooms",
    subtitle:
      "One hardware standard from huddle room to boardroom, running Microsoft Teams Rooms and Zoom Rooms.",
    intro:
      "Hybrid meetings only work when every room joins the same way. Logitech room systems give a corporate estate one standard — the same controller and one-touch join in a two-person huddle room and a sixteen-seat boardroom — so IT supports one platform instead of five. Aplus supplies, installs and maintains the range across India.",
    useCases: [ /* 5 — see below */ ],
    faqs: [ /* 4 — see below */ ],
    ctaHeading: "Standardising meeting rooms across your offices?",
  },
```

Corporate `useCases` (5, each `{ title, description }`, one sentence each): Boardroom Systems; Huddle & Focus Rooms; Training & Town Hall Rooms; Executive Suites; Multi-Floor Standardisation.

Corporate `faqs` (4, each `{ q, a }`, 2-3 sentences each): standardising one hardware set across mixed room sizes; running Teams and Zoom across a single estate; how a phased rollout across floors and cities works; what Aplus supplies, installs and supports.

`education` combo: `productIds: ["logitech-rally-bar-mini", "logitech-rally-bar", "logitech-rally-ai-camera", "logitech-scribe", "logitech-tap"]`. Angle: hybrid classrooms, lecture capture, remote guest faculty, examiner viva sessions, staff-room and admin meetings. Note the parent hub `/solutions/education` is Samsung-interactive-display-led, so this page must stand on its own without leaning on the hub's brand.

`hospitality` combo: `productIds: ["logitech-rally-plus", "logitech-rally-bar", "logitech-tap", "logitech-tap-scheduler", "logitech-roommate"]`. Angle: hybrid-capable banquet and conference facilities as a sellable amenity, business-centre meeting rooms, back-of-house management meetings, pre-function scheduling displays, multi-property standardisation.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run data/useCaseCombos.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify the three new pages build and read correctly**

Run: `npm run build`
Then confirm `/solutions/corporate/video-conferencing` renders with the heading "Logitech video conferencing for corporate & workplace" (proving Task 3 landed), the "Recommended for you" eyebrow rather than "From this category" (proving Task 4 landed), and no Samsung wording anywhere on the page.

- [ ] **Step 6: Commit**

```bash
git add data/useCaseCombos.ts data/useCaseCombos.test.ts
git commit -m "feat(solutions): add Logitech VC combos for corporate, education and hospitality" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 7: The nested sub-route + breadcrumb helper

**Files:**
- Create: `lib/subPageCrumbs.ts`
- Create: `lib/subPageCrumbs.test.ts`
- Create: `app/categories/[slug]/[sub]/page.tsx`

**Interfaces:**
- Consumes: `vcRoomGuides`, `getVcRoomGuide` (Task 5); `categoryBrand` (Task 1).
- Produces: `subPageCrumbs(category, sub): Crumb[]`. Produces the route; Task 8 supplies `VcRoomGuide` the component, Task 11 supplies `EducationSegmentPage`.

**Breadcrumb depth is 4, not 3.** Both parents put `/products` at level two — `app/categories/[slug]/page.tsx:145-149` and `components/education/EducationLanding.tsx:20-24` both emit `Home → Products → {Category}`. A 3-level child would contradict its own parent's trail.

- [ ] **Step 1: Write the failing test**

Create `lib/subPageCrumbs.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { subPageCrumbs } from "./subPageCrumbs";
import { getCategoryById } from "@/data/categories";

describe("subPageCrumbs", () => {
  it("builds a 4-level trail matching the parent category page", () => {
    const crumbs = subPageCrumbs(getCategoryById("video-conferencing")!, {
      slug: "huddle-rooms",
      navLabel: "Huddle Rooms",
    });
    expect(crumbs).toEqual([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Video Conferencing", url: "/categories/video-conferencing" },
      { name: "Huddle Rooms", url: "/categories/video-conferencing/huddle-rooms" },
    ]);
  });

  it("uses the category navLabel, not the raw slug, at level three", () => {
    const crumbs = subPageCrumbs(getCategoryById("education")!, {
      slug: "k-12-schools",
      navLabel: "K-12 Schools",
    });
    expect(crumbs[2]).toEqual({ name: "Education", url: "/categories/education" });
    expect(crumbs[3].url).toBe("/categories/education/k-12-schools");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/subPageCrumbs.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the helper**

Create `lib/subPageCrumbs.ts`:

```ts
import type { ProductCategory } from "@/data/categories";
import type { Crumb } from "@/lib/jsonLd";

/**
 * Breadcrumb trail for a nested category page. Four levels, because both
 * parents (the category page and the Class Saathi landing) put /products at
 * level two — a shorter child trail would contradict its own parent's
 * BreadcrumbList. The visible nav and the JSON-LD must both use this.
 */
export function subPageCrumbs(
  category: ProductCategory,
  sub: { slug: string; navLabel: string }
): Crumb[] {
  return [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: category.navLabel, url: `/categories/${category.id}` },
    { name: sub.navLabel, url: `/categories/${category.id}/${sub.slug}` },
  ];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/subPageCrumbs.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the route**

Create `app/categories/[slug]/[sub]/page.tsx`. Education dispatch is stubbed to `notFound()` here and completed in Task 11 — that keeps this task independently shippable.

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import { vcRoomGuides, getVcRoomGuide } from "@/data/vcRoomGuides";
import { SITE, breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { subPageCrumbs } from "@/lib/subPageCrumbs";
import VcRoomGuideView from "@/components/vc/VcRoomGuide";

export const revalidate = 3600;

// The valid (slug, sub) pairs are the fixed set enumerated below. Any other
// pair must 404 at the routing layer — without this, unknown pairs stream
// through loading.tsx + ISR and notFound() returns a soft 200 instead of a
// real 404 (vercel/next.js#63478, #76501).
export const dynamicParams = false;

interface PageParams {
  slug: CategorySlug;
  sub: string;
}

export async function generateStaticParams() {
  return vcRoomGuides.map((g) => ({ slug: "video-conferencing", sub: g.slug }));
}

/** Resolve a (slug, sub) pair to its page payload, or null. */
function resolve(slug: CategorySlug, sub: string) {
  const category = getCategoryById(slug);
  if (!category) return null;
  if (slug === "video-conferencing") {
    const guide = getVcRoomGuide(sub);
    return guide ? ({ kind: "vc", category, guide } as const) : null;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const found = resolve(slug, sub);
  if (!found) return {};
  const url = `${SITE}/categories/${slug}/${sub}`;
  const { title, intro, navLabel } = found.guide;
  return {
    title,
    description: intro,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${navLabel} | Aplus Technology Solutions`,
      description: intro,
      // OG image comes from opengraph-image.tsx (file convention) — never
      // hardcode the URL here, generateImageMetadata mounts it under /og.
    },
    twitter: {
      card: "summary_large_image",
      title: `${navLabel} | Aplus Technology Solutions`,
      description: intro,
    },
  };
}

export default async function CategorySubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, sub } = await params;
  const found = resolve(slug, sub);
  if (!found) notFound();

  const { category, guide } = found;
  const jsonLd = [
    breadcrumbLd(subPageCrumbs(category, guide)),
    faqPageLd(guide.faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <VcRoomGuideView guide={guide} category={category} />
    </>
  );
}
```

- [ ] **Step 6: Commit**

Task 8 supplies the component, so the build will not pass until then. Commit the helper and its test now, and hold the route file for Task 8's commit:

```bash
git add lib/subPageCrumbs.ts lib/subPageCrumbs.test.ts
git commit -m "feat(seo): add 4-level breadcrumb builder for nested category pages" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 8: `VcRoomGuide` component

**Files:**
- Create: `components/vc/VcRoomGuide.tsx`

**Interfaces:**
- Consumes: `VcRoomGuide` (Task 5), `ProductCategory`, `resolveComboProducts` is **not** used here — resolve ids directly.
- Produces: default export `VcRoomGuideView({ guide, category })`.

Build it as a server component from the existing page vocabulary — visible 4-level breadcrumb nav matching `subPageCrumbs`, `<h1>{guide.title}</h1>`, subtitle, intro, the sections as `<h2>` + prose, a `ProductCard` grid for `guide.productIds`, the FAQ `<details>` block copied in structure from `app/categories/[slug]/page.tsx:346-380`, the sibling platform cross-link, and a closing CTA using `guide.ctaHeading`.

- [ ] **Step 1: Resolve products by id, dropping unknowns**

At the top of the component:

```tsx
import type { Product } from "@/data/products";
import { showcaseProducts } from "@/lib/showcaseProducts";

const byId = new Map(showcaseProducts.map((p) => [p.id, p]));
const guideProducts = guide.productIds
  .map((id) => byId.get(id))
  .filter((p): p is Product => Boolean(p));
```

- [ ] **Step 2: Add the sibling platform cross-link**

Spec Fix 10. Render only on the two platform guides, so each points at the other:

```tsx
{guide.kind === "platform" && (() => {
  const sibling = vcRoomGuides.find(
    (g) => g.kind === "platform" && g.slug !== guide.slug
  );
  if (!sibling) return null;
  return (
    <p className="text-sm text-gray-600">
      Deploying {sibling.navLabel} instead?{" "}
      <Link
        href={`/categories/video-conferencing/${sibling.slug}`}
        className="font-semibold text-blue-600 hover:text-blue-700"
      >
        See the {sibling.navLabel} hardware guide
      </Link>
      .
    </p>
  );
})()}
```

- [ ] **Step 3: Add the room-band chip row on room guides**

For `kind === "room"`, render `guide.roomBands` as chips using the same chip classes as the category hero's "Best for" group (`app/categories/[slug]/page.tsx:218-227`). This surfaces the room claim visibly, matching what Task 5's test asserts in data.

- [ ] **Step 4: Build and check for policy violations**

Run: `npm run build`
Expected: build succeeds and all 5 guide pages are prerendered.

Then grep the built output for banned wording on these routes:

```bash
grep -rilE "authoriz|partner|certif|samsung" .next/server/app/categories/video-conferencing/ || echo "CLEAN"
```
Expected: `CLEAN`.

- [ ] **Step 5: Verify the hard 404**

Start the built server and confirm an unknown sub returns a real 404, not a soft 200:

```bash
npm run start &
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/categories/video-conferencing/not-a-guide
```
Expected: `404`.

After stopping the server, kill any orphan by port — on Windows a stopped background `next` process leaves a listener that poisons later builds:

```bash
npx kill-port 3000
```

- [ ] **Step 6: Commit**

```bash
git add components/vc/VcRoomGuide.tsx "app/categories/[slug]/[sub]/page.tsx"
git commit -m "feat(vc): add room and platform guide pages under the VC category" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 9: OG image for the sub-route

**Files:**
- Create: `app/categories/[slug]/[sub]/opengraph-image.tsx`

Model it on `app/categories/[slug]/opengraph-image.tsx` — same 1200×630, same `generateImageMetadata` with `id: "og"`, same dark gradient chrome. Use the guide's `navLabel` as the headline and `subtitle` as the body. Eyebrow reads "Video Conferencing" (never "Samsung Category").

**Satori rules — violating these fails the image silently at build:** every container needs an explicit `display: "flex"`; `inline-flex` throws; `width: "fit-content"` is ignored, so use `display: "flex"` + `alignSelf: "flex-start"` for pills.

- [ ] **Step 1: Write the image route**

Copy the structure of the existing category OG image, replacing the category-specific bits with guide fields and dropping the education theme branch (this route's VC pages are always the blue ramp; Task 11 adds the emerald branch for education segments).

- [ ] **Step 2: Verify each image renders**

Run: `npm run build`, then with the server running fetch each and confirm a PNG, not an error page:

```bash
for s in huddle-rooms medium-meeting-rooms boardrooms microsoft-teams-rooms zoom-rooms; do
  curl -s -o /dev/null -w "$s %{http_code} %{content_type}\n" \
    "http://localhost:3000/categories/video-conferencing/$s/opengraph-image/og"
done
```
Expected: `200 image/png` for all five.

- [ ] **Step 3: Commit**

```bash
git add "app/categories/[slug]/[sub]/opengraph-image.tsx"
git commit -m "feat(vc): add OG images for the VC room and platform guides" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 10: Cross-link strip on the VC category page

**Files:**
- Modify: `app/categories/[slug]/page.tsx` (new section after the product grid)

**Interfaces:**
- Consumes: `vcRoomGuides` (Task 5).

Without this the five guides have no crawl path from their ranking parent.

- [ ] **Step 1: Add the section**

Render only for the VC category, styled like the existing "Industries we serve" block at `app/categories/[slug]/page.tsx:302-344`. Two groups — "By room size" (`kind === "room"`) and "By platform" (`kind === "platform"`) — each card linking `/categories/video-conferencing/{slug}` with `navLabel` as the heading and `subtitle` as the body.

- [ ] **Step 2: Verify**

Run: `npm run build`, then confirm `/categories/video-conferencing` renders all five links and `/categories/digital-signage` renders none.

- [ ] **Step 3: Commit**

```bash
git add "app/categories/[slug]/page.tsx"
git commit -m "feat(vc): link the room and platform guides from the VC category page" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# Phase 3 — Class Saathi surface

## Task 11: `data/educationSegments.ts` + guards

**Files:**
- Create: `data/educationSegments.ts`
- Create: `data/educationSegments.test.ts`

**Interfaces:**
- Produces: `EducationSegment`, `educationSegments`, `getEducationSegment(slug)`. Consumed by Tasks 12, 13, 17.

**Truth policy is the hard constraint here.** Every claim must trace to the brochure or tag-hive.com. The `clickers-vs-alternatives` page exists precisely because its claims are about the *category* of clicker-based response systems rather than new Class Saathi assertions — keep it that way.

- [ ] **Step 1: Write the failing test**

Create `data/educationSegments.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { educationSegments, getEducationSegment } from "./educationSegments";
import * as education from "./education";

const BANNED = /authori[sz]ed|official|certified|partner/i;
const DROPPED = /CS-25|CS-40|CS-80|500,?000|500k|5,?000\+ schools|CR2032|12%/i;

const allText = JSON.stringify(educationSegments);

describe("educationSegments content truth policy", () => {
  it("contains zero partnership language", () => {
    expect(allText).not.toMatch(BANNED);
  });

  it("mentions Samsung only as 'Samsung C-Lab'", () => {
    expect(allText.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });

  it("reintroduces none of the dropped fabricated claims", () => {
    expect(allText).not.toMatch(DROPPED);
  });

  it("introduces no numeric claim absent from data/education.ts", () => {
    const known = new Set(
      (JSON.stringify(education).match(/\d[\d,.]*%?/g) ?? []).map((s) => s.replace(/[.,]$/, ""))
    );
    const used = (allText.match(/\d[\d,.]*%?/g) ?? []).map((s) => s.replace(/[.,]$/, ""));
    const novel = used.filter((n) => !known.has(n) && !/^(1|2|3|4|5|6|7|8|9|10|12)$/.test(n));
    expect(novel, `unverified numbers: ${novel.join(", ")}`).toEqual([]);
  });
});

describe("educationSegments shape", () => {
  it("has 3 segments with unique slugs", () => {
    expect(educationSegments).toHaveLength(3);
    expect(educationSegments.map((s) => s.slug).sort()).toEqual([
      "clickers-vs-alternatives",
      "coaching-institutes",
      "k-12-schools",
    ]);
  });

  it("exposes every segment through getEducationSegment", () => {
    for (const s of educationSegments) expect(getEducationSegment(s.slug)).toBe(s);
    expect(getEducationSegment("nope")).toBeUndefined();
  });

  it("every segment has a navLabel, 3+ points and 3+ faqs", () => {
    for (const s of educationSegments) {
      expect(s.navLabel.length).toBeGreaterThan(0);
      expect(s.points.length).toBeGreaterThanOrEqual(3);
      expect(s.faqs.length).toBeGreaterThanOrEqual(3);
      for (const f of s.faqs) expect(f.q.endsWith("?")).toBe(true);
    }
  });

  it("the comparison page names no leading stakeholder", () => {
    expect(getEducationSegment("clickers-vs-alternatives")!.leadStakeholder).toBeNull();
  });
});
```

The novel-number test allows small integers 1-12 (used in ordinary prose like "two to six people") and otherwise requires every number to already appear in `data/education.ts`. If you need a number it rejects, that number is unverified — cut it rather than widening the allowlist.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run data/educationSegments.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the data file**

```ts
/**
 * Class Saathi audience-segment and comparison pages.
 * One page each at /categories/education/{slug}.
 *
 * CONTENT TRUTH POLICY (inherited from data/education.ts): every claim traces
 * to the Class Saathi brochure or tag-hive.com. No partnership language —
 * Aplus is an independent solutions provider featuring Class Saathi. "Samsung"
 * only ever as "Samsung C-Lab". No numeric claim that is not already in
 * data/education.ts. Enforced by educationSegments.test.ts.
 *
 * Three pages, not three parallel audience pages: all verified Class Saathi
 * facts come from one brochure and four stakeholder feature sets, so a third
 * audience page would read as templated. The comparison page instead makes
 * category-level claims, which is policy-safe by construction. See the spec.
 */

export interface EducationSegment {
  slug: string;
  /** Short label for breadcrumbs and cross-link cards. */
  navLabel: string;
  /** SEO H1. */
  title: string;
  subtitle: string;
  /** ~50-word intro; also the meta description. */
  intro: string;
  /** Which data/education.ts ecosystemTabs stakeholder this page leads with. */
  leadStakeholder: "teacher" | "student" | "parent" | "admin" | null;
  points: { title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
}

export const educationSegments: EducationSegment[] = [ /* 3 entries */ ];

export function getEducationSegment(slug: string): EducationSegment | undefined {
  return educationSegments.find((s) => s.slug === slug);
}
```

Write the three entries to these briefs, drawing every fact from `data/education.ts`:

**1. `k-12-schools`** — navLabel `"K-12 Schools"`, title `"Class Saathi for K-12 Schools — Clickers & AI Assessment"`, `leadStakeholder: "admin"`.
Points from the verified admin and parent feature sets: real-time participation and score monitoring across classes; monthly LMS reports per class; the parent app's progress tracking and homework visibility; Bluetooth operation with no internet required in class; the 40%-to-100% participation shift.
FAQs: how a whole-school rollout works; what school leadership sees; whether parents need internet at home; how to get a demo.

**2. `coaching-institutes`** — navLabel `"Coaching Institutes"`, title `"Class Saathi for Coaching Institutes — Batch Assessment"`, `leadStakeholder: "teacher"`.
Points from the verified teacher and student feature sets: AI quiz generation from the institute's own documents, URLs or prompts; AI lesson plans aligned to existing material; daily and subject-centric quizzes plus Saathi Tutor for self-practice; downloadable per-student and whole-class insight reports; the class-kit tools (pie timer, spinner, team maker, vote).
FAQs: whether it works with the institute's own question bank; what a batch's teacher sees after a session; whether students need a device in class; how to get pricing.

**3. `clickers-vs-alternatives`** — navLabel `"Clickers vs Alternatives"`, title `"Clickers vs App Quizzing vs Interactive Panels in Class"`, `leadStakeholder: null`.
Compare four approaches on the axes that actually differ: hands-up/paper, phone or tablet app quizzing, an interactive panel at the front, and a dedicated clicker per student. Discuss per-student device cost, whether every student answers every question, internet dependency, classroom-management and distraction risk, and setup time per lesson. Class Saathi statements limited to: Bluetooth clicker to the teacher's device, no internet required in class, no per-student screen, teacher-device app.
FAQs: why a dedicated clicker rather than students' phones; whether an interactive panel replaces a response system; what happens with no internet; how to evaluate options for our school.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run data/educationSegments.test.ts`
Expected: PASS. A failure on the novel-number test means you introduced an unverified figure — cut it.

- [ ] **Step 5: Commit**

```bash
git add data/educationSegments.ts data/educationSegments.test.ts
git commit -m "feat(education): add Class Saathi segment and comparison page data" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 12: `EducationSegmentPage` + route dispatch

**Files:**
- Create: `components/education/EducationSegmentPage.tsx`
- Modify: `app/categories/[slug]/[sub]/page.tsx` (add the education branch)
- Modify: `app/categories/[slug]/[sub]/opengraph-image.tsx` (add the emerald theme)
- Modify: `components/education/EducationLanding.tsx` (segment strip)

**Interfaces:**
- Consumes: `educationSegments`, `getEducationSegment` (Task 11); `subPageCrumbs` (Task 7).

- [ ] **Step 1: Extend `generateStaticParams` and `resolve`**

In the route file, add education to both:

```ts
export async function generateStaticParams() {
  return [
    ...vcRoomGuides.map((g) => ({ slug: "video-conferencing", sub: g.slug })),
    ...educationSegments.map((s) => ({ slug: "education", sub: s.slug })),
  ];
}
```

In `resolve`, add before the final `return null`:

```ts
  if (slug === "education") {
    const segment = getEducationSegment(sub);
    return segment ? ({ kind: "education", category, segment } as const) : null;
  }
```

`generateMetadata` and the component currently destructure `found.guide`. Change both to read the shared fields off a normalised local so the two kinds share one path:

```ts
  const page = found.kind === "vc" ? found.guide : found.segment;
```

`page` has `title`, `intro`, `navLabel`, `slug`, and `faqs` on both types — those are the only fields the route touches. Dispatch on `found.kind` for the component.

- [ ] **Step 2: Build the segment component**

Follow the Class Saathi visual language, not the blue site chrome: `EducationLanding` uses `spaceGrotesk`/`plexMono` from `@/app/fonts-accent` and an emerald ramp. Render the 4-level breadcrumb, `<h1>{segment.title}</h1>`, subtitle, intro, `points` as a card grid, the FAQ `<details>` block, and a closing CTA. Reuse `BlueprintLeadForm` for lead capture so the segment pages feed the same pipeline as the landing.

**Do not import `next/font` from any `"use client"` file** — a known Turbopack bug in this repo. `EducationSegmentPage` must be a server component; the font variables ride on the wrapper's className exactly as in `EducationLanding.tsx:29`.

- [ ] **Step 3: Add the emerald OG theme**

In the sub-route's `opengraph-image.tsx`, branch the theme on `slug === "education"` using the emerald ramp already defined at `app/categories/[slug]/opengraph-image.tsx:69-80`. Eyebrow reads "Education", label reads "Class Saathi by TagHive".

- [ ] **Step 4: Add the segment strip to the landing**

In `EducationLanding.tsx`, add a section linking the three segments (`navLabel` + `subtitle`), placed before `ClosingCta`. This is the crawl path from the ranking parent.

- [ ] **Step 5: Verify**

Run: `npm run build`, then with the server running:

```bash
for s in k-12-schools coaching-institutes clickers-vs-alternatives; do
  curl -o /dev/null -s -w "$s %{http_code}\n" "http://localhost:3000/categories/education/$s"
  curl -s -o /dev/null -w "$s og %{http_code} %{content_type}\n" \
    "http://localhost:3000/categories/education/$s/opengraph-image/og"
done
curl -o /dev/null -s -w "unknown %{http_code}\n" http://localhost:3000/categories/education/nope
```
Expected: `200` for the three pages, `200 image/png` for the three OG images, `404` for the unknown sub.

Then confirm no Samsung leakage:

```bash
grep -rilE "authori[sz]ed|official|certified|partner" .next/server/app/categories/education/ || echo "CLEAN"
```
Expected: `CLEAN`. Kill the port afterwards: `npx kill-port 3000`.

- [ ] **Step 6: Commit**

```bash
git add components/education/EducationSegmentPage.tsx components/education/EducationLanding.tsx "app/categories/[slug]/[sub]/page.tsx" "app/categories/[slug]/[sub]/opengraph-image.tsx"
git commit -m "feat(education): add Class Saathi segment pages under the education category" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 13: Class Saathi Product + ItemList JSON-LD

**Files:**
- Modify: `lib/jsonLd.ts` (two new exports)
- Modify: `lib/jsonLd.test.ts`
- Modify: `components/education/EducationLanding.tsx`

**Interfaces:**
- Produces: `classSaathiProductLd()` and `itemListLd(name, items)`.

The landing currently emits only Breadcrumb + FAQPage, because the education branch returns at `app/categories/[slug]/page.tsx:125` before the category page's `jsonLd` array is built.

**Do not add an `offers` node.** This will raise a "Missing field 'offers'" *warning* in Search Console. That is an accepted site-wide tradeoff already documented at `lib/jsonLd.ts:82-91` and already true of every Samsung product node: Google rejects `Offer` without a numeric price, so a quote-only B2B catalog either omits offers or invents one. `priceSpecification: "Contact for pricing"` would turn the warning into a hard error — `Offer.price` requires a number and `priceSpecification` expects a `PriceSpecification` object. Do not use `@type: "EducationalApplication"` either; that is a schema.org `applicationCategory` value, not a type.

- [ ] **Step 1: Write the failing test**

Append to `lib/jsonLd.test.ts`:

```ts
import { classSaathiProductLd, itemListLd } from "./jsonLd";

describe("classSaathiProductLd", () => {
  const ld = classSaathiProductLd();

  it("is a TagHive-branded Product with no offers node", () => {
    expect(ld["@type"]).toBe("Product");
    expect(ld.brand).toEqual({ "@type": "Brand", name: "TagHive" });
    expect("offers" in ld).toBe(false);
  });

  it("carries no partnership language and no bare Samsung mention", () => {
    const blob = JSON.stringify(ld);
    expect(blob).not.toMatch(/authori[sz]ed|official|certified|partner/i);
    expect(blob.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });
});

describe("itemListLd", () => {
  it("numbers items from 1 and absolutises urls", () => {
    const ld = itemListLd("Segments", [{ name: "A", url: "/categories/education/a" }]);
    expect(ld.numberOfItems).toBe(1);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[0].url).toBe(
      "https://www.aplustechsol.com/categories/education/a"
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: FAIL — the two exports do not exist.

- [ ] **Step 3: Add the two helpers**

In `lib/jsonLd.ts`:

```ts
/**
 * Product node for Class Saathi (TagHive), emitted on the education landing.
 *
 * No `offers` — same reasoning as productLd above: Google rejects Offer without
 * a numeric price, and this is a quote-only B2B catalog. The resulting
 * "Missing field 'offers'" Search Console warning is accepted site-wide.
 *
 * TRUTH POLICY: every field here traces to the Class Saathi brochure or
 * tag-hive.com. "Samsung" appears only inside "Samsung C-Lab".
 */
export function classSaathiProductLd() {
  const url = `${SITE}/categories/education`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: "Class Saathi",
    description:
      "Bluetooth clicker-based learning and assessment solution with an AI-powered platform, for classrooms with no internet connection required.",
    url,
    category: "Education",
    brand: { "@type": "Brand", name: "TagHive" },
    manufacturer: { "@type": "Organization", name: "TagHive Inc.", url: "https://tag-hive.com" },
    audience: { "@type": "EducationalAudience", educationalRole: "school" },
    isRelatedTo: { "@id": ORG_ID },
  };
}

/** Generic ItemList node — used to declare a page's child pages. */
export function itemListLd(name: string, items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/jsonLd.test.ts`
Expected: PASS.

- [ ] **Step 5: Emit both from the landing**

In `EducationLanding.tsx`, extend the `jsonLd` array:

```ts
  const jsonLd = [
    classSaathiProductLd(),
    itemListLd(
      "Class Saathi guides",
      educationSegments.map((s) => ({
        name: s.navLabel,
        url: `/categories/education/${s.slug}`,
      }))
    ),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Education", url: "/categories/education" },
    ]),
    faqPageLd(educationFaqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];
```

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run build`
Expected: green. Confirm the landing's `<script type="application/ld+json">` now contains four nodes.

```bash
git add lib/jsonLd.ts lib/jsonLd.test.ts components/education/EducationLanding.tsx
git commit -m "feat(education): emit Product and ItemList JSON-LD on the Class Saathi landing" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# Phase 4 — On-page fixes, blogs, sitemap

## Task 14: Metadata, footer and home FAQ fixes

**Files:**
- Modify: `app/categories/[slug]/page.tsx:74-94`
- Modify: `app/products/page.tsx:11-46`
- Modify: `components/Footer.tsx:29`
- Modify: `data/faqs.ts`

Four independent copy fixes, all small.

- [ ] **Step 1: Put Logitech in the VC category title**

The Samsung branch produces `"Samsung {navLabel} — Price, Models & Specs"` but the VC branch drops the brand entirely, so the VC hub's title tag has no "Logitech" in it. In the `isVc` branch:

```ts
    title: isVc
      ? `Logitech ${category.navLabel} — Price, Models & Specs`
      : `Samsung ${category.navLabel} — Price, Models & Specs`,
```

And tighten the `isVc` keywords to the queries that actually convert:

```ts
      ? [
          `Logitech ${category.navLabel}`,
          "Logitech video conferencing price India",
          "Logitech Rally Bar dealer India",
          "Microsoft Teams Rooms hardware India",
          "Zoom Rooms hardware India",
          "Aplus Technology Solutions",
        ]
```

- [ ] **Step 2: Make `/products` metadata match what the page renders**

The description names five Samsung categories and omits Video Conferencing, LED Signage and Software, while the grid renders 16 Logitech products under a "Samsung Commercial Display Portfolio" H1. Replace the description, OG/Twitter titles, the H1 and the eyebrow:

```ts
export const metadata: Metadata = {
  title: "Products | Aplus Technology Solutions",
  description:
    "Browse Samsung Smart Signage, Video Walls, Interactive Displays, LED Signage, Hospitality & Business TVs and cloud software, plus Logitech video conferencing systems — supplied, installed and supported across India by Aplus Technology Solutions.",
  ...
```

H1 and eyebrow in the hero:

```tsx
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Authorized Samsung Distributor · Logitech Video Conferencing · India
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commercial Displays & Video Conferencing
          </h1>
```

The eyebrow keeps the genuine Samsung authorization claim while scoping it, so it no longer reads as a claim over the Logitech products beneath it.

- [ ] **Step 3: Give Class Saathi its own footer entry**

`components/Footer.tsx:29` points "Education" at `/solutions/education`, which is the Samsung interactive-display hub, not the Class Saathi landing. Keep that entry and add:

```ts
  { label: "Class Saathi (Education)", href: "/categories/education" },
```

- [ ] **Step 4: Broaden the home FAQ**

`data/faqs.ts` feeds both the visible `FAQSection` and the home page's FAQPage structured data via `components/sections/HomeJsonLd.tsx:1`, and all 7 entries are Samsung/display-only. Append one VC and one Class Saathi FAQ. The VC answer must carry no authorized/partner/certified wording; the Class Saathi answer must introduce no claim absent from `data/education.ts`.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run build`

```bash
git add "app/categories/[slug]/page.tsx" app/products/page.tsx components/Footer.tsx data/faqs.ts
git commit -m "fix(seo): brand-accurate titles, products metadata, footer and home FAQ" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 15: Room-guide links on Logitech product pages

**Files:**
- Modify: `app/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: `vcRoomGuides` (Task 5), `isLogitech` from `lib/brand.ts`.

16 product pages gain a link into the 3 room guides, derived from data with no new copy. Anchor text is the guide's `navLabel` — do **not** rotate it (rejected in the spec: the anchors already vary by band, and consistent descriptive anchors aid topical clarity).

- [ ] **Step 1: Add the derivation**

```tsx
// Room guides that recommend this product. Derived from the guide's curated
// productIds, so the link can never point at a guide that does not list it.
const roomGuidesForProduct = isLogitech(product)
  ? vcRoomGuides.filter((g) => g.kind === "room" && g.productIds.includes(product.id))
  : [];
```

- [ ] **Step 2: Render it near the existing category link**

Place it beside the breadcrumb-adjacent category link at `app/products/[slug]/page.tsx:177`, rendering nothing when the array is empty:

```tsx
{roomGuidesForProduct.length > 0 && (
  <p className="text-sm text-gray-600">
    Rooms this fits:{" "}
    {roomGuidesForProduct.map((g, i) => (
      <span key={g.slug}>
        {i > 0 && ", "}
        <Link
          href={`/categories/video-conferencing/${g.slug}`}
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          {g.navLabel}
        </Link>
      </span>
    ))}
  </p>
)}
```

- [ ] **Step 3: Verify**

Run: `npm run build`. Confirm a Logitech product page (`/products/logitech-rally-bar-huddle`) shows the link and a Samsung one (`/products/...` any Samsung id) shows nothing.

- [ ] **Step 4: Commit**

```bash
git add "app/products/[slug]/page.tsx"
git commit -m "feat(vc): link Logitech product pages to their room guides" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 16: Education tile in CategoryGrid (gated — may be skipped)

**Files:**
- Modify: `components/sections/CategoryGrid.tsx`

This is the one optional task. `/categories/education` is already linked sitewide from the navbar dropdowns, so the home tile is an improvement, not a fix. **If the layout looks worse, skip it and say so.**

Two traps that make this not a simple add:

1. **The href must differ from every other tile.** `CategoryTile` links to `/products?category={id}`, but `/products?category=education` is a no-op — `education` is excluded from `categoriesWithProducts` and `components/ProductsCategoryNav.tsx:21` discards any category param failing that check, so there is no section to scroll to. The Education tile must link straight to `/categories/education`.
2. **`title` must be a two-element array.** `CategoryTile` renders `title[0]<br/>title[1]` and rebuilds the accessible name as `aria-label={`${title[0]} ${title[1]}`}`. A one-element title yields a broken label.

The grid is currently 7 category tiles + `ViewAllTile` = a clean 2×4 at `lg`. Adding a ninth breaks it, so replace `ViewAllTile`. Removing it is safe for accessibility — it is a plain `<Link>` wrapping `<span>`s with no ARIA roles or keyboard hooks.

- [ ] **Step 1: Add the optional href override**

In the `CategoryCard` type:

```ts
  /**
   * Overrides the default /products?category={id} link. Required for Education:
   * it has zero catalog products, so the filtered-catalog URL is a no-op.
   */
  href?: string;
```

In `CategoryTile`, use `href={card.href ?? `/products?category=${card.id}`}`.

- [ ] **Step 2: Add the tile and drop `ViewAllTile`**

Add `GraduationCapIcon` to the existing icon import block at the top of the file (it already exists in `components/icons/`), then append to `CATEGORY_CARDS`:

```ts
  {
    id: "education",
    href: "/categories/education",
    Icon: GraduationCapIcon, // already exists in components/icons — do not add a new one
    title: ["Class Saathi", "Education"],
    iconColor: "#059669",
    accentClass: "text-emerald-600",
    gradient: "from-emerald-50 via-emerald-50/40 to-transparent",
  },
```

Remove the `<ViewAllTile />` usage and the now-unused function.

- [ ] **Step 3: Check it visually — this is the gate**

Use the `verify` skill to launch the app and look at the home page at desktop and mobile widths. Confirm the 2×4 grid still reads evenly and the emerald tile does not fight the muted VC tile beside it. **If it looks worse, revert this task entirely and report that you skipped it.**

- [ ] **Step 4: Commit (only if it passed the gate)**

```bash
git add components/sections/CategoryGrid.tsx
git commit -m "feat(home): surface Class Saathi in the category grid" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

## Task 17: Blog posts and sitemap

**Files:**
- Modify: `data/blogs.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/sitemap.test.ts` (create if absent)

- [ ] **Step 1: Write the sitemap test**

Create or extend a sitemap test asserting every new URL is present and the whole list is unique:

```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { vcRoomGuides } from "@/data/vcRoomGuides";
import { educationSegments } from "@/data/educationSegments";
import { SITE } from "@/lib/jsonLd";

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("has no duplicate urls", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes every VC room and platform guide", () => {
    for (const g of vcRoomGuides) {
      expect(urls).toContain(`${SITE}/categories/video-conferencing/${g.slug}`);
    }
  });

  it("includes every Class Saathi segment", () => {
    for (const s of educationSegments) {
      expect(urls).toContain(`${SITE}/categories/education/${s.slug}`);
    }
  });

  it("includes the three Logitech VC combos", () => {
    for (const i of ["corporate", "education", "hospitality"]) {
      expect(urls).toContain(`${SITE}/solutions/${i}/video-conferencing`);
    }
  });

  it("includes the four new blog posts", () => {
    for (const s of [
      "sizing-a-video-conferencing-system-to-your-room",
      "microsoft-teams-rooms-vs-zoom-rooms-hardware",
      "what-is-a-student-response-system",
      "formative-assessment-without-internet",
    ]) {
      expect(urls).toContain(`${SITE}/blogs/${s}`);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run app/sitemap.test.ts`
Expected: FAIL on the guide, segment and blog cases. The combo case should already pass — combos are picked up automatically by the existing `useCaseCombos` mapping.

- [ ] **Step 3: Add the sitemap entries**

In `app/sitemap.ts`, import the two new data modules and add:

```ts
  const vcGuideUrls: MetadataRoute.Sitemap = vcRoomGuides.map((g) => ({
    url: `${SITE}/categories/video-conferencing/${g.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const educationSegmentUrls: MetadataRoute.Sitemap = educationSegments.map((s) => ({
    url: `${SITE}/categories/education/${s.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));
```

Spread both into the returned array, and bump `CATALOG_LAST_UPDATED` to `new Date("2026-07-26")`.

- [ ] **Step 4: Write the four blog posts**

Append to `data/blogs.ts`, matching the existing `BlogPost` shape exactly (`slug`, `title`, `date`, `readingTimeMinutes`, `tags`, `excerpt`, `body` as markdown). Bodies run 600-900 words with `##` section headings, in the voice of the existing four posts. Each must link to the pages it discusses.

| Slug | Title | Tags | Must link to |
|---|---|---|---|
| `sizing-a-video-conferencing-system-to-your-room` | How to Size a Video Conferencing System to Your Meeting Room | `["Video Conferencing", "Guides", "Meeting Rooms"]` | all three room guides |
| `microsoft-teams-rooms-vs-zoom-rooms-hardware` | Microsoft Teams Rooms vs Zoom Rooms: Choosing Meeting Room Hardware | `["Video Conferencing", "Microsoft Teams", "Zoom"]` | both platform guides |
| `what-is-a-student-response-system` | What Is a Student Response System? | `["Education", "Smart Classroom", "Assessment"]` | `/categories/education/clickers-vs-alternatives` |
| `formative-assessment-without-internet` | Formative Assessment Without Internet: How Clicker Classrooms Work | `["Education", "Assessment", "Guides"]` | `/categories/education` and `/categories/education/k-12-schools` |

The two VC posts must contain zero authorized/partner/certified/Samsung wording. The two education posts must introduce no claim absent from `data/education.ts`.

- [ ] **Step 5: Run everything**

Run: `npm test && npm run build`
Expected: full suite green, build succeeds, all 4 blog pages prerender.

- [ ] **Step 6: Commit**

```bash
git add data/blogs.ts app/sitemap.ts app/sitemap.test.ts
git commit -m "feat(seo): add 4 VC and education blog posts; sitemap the new pages" -m "Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# Phase 5 — Final verification

- [ ] **Step 1: Full suite and clean build**

Run: `npm test && npm run lint && npm run build`
Expected: all green. Compare the test count against the Pre-flight baseline.

- [ ] **Step 2: Policy sweep across the whole built output**

```bash
grep -rilE "authoriz|partner|certif|samsung" \
  .next/server/app/categories/video-conferencing/ \
  .next/server/app/solutions/corporate/video-conferencing* \
  .next/server/app/solutions/education/video-conferencing* \
  .next/server/app/solutions/hospitality/video-conferencing* \
  || echo "LOGITECH CLEAN"

grep -rilE "authori[sz]ed|official|certified|partner" \
  .next/server/app/categories/education/ || echo "CLASS SAATHI CLEAN"
```
Expected: both `CLEAN` lines. Any hit is a release blocker — trace it and fix the source string.

- [ ] **Step 3: Runtime pass with the `verify` skill**

Confirm, on the running build:
- all 11 new pages return 200 and render their content
- unknown subs 404 (`/categories/video-conferencing/nope`, `/categories/education/nope`)
- all 8 new OG images return `image/png`
- the 4-level breadcrumb renders and matches the emitted `BreadcrumbList`
- the two platform guides each link to the other
- three spot-checked Samsung combo pages are visually unchanged
- `/products` H1 and eyebrow read correctly above the mixed-brand grid

- [ ] **Step 4: Structured-data validation**

Paste the rendered HTML of `/categories/education`, `/categories/video-conferencing/huddle-rooms`, and `/solutions/corporate/video-conferencing` into Google's Rich Results Test. Expected: no **errors**. A "Missing field 'offers'" *warning* on the Class Saathi Product node is expected and accepted — do not fix it.

- [ ] **Step 5: Kill orphaned servers**

On Windows a stopped background `next` process leaves a port listener that poisons later builds:

```bash
npx kill-port 3000
```

---

## Deferred / not in this plan

Recorded so nobody re-adds them:

- City × product × query permutation pages — rejected as scaled content abuse.
- The retail VC combo — cannot write 5 distinct use cases without padding.
- WordPress 301 redirects — the old site had no Logitech or Class Saathi pages.
- Making Class Saathi a catalog product — would reverse the deliberate zero-product design in `lib/nonEmptyCategories.ts`.
- An `offers` node, `@type: "EducationalApplication"`, or rotated internal anchor text — all three considered and rejected with reasoning in the spec.
