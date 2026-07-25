# Codebase Audit Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the verified defects found in the 2026-07-22 full-codebase audit, highest-impact first, without regressing the positioning/SEO/perf invariants this codebase already protects.

**Architecture:** Six independent phases. Each phase is self-contained and leaves the repo working — they can be done in any order, in separate sessions, on separate branches. Phase 0 is the exception: do it first, because nothing else can be cleanly installed or CI-built until it lands.

**Tech Stack:** Next.js 16 (App Router), React 19.2.3, TypeScript 5 strict, Tailwind v4, Vitest 4 (`environment: "node"`, `@/*` alias honored), Firebase (Firestore chat + admin), Resend + Zoho, Vercel.

---

## How these findings were produced

A 4-pass audit on 2026-07-22 (one mechanical sweep by the orchestrator + three deep subagent passes). **Every finding below was verified against source** — file:line references are real and were read, not inferred. Where a finding was marked "Suspected" it says so explicitly and states what would confirm it.

Findings deliberately **excluded** as non-issues after verification (do not re-litigate): zero `any`/`@ts-ignore` in the repo; 431 data image paths all exist; no duplicate product/category ids; all 4 Firestore compound queries have matching deployed composite indexes; the `conversationIdRef` empty-flap guard is intact; no `next/font` import in any client file; the `backdrop-filter` portal trap is handled; `prefers-reduced-motion` is respected globally; 13 of 14 `eslint-disable`s are legitimate.

---

## Global Constraints

Copied verbatim from existing project rules — every task's requirements implicitly include these:

- **Positioning rule:** Logitech surfaces (category `video-conferencing`) and Software Solutions (`software`) must carry **no** "Samsung" / "authorized" / "certified" wording. Guarded by banned-wording tests in `data/*.test.ts` — keep them passing.
- **Soft-404 rule:** every dynamic route sets `dynamicParams = false`. Do not remove.
- **next/font rule:** NEVER import `next/font` from a `"use client"` file (Turbopack browserslist bug). Card fonts ride `--font-card-*` CSS vars on `<body>`.
- **backdrop-filter rule:** the navbar's `backdrop-filter` creates a containing block that clamps `position: fixed` overlays — such overlays must be portaled to `document.body`.
- **Removing a product REQUIRES** a matching entry in the middleware 301 map, or its URL 404s.
- Test command: `npm test` (Vitest). Rules tests are separate: `npm run test:rules` (needs Firebase emulators + a JDK).
- Commit style: conventional commits (`fix:`, `perf:`, `feat:`), matching existing history.

---

## Phase 0 — CRITICAL: unbreak the lockfile

**Why first:** `package-lock.json` is committed on `master` containing unresolved Git conflict markers. It is not valid JSON, so `npm ci` fails with `EJSONPARSE`. A clean Vercel build or a fresh `git clone` **cannot install**. Only a warm local `node_modules` is hiding this.

**Verified evidence:**
```
markers at package-lock.json lines 5385, 5424, 5466, 5471, 5472, 5579
node -e "require('./package-lock.json')"  →  SyntaxError: Expected double-quoted property name
git ls-files --error-unmatch package-lock.json  →  tracked
git show master:package-lock.json | grep -c '^<<<<<<<\|^>>>>>>>'  →  4
git status --porcelain package-lock.json  →  (empty; committed state IS the broken state)
```
Introduced by `c205ae4 "merge: resolve conflicts with master for Vercel analytics"` (2026-07-18) — which resolved every conflict *except* the lockfile. Untouched by the 65 commits since. The conflict is `@vercel/analytics` (HEAD side) vs the `@vitest/*` tree (origin/master side); the HEAD side also contains stray `vue-router` content.

### Task 0.1: Regenerate the lockfile

**Files:**
- Modify: `package-lock.json` (regenerate wholesale)

- [ ] **Step 1: Confirm the breakage still exists**

```bash
node -e "require('./package-lock.json')" 2>&1 | head -3
grep -c '^<<<<<<<\|^>>>>>>>' package-lock.json
```
Expected: a `SyntaxError`, and a count of `4`.

- [ ] **Step 2: Restore the last-known-good lockfile from before the bad merge**

```bash
git checkout c205ae4^ -- package-lock.json
node -e "require('./package-lock.json'); console.log('VALID')"
```
Expected: `VALID`.

- [ ] **Step 3: Regenerate against current package.json**

`package.json` has moved on since `c205ae4^`, so the restored lockfile is stale. Resolve it:

```bash
npm install --package-lock-only
node -e "require('./package-lock.json'); console.log('VALID')"
```
Expected: `VALID`. This rewrites the lockfile from `package.json` without touching `node_modules`.

- [ ] **Step 4: Verify a clean install actually works**

```bash
rm -rf node_modules
npm ci
```
Expected: completes with no `EJSONPARSE`. This is the real acceptance test — `npm ci` is what Vercel runs.

- [ ] **Step 5: Verify the app still builds and tests pass**

```bash
npm test
npm run build
```
Expected: tests pass; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json
git commit -m "fix(build): regenerate package-lock.json with unresolved conflict markers removed

The lockfile was committed in c205ae4 with two unresolved conflict regions
(@vercel/analytics vs the @vitest/* tree), making it invalid JSON. npm ci
failed with EJSONPARSE, so no clean install or CI build could succeed."
```

### Task 0.2: Document the 10 undeclared env vars

**Why here:** same class as 0.1 — a fresh clone or a new Vercel environment cannot be configured correctly from what's in the repo. This is the same failure mode as the prior "chat backend not configured" incident.

**Problem:** `.env.example` declares 12 vars; the code reads ~22. Missing (names verified at these call sites):

| Var | Read at |
|---|---|
| `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` | `lib/zoho.ts:38-40` |
| `RESEND_API_KEY` | `lib/apiErrors.ts:47` |
| `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CLASS_SAATHI_TO_EMAIL` | `app/api/contact/route.ts:9,13,322` |
| `TRUST_CF_CONNECTING_IP` | `lib/rateLimit.ts:70` |
| `NEXT_PUBLIC_GA_ID` | `app/layout.tsx:18` |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | `components/PostHogProvider.tsx:8,12` |

**Files:**
- Modify: `.env.example`, `lib/zoho.ts:38-40`

- [ ] **Step 1: Re-derive the list rather than trusting this table**

```bash
grep -rhoE 'process\.env\.[A-Z0-9_]+' app/ components/ lib/ data/ context/ hooks/ middleware.ts \
  | sed 's/process\.env\.//' | sort -u > /tmp/used.txt
grep -oE '^[A-Z0-9_]+' .env.example | sort -u > /tmp/declared.txt
comm -23 /tmp/used.txt /tmp/declared.txt
```
Expected: the vars above, minus Next-provided ones (`NODE_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`) which are injected by the platform and should **not** be added.

- [ ] **Step 2: Add every genuinely-missing var to `.env.example`**

Add each with an empty value and a one-line comment saying what it's for and whether it's required or optional. **Never commit a real value** — `.env.local` is correctly gitignored, keep it that way.

- [ ] **Step 3: Make a missing Zoho secret fail loudly instead of opaquely**

`lib/zoho.ts:38-40` uses non-null `!` on all three Zoho secrets, so a missing one surfaces as an unexplained OAuth failure at runtime. Replace with an explicit check that throws a named error identifying which var is absent.

- [ ] **Step 4: Verify**

```bash
comm -23 /tmp/used.txt /tmp/declared.txt   # re-run after editing
```
Expected: only platform-injected vars remain.

- [ ] **Step 5: Commit**

```bash
git add .env.example lib/zoho.ts
git commit -m "docs(env): declare the 10 env vars the code reads but .env.example omitted

A fresh clone or new Vercel environment could not be configured from the repo
alone. Also replaces non-null assertions on the Zoho secrets with an explicit
check so a missing one names itself instead of failing as an opaque OAuth error."
```

---

## Phase 1 — SEO & attribution correctness

Two independent defects on the surface the whole business migration depends on.

### Task 1.1: Preserve query strings across all legacy 301s

**Problem:** `new URL(path, req.url)` takes only the **origin** from the base — never `search`. So every legacy redirect drops `?utm_*` and `?gclid`. On a site inheriting a 7,000-URL indexed WordPress surface, every redirected ad click loses Google Ads conversion attribution.

Failing input: `GET /mumbai/samsung-qb43c/?utm_source=google&gclid=abc`
→ actual: `301 → /products/samsung-signage-qbc` (no query)
→ expected: `301 → /products/samsung-signage-qbc?utm_source=google&gclid=abc`

**Files:**
- Modify: `middleware.ts` (5 redirect sites: lines ~48, ~58, ~63, ~71, ~76)
- Create: `middleware.test.ts`

**Interfaces:**
- Produces: `function redirectTo(req: NextRequest, pathname: string): NextResponse` — a single helper all five call sites use. Exported so the test can drive it.

- [ ] **Step 1: Read the file first**

Read `middleware.ts` in full before editing. There are five distinct redirect branches and a `RESERVED_ROOTS` guard that provides loop-safety — do not disturb either. Confirm the exact current shape of each `NextResponse.redirect(new URL(...))` call.

- [ ] **Step 2: Write the failing test**

Create `middleware.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { redirectTo } from "./middleware";

describe("redirectTo", () => {
  it("preserves the query string on redirect", () => {
    const req = new NextRequest(
      "https://www.aplustechsol.com/mumbai/samsung-qb43c/?utm_source=google&gclid=abc"
    );
    const res = redirectTo(req, "/products/samsung-signage-qbc");
    const loc = new URL(res.headers.get("location")!);

    expect(loc.pathname).toBe("/products/samsung-signage-qbc");
    expect(loc.searchParams.get("utm_source")).toBe("google");
    expect(loc.searchParams.get("gclid")).toBe("abc");
  });

  it("produces a bare path when there is no query string", () => {
    const req = new NextRequest("https://www.aplustechsol.com/mumbai/samsung-qb43c/");
    const res = redirectTo(req, "/products/samsung-signage-qbc");
    const loc = new URL(res.headers.get("location")!);

    expect(loc.pathname).toBe("/products/samsung-signage-qbc");
    expect(loc.search).toBe("");
  });

  it("issues a permanent (301) redirect", () => {
    const req = new NextRequest("https://www.aplustechsol.com/old");
    const res = redirectTo(req, "/new");
    expect(res.status).toBe(301);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

```bash
npx vitest run middleware.test.ts
```
Expected: FAIL — `redirectTo` is not exported / not defined.

- [ ] **Step 4: Add the helper and route all five call sites through it**

Add near the top of `middleware.ts` (after the imports):

```ts
/**
 * Build a 301 to `pathname` on the same origin, carrying the original query
 * string across. `new URL(pathname, req.url)` takes only the ORIGIN from the
 * base — the search params are dropped — which silently destroyed utm_* and
 * gclid on every legacy redirect. Attribution for paid traffic depends on this.
 */
export function redirectTo(req: NextRequest, pathname: string) {
  const to = new URL(pathname, req.url);
  to.search = req.nextUrl.search;
  return NextResponse.redirect(to, 301);
}
```

Then replace each of the five `NextResponse.redirect(new URL(<path>, req.url), 301)` call sites with `redirectTo(req, <path>)`. Preserve each branch's existing status code if any of them deliberately differ from 301 — check before assuming.

- [ ] **Step 5: Run the tests**

```bash
npx vitest run middleware.test.ts
npm test
```
Expected: new tests PASS; the existing `lib/redirects.test.ts` suite still passes.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts middleware.test.ts
git commit -m "fix(seo): preserve query strings across legacy 301 redirects

new URL(path, req.url) inherits only the origin, so every legacy redirect
dropped utm_* and gclid — breaking Google Ads conversion attribution on the
entire migrated WordPress URL surface."
```

### Task 1.2: Fix the category OG image 404

**Problem:** `app/categories/[slug]/opengraph-image.tsx` exports `generateImageMetadata` returning `id: "og"`, so Next mounts the route **with an id segment**. Confirmed from the build manifest:

```
"/categories/[slug]/opengraph-image/[__metadata_id__]/route"   ← needs /og
"/solutions/[industry]/opengraph-image/route"                  ← no id, correct
```

But `app/categories/[slug]/page.tsx` hardcodes `/categories/${slug}/opengraph-image` (no `/og`) in **four** places — lines 58, 64, 100, 106. Result: no preview card on LinkedIn / WhatsApp / X for any category page.

**Files:**
- Modify: `app/categories/[slug]/page.tsx` (lines 58, 64, 100, 106)

- [ ] **Step 1: Remove the four hardcoded overrides**

Delete the `images:` key from both `openGraph` blocks (lines 58, 100) and both `twitter` blocks (lines 64, 106). Next's file-convention metadata then injects the **correct** URL automatically, including the `/og` segment and its cache-busting hash — which is why hardcoding was wrong in the first place.

Do not hand-write `/og` instead. The generated URL carries a content hash; hardcoding it re-introduces the same drift.

- [ ] **Step 2: Verify against a real build**

```bash
npm run build
npx next start
```
Then fetch a category page and check the emitted tag:

```bash
curl -s http://localhost:3000/categories/digital-signage | grep -o '<meta property="og:image"[^>]*>'
```
Expected: a URL containing `/categories/digital-signage/opengraph-image/og`. Then confirm it actually resolves:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "<the url from above>"
```
Expected: `200` (it was 404 before this fix).

- [ ] **Step 3: Commit**

```bash
git add app/categories/[slug]/page.tsx
git commit -m "fix(seo): stop hardcoding category OG image URLs that 404

generateImageMetadata mounts the route as .../opengraph-image/[id], so the
hardcoded .../opengraph-image URL 404'd. Letting the file convention emit the
URL restores social preview cards on every category page."
```

### Task 1.3: Resolve the product OG contradiction

**Problem:** `app/products/[slug]/page.tsx:82-84` and `:90` override `openGraph.images` / `twitter.images` with `product.images[0]`. An explicit `images` **suppresses the file convention**, so `app/products/[slug]/opengraph-image.tsx` — with its `ogBadgeLabel` / `ogAltFor` design work — is built and reachable but **never referenced by anything**. It also declares `width: 1200, height: 630` on a raw product photo that is not that aspect ratio, so crawlers crop/letterbox it.

**This task needs a decision before code.** Pick one:

- **Option A (recommended):** delete the override so the designed 1200×630 card is used. Consistent with categories after Task 1.2, and the badge/alt logic starts earning its keep.
- **Option B:** delete `app/products/[slug]/opengraph-image.tsx` (+ its `ogBadge.ts` / `ogAlt.ts` helpers if unused elsewhere) and fix the declared dimensions on the product photo.

**Files (Option A):**
- Modify: `app/products/[slug]/page.tsx:82-84, 90`

- [ ] **Step 1: Confirm the helpers aren't used elsewhere before deleting anything**

```bash
grep -rn "ogBadgeLabel\|ogAltFor" app/ components/ lib/
```

- [ ] **Step 2: Apply the chosen option**

For Option A: remove the `images:` keys from the `openGraph` and `twitter` blocks, exactly as in Task 1.2.

- [ ] **Step 3: Verify**

```bash
npm run build && npx next start
curl -s http://localhost:3000/products/samsung-qet-series | grep -o '<meta property="og:image"[^>]*>'
```
Expected (Option A): a URL under `/products/samsung-qet-series/opengraph-image/og` returning 200.

- [ ] **Step 4: Commit**

```bash
git add app/products/[slug]/page.tsx
git commit -m "fix(seo): use the generated product OG card instead of a raw product photo"
```

---

## Phase 2 — Mobile LCP

Directly serves the open goal: mobile LCP 3.5s → <2.5s (PSI 87 → 90+). Measure before and after using the Lighthouse/PSI recipe already documented in the project notes.

### Task 2.1: Stop shipping the 187 KB catalog in every client bundle

**Problem:** `context/ComparisonContext.tsx:4` does a **value** import of `products` (`data/products.ts`, 187,446 bytes / 3,691 lines) and `ComparisonProvider` is mounted in the root layout (`app/layout.tsx:132`). So the full catalog is in the client module graph on **every route** — `/contact`, `/privacy`, `/blogs` included. It is used only for id validation and a lookup.

The same runtime import repeats in `ProductCatalogSection.tsx`, `ProductFinderSection.tsx`, `RecentlyViewed.tsx`, `ProductMarquee.tsx`, and `app/compare/page.tsx` (via `lib/showcaseProducts.ts`, which is `products.filter(...)` at module scope). `QuoteContext.tsx`, `ProductCard.tsx` and `ProductsClientShell.tsx` already do this correctly with `import type`.

**This is the single biggest LCP lever available** — larger than the font/preconnect tuning already shipped.

**Files:**
- Create: `data/productIndex.ts`
- Modify: `context/ComparisonContext.tsx`
- Test: `data/productIndex.test.ts`

**Interfaces:**
- Produces: `export const productIndex: Record<string, ProductSummary>` and `export type ProductSummary = { id: string; name: string; images: string[] }` — a minimal projection. Confirm the exact field set by reading what `ComparisonContext` and `ComparisonFloatingBar` actually render before finalizing.

- [ ] **Step 1: Establish the baseline**

```bash
ANALYZE=true npm run build
```
Record the shared/first-load JS for `/contact` (a route with no product UI at all). This is the number the task must move.

- [ ] **Step 2: Determine the true minimal field set**

Read `context/ComparisonContext.tsx` and `components/ComparisonFloatingBar.tsx`. List every field read off a product. Do not guess — the projection must contain exactly those fields and no more.

- [ ] **Step 3: Write the failing test**

Create `data/productIndex.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { products } from "./products";
import { productIndex } from "./productIndex";

describe("productIndex", () => {
  it("contains an entry for every catalog product", () => {
    expect(Object.keys(productIndex).length).toBe(products.length);
    for (const p of products) {
      expect(productIndex[p.id]).toBeDefined();
    }
  });

  it("carries the fields the comparison UI renders", () => {
    const sample = productIndex[products[0].id];
    expect(sample.id).toBe(products[0].id);
    expect(sample.name).toBe(products[0].name);
    expect(Array.isArray(sample.images)).toBe(true);
  });

  it("stays a projection — it must not carry the heavy prose fields", () => {
    const sample = productIndex[products[0].id] as Record<string, unknown>;
    expect(sample.longDescription).toBeUndefined();
    expect(sample.specGroups).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run it and confirm it fails**

```bash
npx vitest run data/productIndex.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 5: Implement the projection**

Create `data/productIndex.ts`. Build it from `products` at module scope, exporting only the projected shape. Adjust the fields to match what Step 2 found.

- [ ] **Step 6: Switch ComparisonContext to the projection**

In `context/ComparisonContext.tsx`, replace `import { Product, products } from "@/data/products"` with `import type { ... }` + `import { productIndex } from "@/data/productIndex"`, and rewrite the `validIds` / `canonical` lookups against `productIndex`.

**Verify the value import is actually gone** — a lingering `import type` is fine (erased at compile time), a value import is not:

```bash
grep -n 'from "@/data/products"' context/ComparisonContext.tsx
```
Expected: either no match, or a line beginning `import type`.

- [ ] **Step 7: Re-measure**

```bash
npm test
ANALYZE=true npm run build
```
Expected: tests pass; first-load JS for `/contact` drops materially versus the Step 1 baseline. **Record both numbers in the commit message** — this is the evidence the fix worked.

- [ ] **Step 8: Commit**

```bash
git add data/productIndex.ts data/productIndex.test.ts context/ComparisonContext.tsx
git commit -m "perf(lcp): drop the full catalog from the global client bundle

ComparisonProvider is mounted in the root layout and value-imported all 3,691
lines of data/products.ts, so every route — /contact, /privacy, /blogs — parsed
the whole catalog client-side. It only needs id validation and a small lookup.

First-load JS for /contact: <before> -> <after>"
```

- [ ] **Step 9 (follow-up, separate commit): apply the same treatment to the other value importers**

`ProductCatalogSection.tsx`, `ProductFinderSection.tsx`, `RecentlyViewed.tsx`, and `lib/showcaseProducts.ts` each pull the full catalog into client bundles. Migrate them one at a time, re-measuring after each — these are route-scoped rather than global, so the win is smaller but real.

### Task 2.2: Remove `priority` from below-the-fold product images

**Problem:** `components/ProductCatalogSection.tsx:126` sets `priority={index < 2}`, but that section is the **fourth** on the homepage (`app/page.tsx:38`, after Hero, CategoryGrid, ClientLogoStrip) — never in the initial viewport. `next/dynamic` without `ssr:false` still server-renders it, so the preload lands in the initial HTML. Compounded by Task 2.3 (children render twice), this produces **four** `fetchpriority="high"` eager images competing with the hero paint and the font load.

`components/ProductGallery.tsx:137` is a **correct** use of `priority` (product detail page, above fold) — leave it alone.

**Files:**
- Modify: `components/ProductCatalogSection.tsx:126`

- [ ] **Step 1: Delete the `priority` prop entirely** from the `<Image>` in `ProductCatalogSection`.

- [ ] **Step 2: Verify no high-priority preloads remain for that section**

```bash
npm run build && npx next start
curl -s http://localhost:3000/ | grep -o 'fetchpriority="high"' | wc -l
```
Expected: the count drops by 4. The remaining high-priority preload(s) should belong to the hero only.

- [ ] **Step 3: Commit**

```bash
git add components/ProductCatalogSection.tsx
git commit -m "perf(lcp): drop priority from below-fold catalog images

ProductCatalogSection is the 4th homepage section and never in the initial
viewport; its priority preloads were competing with the hero LCP paint."
```

### Task 2.3: Stop rendering carousel children twice (and `CategoryGrid` three times)

**Problem:** `components/MobileProductScroller.tsx:139-148` and `:163` always emit **both** a mobile rail and a desktop grid, CSS-hiding one. `components/sections/CategoryGrid.tsx:194-216` then wraps that in an `md:hidden` div **and** renders its own `hidden md:grid` copy — so MPS's internal grid (`hidden md:grid` inside an `md:hidden` parent) is dead at every breakpoint. `CategoryGrid` renders 7 tiles × 3 = 21 subtrees, a third permanently invisible.

Used on the homepage (×3), `/products/[slug]`, and `/solutions/[industry]`.

**Files:**
- Modify: `components/MobileProductScroller.tsx`, `components/sections/CategoryGrid.tsx`

- [ ] **Step 1: Add a `renderGrid` escape hatch**

Give `MobileProductScroller` a `renderGrid?: boolean` prop defaulting to `true`, and skip the internal desktop grid branch when it is `false`.

- [ ] **Step 2: Use it from `CategoryGrid`**

Pass `renderGrid={false}` at `CategoryGrid.tsx:194-216`, since `CategoryGrid` supplies its own desktop grid.

- [ ] **Step 3: Verify the DOM shrank and both breakpoints still render correctly**

```bash
npm run build && npx next start
curl -s http://localhost:3000/ | grep -c 'data-category-tile'   # or whatever stable marker the tiles carry
```
Expected: count drops by ~7. Then load `/` in a browser at 375px and at 1280px and confirm the category tiles still appear correctly at both.

- [ ] **Step 4: Commit**

```bash
git add components/MobileProductScroller.tsx components/sections/CategoryGrid.tsx
git commit -m "perf: stop rendering CategoryGrid tiles three times

MobileProductScroller always emitted both a rail and a grid; CategoryGrid
wrapped that in md:hidden while supplying its own grid, leaving a third of the
subtrees dead at every breakpoint."
```

**Longer-term (not this task):** render one tree and switch `grid` → `flex` at the breakpoint in CSS, rather than two React subtrees.

---

## Phase 3 — Accessibility

Small diffs, disproportionate impact. The codebase already knows the right patterns — it applies them unevenly.

### Task 3.1: `inert` on hidden floating controls

**Problem:** `components/BackToTop.tsx:25` and `components/CookieConsent.tsx:40` set `aria-hidden={!visible}` while remaining in the tab order — `opacity` and `pointer-events` do not remove focusability. Keyboard users tab into 1 invisible button + 4 invisible cookie-banner controls that screen readers refuse to announce. This is the axe rule `aria-hidden-focus`, and it fires on **every page**.

`components/ComparisonFloatingBar.tsx:26` is the correct reference implementation: `inert={!visible} aria-hidden={!visible}`.

**Files:**
- Modify: `components/BackToTop.tsx:25`, `components/CookieConsent.tsx:40`

- [ ] **Step 1:** Add `inert={!visible}` alongside the existing `aria-hidden={!visible}` on both, matching `ComparisonFloatingBar`.

- [ ] **Step 2: Verify by keyboard**

Load any page, press Tab repeatedly from the top with the cookie banner dismissed and the page scrolled to top. Focus must never land on an invisible control.

- [ ] **Step 3: Commit**

```bash
git add components/BackToTop.tsx components/CookieConsent.tsx
git commit -m "fix(a11y): make hidden floating controls inert

aria-hidden alone left BackToTop and the cookie banner's four controls in the
tab order, so keyboard focus landed on elements screen readers refuse to
announce. Matches the existing ComparisonFloatingBar pattern."
```

### Task 3.2: Announce incoming chat messages, and manage dialog focus

**Problem:** the chat widget's entire value is realtime message delivery, and it announces **nothing** to assistive tech. No `aria-live` on either thread (`components/chat/LiveChat.tsx:189`, `components/admin/chat/ChatThread.tsx:140`). The launcher's unread badge is `aria-hidden` (`components/chat/ChatLauncher.tsx:49, 65-72`), so the second signal is muted too. And `components/chat/ChatPanel.tsx:64-97` never moves focus into the dialog on open nor restores it on close — Escape-to-close is the only keyboard affordance, and closing drops focus to `<body>`.

**Files:**
- Modify: `components/chat/LiveChat.tsx:189`, `components/admin/chat/ChatThread.tsx:140`, `components/chat/ChatLauncher.tsx:49`, `components/chat/ChatPanel.tsx:64-97`

- [ ] **Step 1: Add live regions to both thread containers**

```tsx
<div
  role="log"
  aria-live="polite"
  aria-relevant="additions"
  className="flex-1 overflow-y-auto p-4 space-y-3"
>
```
Keep it `polite` — `assertive` would interrupt a user mid-compose.

- [ ] **Step 2: Put the unread count in the launcher's accessible name**

```tsx
aria-label={
  isOpen
    ? "Close chat"
    : unread > 0
      ? `Open chat, ${unread} new ${unread === 1 ? "message" : "messages"}`
      : "Open chat"
}
```

- [ ] **Step 3: Move focus in on open, restore it on close**

In `ChatPanel`, capture `document.activeElement` when `isOpen` flips true, focus the panel container (give it `tabIndex={-1}` and a ref), and `.focus()` the stored element in the effect cleanup. Keep the existing Escape handler. `aria-modal="false"` is a defensible choice for a non-blocking chat widget — keep it, but a non-modal dialog still needs explicit focus entry and return.

- [ ] **Step 4: Verify with a screen reader**

With VoiceOver or NVDA: open the chat by keyboard, confirm focus lands inside the panel; have a message arrive and confirm it is announced; close and confirm focus returns to the launcher.

- [ ] **Step 5: Commit**

```bash
git add components/chat/ components/admin/chat/ChatThread.tsx
git commit -m "fix(a11y): announce chat messages and manage dialog focus

The widget's whole value is realtime delivery, but neither thread had a live
region and the unread badge was aria-hidden — so a screen-reader user got no
signal at all that an agent had replied."
```

### Task 3.3: Structural a11y — landmarks, headings, duplicate ids

Three independent quick fixes; one commit each is fine.

- [ ] **Nested `<main>` landmarks.** `app/layout.tsx:136` renders `<main id="main-content">` around `{children}`, and each page's root is *also* a `<main>` — `app/page.tsx:33`, `app/about/page.tsx:124`, `app/contact/page.tsx:155`, `app/products/[slug]/page.tsx:140`, `app/categories/[slug]/page.tsx:152`, `app/solutions/**`, `app/privacy`, `app/terms`, `app/not-found.tsx`. Change the **page-level** roots to `<div>`; keep the layout's `<main>` (it owns the skip-link target).

- [ ] **`/product-finder` has no `<h1>`.** `app/product-finder/page.tsx:28-34` renders only `<ProductFinderSection />`, whose top heading is an `<h2>` (`components/ProductFinderSection.tsx:264`). Add a `headingLevel` prop so the section renders `h1` when it owns the page and `h2` when embedded. This is both an a11y failure and a self-inflicted SEO gap on a canonical, sitemap-listed page.

- [ ] **Duplicate DOM id `mobile-scroller-track`.** `components/MobileProductScroller.tsx:131` hardcodes the id, and `:118`/`:154` point `aria-controls` at it — but the homepage mounts three instances and `/products/[slug]` mounts two. `aria-controls` resolves to the first match, so arrows in any rail point screen readers at `CategoryGrid`'s track. Replace with `const trackId = useId()` and add a `label` prop so each rail gets a distinct `aria-label` ("Category carousel", "Featured products carousel") instead of three identical "Product carousel" regions.

- [ ] **Unlabelled icon button.** `components/ComparisonFloatingBar.tsx:73-78` — add ``aria-label={`Remove ${p.name} from comparison`}`` and `aria-hidden="true"` on the `<X>`. Every equivalent button elsewhere is already labelled correctly.

---

## Phase 4 — Logic bugs (TDD)

Both bugs below sit in branches with **zero** test coverage. Write the test first — that is the point of this phase.

### Task 4.1: Fix the brightness filter

**Problem:** `lib/productFilters.ts:55,61` — `parseBrightnessNit` has two defects, and `applyFilters`' brightness branch has no tests at all.

1. **`cd/m²` is not recognized.** The gate is `isNitLike = /nit/i.test(b) || /^\s*[\d,]+\s*$/.test(b)`. `cd/m²` is the same unit as nit but matches neither → returns `null` → line 84 `if (nit === null) return false` → the product is excluded from **every** band. Live casualties: `samsung-interactive-wafx-p` (`"450 cd/m²"`, `data/products.ts:2563`) and `samsung-interactive-wac` (`"400 cd/m²"`).

2. **Multi-value specs average in the screen-size digits.** For >1 numeric token it returns `round((first + last) / 2)`, but the trailing number is an inch diagonal in parentheses. `samsung-qbc-t` / `samsung-small-qbc`: `"500 nit (13\") / 250 nit (24\")"` → tokens `["500","13","250","24"]` → `round((500+24)/2) = 262` → files a 500-nit panel under "Under 350 nit". `samsung-touch-qmr-t`: `"300 nit (32\") / up to 500 nit (43\", 55\", w/o glass)"` → `round((300+55)/2) = 178`.

**Files:**
- Modify: `lib/productFilters.ts:55,61`
- Test: `lib/productFilters.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `lib/productFilters.test.ts`:

```ts
describe("parseBrightnessNit", () => {
  it("treats cd/m² as nits", () => {
    expect(parseBrightnessNit("450 cd/m²")).toBe(450);
    expect(parseBrightnessNit("400 cd/m2")).toBe(400);
  });

  it("ignores inch diagonals in parenthesised multi-value specs", () => {
    expect(parseBrightnessNit('500 nit (13") / 250 nit (24")')).toBe(375);
    expect(parseBrightnessNit('300 nit (32") / up to 500 nit (43", 55", w/o glass)')).toBe(400);
  });

  it("still handles the simple cases", () => {
    expect(parseBrightnessNit("500 nit")).toBe(500);
    expect(parseBrightnessNit("700")).toBe(700);
    expect(parseBrightnessNit("")).toBeNull();
    expect(parseBrightnessNit("N/A")).toBeNull();
  });
});
```

Note the expectations: multi-value averages the **nit values only** (500+250)/2 = 375, (300+500)/2 = 400 — not the inch numbers. If you prefer max-of-nits semantics, change the implementation *and* these expectations together, deliberately.

- [ ] **Step 2: Export `parseBrightnessNit` if it isn't already, run the tests, confirm they fail**

```bash
npx vitest run lib/productFilters.test.ts
```
Expected: FAIL on the `cd/m²` and multi-value cases.

- [ ] **Step 3: Rewrite the parser**

Extract only numbers that immediately precede a unit token, then average those:

```ts
const NIT_VALUE = /([\d,]+)\s*(?:nit|cd\s*\/?\s*m)/gi;

function parseBrightnessNit(b: string | undefined): number | null {
  if (!b) return null;
  const values = [...b.matchAll(NIT_VALUE)].map((m) => Number(m[1].replace(/,/g, "")));
  if (values.length === 0) {
    // A bare number with no unit is still a nit figure (legacy data shape).
    const bare = /^\s*([\d,]+)\s*$/.exec(b);
    return bare ? Number(bare[1].replace(/,/g, "")) : null;
  }
  if (values.length === 1) return values[0];
  return Math.round((Math.min(...values) + Math.max(...values)) / 2);
}
```

- [ ] **Step 4: Run the tests**

```bash
npx vitest run lib/productFilters.test.ts
npm test
```
Expected: all PASS.

- [ ] **Step 5: Add the missing coverage while you're here**

The resolution filter, the operation filter, `countActive`, and multi-facet AND semantics all have **zero** tests. Add at least one test per branch — this is the file where both live bugs hid.

- [ ] **Step 6: Verify against the real catalog**

Add a test asserting `samsung-interactive-wafx-p` appears in the `"350–500 nit"` band and `samsung-qbc-t` appears in `"500–700 nit"`, driving `applyFilters` against the real `products` array. This is the regression guard that matters.

- [ ] **Step 7: Commit**

```bash
git add lib/productFilters.ts lib/productFilters.test.ts
git commit -m "fix(catalog): correct brightness parsing for cd/m² and multi-value specs

parseBrightnessNit rejected cd/m² outright (excluding those products from every
brightness band) and averaged parenthesised inch diagonals in as if they were
nit values, filing a 500-nit panel under 'Under 350 nit'. Both bugs sat in a
branch with no test coverage."
```

### Task 4.2: Fix phone validation

**Problem:** `lib/formSchemas.ts:4` — `/^[+]?[\d\s()-]{8,18}$/`. The comment claims "8–18 digits" but the quantifier covers a class including space, `(`, `)`, `-`. So `"--------"` and `"(  )  -  "` **pass**, while a valid 16-digit international number with spaces (`"912 345 6789 012 345"`) is **rejected**. Garbage then reaches `buildZohoLead`, and `normalizeE164` returns `null`, so the sales console's WhatsApp button silently disappears on that lead.

**Files:**
- Modify: `lib/formSchemas.ts:4`
- Create: `lib/formSchemas.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { contactSchema } from "./formSchemas"; // confirm the real export name first

const phone = (v: string) => contactSchema.shape.phone.safeParse(v).success;

describe("phone validation", () => {
  it("rejects input with no digits", () => {
    expect(phone("--------")).toBe(false);
    expect(phone("(  )  -  ")).toBe(false);
  });

  it("accepts real Indian and international numbers", () => {
    expect(phone("9876543210")).toBe(true);
    expect(phone("+91 98765 43210")).toBe(true);
    expect(phone("+1 (555) 123-4567")).toBe(true);
  });

  it("rejects too-few and too-many digits", () => {
    expect(phone("12345")).toBe(false);
    expect(phone("1234567890123456789")).toBe(false);
  });
});
```

- [ ] **Step 2: Run it, confirm the no-digits cases fail**

```bash
npx vitest run lib/formSchemas.test.ts
```

- [ ] **Step 3: Validate on stripped digits instead of raw length**

```ts
phone: z
  .string()
  .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number")
  .refine((v) => {
    const digits = v.match(/\d/g)?.length ?? 0;
    return digits >= 8 && digits <= 15; // E.164 max is 15
  }, "Enter a valid phone number"),
```

- [ ] **Step 4: Run tests, then commit**

```bash
npx vitest run lib/formSchemas.test.ts && npm test
git add lib/formSchemas.ts lib/formSchemas.test.ts
git commit -m "fix(forms): validate phone on digit count, not raw string length

The old pattern counted separators, so '--------' passed while a valid 16-digit
international number was rejected."
```

---

## Phase 5 — Chat realtime robustness

All four are real but none is user-visible on the happy path. Batch them.

- [ ] **`conversationIdRef` is never reset on a uid change** — `lib/chat/useConversation.ts:153-182`, guard at `:170`. The effect is keyed on `[uid]`, but neither the ref nor `conversationId`/`messages` clears when uid transitions A→B. The resume flow (`:106`, `signInWithCustomToken`) is exactly such a transition. Consequence: a returning visitor clicking an emailed resume link **after the agent closed the thread** gets a frozen, unusable thread with no error — because `LiveChat.tsx:100` only shows the error screen when `!conversationId`. Fix: store `{ uid, id }` in the ref and treat a uid mismatch as "no id held", or clear the ref in the auth effect at `:115`.

- [ ] **Visitor heartbeat pins to the first uid** — `lib/chat/useVisitorHeartbeat.ts:49-80`, specifically `:53`/`:55`. `if (!user || cancelled || timer) return;` swallows genuine uid changes, so `beat()` keeps writing to the old `visitors/{anonUid}`; the rules require `request.auth.uid == visitorId`, so every write is denied and swallowed by the `.catch(() => {})` at `:71`. Consequence: after a resume, the agent console shows an actively-typing customer as "Left 12 minutes ago". Fix: track `beatingUid`, tear down and re-arm when it changes.

- [ ] **`useThread`'s three listeners have no error callback** — `lib/chat/useInbox.ts:108-110, 112-123, 134-146`. Compare `useInbox:66-69`, which does surface errors. If an agent's token lapses or the `agent` claim is revoked mid-session, the listener dies silently and the thread keeps rendering its last snapshot — the salesperson believes a live lead went quiet. Fix: add error callbacks, surface through `useThread`, render next to the existing `uploadError` banner at `ChatThread.tsx:172`.

- [ ] **`orderBy("createdAt","asc") + limit(n)` truncates from the wrong end** — `lib/chat/useConversation.ts:187-191` (`limit(200)`), `lib/chat/useInbox.ts:113-117` (`limit(300)`). Ascending + `limit` selects the **oldest** n. Once a thread crosses the cap it is pinned to messages 1–n and stops updating **forever**, both sides, with no error. Fix: `limitToLast(n)` with the existing ascending `orderBy`.

- [ ] **Enter in the admin link-picker sends the draft** — `components/admin/chat/ChatThread.tsx:177-183` + `components/admin/chat/LinkPicker.tsx:41-48`. The search input is a descendant of the composer `<form>`, which has a submit button, so HTML implicit submission fires `handleSend`. An agent typing "QB65" into the picker sends their half-written draft to the customer. Fix: `onKeyDown` preventing default on Enter (and closing on Escape — outside-click/Escape dismissal is missing from the popover too).

---

## Backlog — verified, lower priority

Not worth a task each; fix opportunistically. All verified against source.

**Correctness**
- `lib/vcSpecLabels.ts:24,27` keys category identity off the display **name** while `categoryBrand.ts:37,49`, `categoryFaq.ts:38,42` and `jsonLd.ts:157` key off the slug **id**. A rename silently reverts VC/Software spec labels to Samsung defaults. Unify on ids.
- `lib/jsonLd.ts:186,194,199-200,234` — `solutionServiceLd` / `industryCategoryServiceLd` hardcode "Samsung". Inert today (verified: no VC entry in `data/solutions.ts` or `data/useCaseCombos.ts`), but `combo.category` is typed `CategorySlug`, so one VC combo emits `"Samsung Video Conferencing"` into structured data — the exact claim everything else was refactored to prevent. Route through `brandOf`/`categoryBrand` and add the banned-wording assertion these two builders lack.
- `lib/jsonLd.ts:105-109` — `productLd` drops `additionalSpecs` when `specGroups` exists; `lib/pdf/specSheet.ts:408-427` merges them. Inert (all 53 products have `specGroups`, none have `additionalSpecs`) — which also makes the field and both fallback branches dead code.
- Three size-range formatters render differently for the same input: `lib/formatSize.ts:37` (`43″ – 82″`), `lib/productSku.ts:16` (`43–82″`), `lib/categoryFaq.ts:18` (`43″ to 75″`) — and `productFilters.parseMaxSize:66` uses `parseInt` while the others use `parseFloat`, so `"21.5"` buckets as 21 but renders `21.5″`.
- `lib/pdf/helpers.ts:221,228` — `safe()` keeps U+0080–U+009F, which WinAnsi cannot encode, so a spec value containing U+0085 (common in spreadsheet paste) throws and aborts PDF generation. The doc comment claims it "can never crash generation".
- `lib/whatsapp.ts:85-93` — `normalizeE164("93105099099")` (11 digits, no `+`) returns `+93105099099` (Afghanistan) instead of `null`.
- `lib/whatsapp.ts:21` — product message leaks the raw slug: `/products/samsung-qet-series/` → "the samsung qet series/ and".
- `lib/searchResults.ts:66` — `excerpt.slice(0,90) + "…"` appends an ellipsis even when the excerpt is shorter than 90 chars.
- `components/SearchModal.tsx:71` — `e instanceof TouchEvent` throws `ReferenceError` on desktop Safari / non-touch Firefox, killing the outside-click close path. Use `"touches" in e`.
- `context/QuoteContext.tsx:50-71` — restore uses a direct `setQuoteItems(parsed)` with no `prev.length > 0` guard, unlike its sibling `ComparisonContext.tsx:59` whose comment documents exactly this hazard. Also writes a transient `"[]"` to `b2b_quote_cart` before the restore round-trips.
- `context/ComparisonContext.tsx:78-87`, `context/QuoteContext.tsx:74-93` — `setState` + `setTimeout` **inside** a state updater. Updaters must be pure; React 19 StrictMode double-invokes them. Neither timer is cleared on unmount.

**UX / perf**
- `/quote` and `/compare` flash their empty states before localStorage restores (`components/QuotePageClient.tsx:20-22`, `app/compare/page.tsx:229-230`) — reads as data loss on the two highest-intent pages. Add a `hydrated` flag and render a skeleton.
- `components/AnimatedSection.tsx:30-33` sets `opacity: 0` in an effect, i.e. *after* SSR content paints — content flashes in, blanks on hydration, fades back. Also disqualifies anything inside it as an LCP candidate. Set the initial state in CSS at render time.
- **Suspected (needs measurement):** `components/ProductCatalogSection.tsx:78` and `components/ProductsCategoryNav.tsx:75` are un-gated `overflow-x-auto` rails — the same class as the fixed NO_LCP bug. `MobileProductScroller` and `AutoSlider` were retrofitted with `useDeferredScroll`; these two were not. Confirm by running the Lighthouse mobile recipe against `/` with both forced to `overflow-x-clip` and comparing.
- `components/Footer.tsx:1,41-49` — 289-line client component existing solely for one `usePathname()`. Extract a ~10-line `<HomeLogoLink>` island and make the footer a server component.
- `components/Footer.tsx:258` — `new Date().getFullYear()` during client render; SSR/hydration disagree for ~5.5h each New Year.
- `components/LeadGateModal.tsx:233` vs `:282` — `aria-labelledby="lead-gate-title"` dangles in the success state (the success `<h3>` has no id), and focus is never restored on close (`:119-146`).
- `components/navbar/NavbarDesktop.tsx:77,89,137,148` — `role="menu"`/`menuitem` without APG keyboard semantics; `useDropdown:19-32` registers document listeners unconditionally rather than gating on `open`.
- `components/education/simulator/ClassroomSimulator.tsx:114-134` and `components/education/EcosystemTabs.tsx:71-95` — `role="tab"` with no tabpanels, `aria-controls`, or arrow-key navigation. Either implement it or drop to `aria-pressed` toggle buttons.
- `components/AutoSlider.tsx:37-50` re-arms its interval on every hover; `MobileProductScroller:44-47` already solved this with `pausedRef`.
- `lib/chat/useInbox.ts:38` exposes no `loading` flag, so the console flashes "No open chats." on every load (`ConversationList.tsx:15-17`).
- `components/chat/LiveChat.tsx:54-81` — pre-chat form has no in-flight latch; a double-Enter can create two conversations **and** two Zoho leads (`startConversation` at `useConversation.ts:281-331` has no idempotency key).
- `components/admin/chat/ChatThread.tsx:31-33` — `markRead` writes `unreadForAgent: 0` on every message including the agent's own, roughly doubling conversation-doc writes.
- `lib/chat/useConversation.ts:214-277` — escalation interval is torn down and re-armed on every snapshot (deps include the freshly-mapped `conversation` object and `messages` array), so the 20s cadence never completes on an active thread.
- `components/ProductsClientShell.tsx:104-110, 117-122` — internal navigation via `<a href>` instead of `<Link>`, forcing a full reload that discards quote/compare state.
- `hooks/useDeferredScroll.ts:38-39,54-59` — nested `requestAnimationFrame` handles are never cancelled in cleanup.
- `app/admin/chat/page.tsx:67-69` — `document.title` mutated with no restore.

**Dead code / hygiene**
- `components/ProductMarquee.tsx` (91 lines) has **no importer** — verified by grep. It builds `[...showcaseProducts, ...showcaseProducts]` and holds a live `useComparison()` subscription. Delete it, or note why it's retained.
- Confirmed-unused dependencies: **`clsx`** and **`tailwind-merge`** — zero imports across the entire repo (the standard `cn()` pair, never wired up). Verified still used, do **not** remove: `exceljs` (dynamic `await import()` in `app/compare/page.tsx:113`), `server-only` (side-effect imports), `pdf-lib`, `qrcode.react`, `framer-motion`, `react-markdown`, `remark-gfm`, `posthog-js`, `firebase-admin`, `sonner`, `@hookform/resolvers`.
- `components/SpecSheetButton.tsx:45` — the only removable `eslint-disable`, and its justification is backwards. The comment says "triggerPdf is a plain fn, not memoized," which is exactly *why* suppressing is wrong: `useCallback` freezes the closure. Nothing needs `handleClick` referentially stable (the `?download=spec` effect at `:54` is already ref-guarded). Drop the `useCallback` and the disable disappears.
- `data/specs/*.xlsx` — 5 files tracked in git, imported by nothing.
- `lib/showcaseProducts.ts:17` — `isShowcased` exported with no non-test consumer.
- `lib/imageAlias.ts` — only `images[0]` is ever read by the sole consumer, so ~81 of 85 alias entries are inert.
- `lib/categoryFaq.ts:57` — `count === 1 ? "series" : "series"`, a no-op ternary.
- `lib/productFilters.ts:112` — `countActive` tests `v !== 0` but values are `string | null`, so it's unreachable; meanwhile `""` counts as active.
- `lib/formatSize.ts:36-37` — `["43","43"]` renders `43″ – 82″`-style output (`43″ – 43″`) rather than collapsing to `43″`.
- `README.md` is 38 lines and materially stale — describes the site as purely a Samsung distributor, with no mention of Logitech VC, Software Solutions, Class Saathi, or live chat; documents only `npm install` / `npm run dev` (no `npm test`, no `npm run test:rules` and its JDK/emulator requirement, no env setup).

---

## Test-coverage debt

The suite is **bimodal**. The invariant-style suites (`redirects`, `showcaseProducts`, `modelCodes`, `specLayout`, `data/*`) are genuinely specification-shaped and would catch real regressions — treat them as the model. The rest need work.

**No test file at all:** `formatSize`, `formatDate` (nothing pins the UTC behaviour its docstring exists to protect), `declusterImages` (non-trivial reordering algorithm), `leadGate` (needs a jsdom pragma — `vitest.config.mts` is `environment: "node"`), `formSchemas` (fixed by Task 4.2), `pdf/quote` (718 lines, not even a smoke test), `middleware.ts` (fixed by Task 1.1), and **`data/products.ts`** — the 53-product core catalog has no duplicate-id, category-validity, or image-existence test.

**Weak coverage:** `productFilters` (resolution filter, operation filter, `countActive`, multi-facet AND — all zero; fixed by Task 4.1); `jsonLd` (2 of 9 exports; `jsonLdString`, the XSS escape, is untested, as is `breadcrumbLd`'s 1-based `position`); `zoho` (the 6-segment `description` builder, `Last_Name: "Unknown"` fallback, and `fetchWithRetry` backoff all untested); `pdf/helpers` (`safe()` and `wrapText` untested).

**Anti-patterns to fix:** `lib/pdf/helpers.test.ts:4-9` is **vacuous** — `toBeDefined()` on two constants, cannot fail meaningfully. `lib/productFilters.test.ts:12-16` mirrors the implementation (asserts `SIZE_BUCKETS.map(b => b.label)` equals the literal list). `lib/redirects.test.ts:16-19` re-declares `RESERVED_ROOTS` instead of importing it, so the loop-safety invariant can drift silently from the real one.

**Suggested first test to write** (highest value per line): a `data/products.test.ts` asserting no duplicate ids, every `product.category` resolves to a real category `name`, and every referenced image path exists on disk. All three pass today — lock them in. Note the join is by **display string** (`product.category === category.name`), so renaming a category's `name` silently orphans its products with no build error.

---

## Config debt

- **`.env.example` is missing 10 of ~22 env vars the code reads.** Absent: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (`lib/zoho.ts:38-40`), `RESEND_API_KEY` (`lib/apiErrors.ts:47`), `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CLASS_SAATHI_TO_EMAIL` (`app/api/contact/route.ts:9,13,322`), `TRUST_CF_CONNECTING_IP` (`lib/rateLimit.ts:70`), `NEXT_PUBLIC_GA_ID` (`app/layout.tsx:18`), `NEXT_PUBLIC_POSTHOG_KEY`/`NEXT_PUBLIC_POSTHOG_HOST` (`components/PostHogProvider.tsx:8,12`). Also `lib/zoho.ts:38-40` uses non-null `!` on all three Zoho secrets, so a missing one surfaces as an opaque OAuth failure instead of a clear startup error. Same class as the prior "chat backend not configured" incident.
- **No `typecheck` script.** Add `"typecheck": "tsc --noEmit"` so a lib-only change can be checked without a full `next build`.
- **No coverage config** in `vitest.config.mts` — there is currently no signal on any of the gaps above.
- **`overrides` block (`postcss`, `uuid`)** — both transitive-only; whether the pins are still needed can't be validated until Phase 0 lands. Re-check afterwards and drop if the upstream advisories are resolved.
- **tsconfig strictness gaps:** `strict: true` is on, but `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes` are all off. `noUncheckedIndexedAccess` is the relevant one — `OLD_PRODUCT_SLUG_TO_ID[last]`, `IMAGE_ALIAS[src]`, `REPRESENTATIVE_MODEL_CODE[productId]`, `sizes[sizes.length-1]` are all typed non-optional, so the compiler can't tell "handled the miss" from "forgot to". Turning it on will surface real work — do it as its own task.
- `target: "ES2017"` is old given a `.browserslistrc` floor of Chrome/Firefox/Edge 100 and Safari 15.4.

---

## Suggested order

1. **Phase 0** — you may be one cache eviction from an unbuildable deploy.
2. **Task 1.1** (query strings) — silent ad-spend attribution loss every day it ships.
3. **`.env.example`** (Config debt) — cheap, prevents the next config incident.
4. **Task 2.1** (client bundle) — biggest LCP win; measure before/after.
5. **Tasks 3.1 + 3.2** — small diffs, disproportionate a11y impact.
6. **Task 4.1** — the bug and its missing test guard together.

Phases 1–5 are independent; run them on separate branches if parallelising across sessions.
