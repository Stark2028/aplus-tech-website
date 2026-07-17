# Premium Product Card (Bezel Display + Hover Theatre) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the ProductCard image area into a thin metal-bezel "display" framing a uniform light mat with a CSS-only hover/focus theatre (glow, sheen, rim light), plus a new mono SKU line and Space Grotesk product name.

**Architecture:** All visual changes live in `components/ProductCard.tsx` (every listing inherits it). The SKU line text is pure logic extracted to `lib/productSku.ts` (TDD'd). Space Grotesk + IBM Plex Mono move from `HeroSection.tsx` into a shared `app/fonts-accent.ts` module consumed by both; the card applies `.className` directly on elements (no CSS-variable scoping).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (arbitrary values + `group-hover`/`group-focus-within`/`motion-reduce` variants), `next/font/google`, Vitest.

**Spec of record:** `docs/superpowers/specs/2026-07-17-premium-product-card-design.md`. Visual reference: `.superpowers/brainstorm/1481-1784283839/content/card-panel-choice.html`, card #3 ("SAME JPEG ON LIGHT MAT").

## Global Constraints

- Only `components/ProductCard.tsx`, `components/sections/HeroSection.tsx` (import refactor only), plus the two new files (`app/fonts-accent.ts`, `lib/productSku.ts` + test) may change. No other component changes.
- Bezel: `padding: 1.5px`, `border-radius: 8px`, margin `10px 10px 0`, background `linear-gradient(160deg, #4b5563, #182131 35%, #2a3648)`.
- Panel (light mat, strategy A): `border-radius: 6.5px`, `linear-gradient(160deg, #f6f8fb, #eef2f7 60%, #f2f5fa)`. Keep `mix-blend-multiply` on the image wrapper. Image box height stays `h-[170px]`.
- Hover theatre values: glow `radial-gradient(closest-side, rgba(37,99,235,0.16), transparent 70%)` @ 500ms; sheen band `rgba(37,99,235,0.08)` @ 700ms one pass; rim `box-shadow: 0 0 30px -6px rgba(37,99,235,0.45)`.
- Every hover effect must also fire on `:focus-within` (`group-focus-within`). `prefers-reduced-motion: reduce`: no scale, no sheen, glow appears without transition (`motion-reduce` variants).
- **No availability/stock label anywhere** (user ruling). SKU content from real fields only: `series` → fallback `subCategory` → fallback `category`, plus size range from `specs.screenSizes`.
- Badge (top-left) and compare button (top-right): exact positions/z-index unchanged.
- Pure CSS effects — no new JS behavior, no new images, no new font downloads (both families already ship for the hero). GPU-friendly transition properties only (transform/opacity/box-shadow).
- Untouched: image `src`/`alt`/`sizes`, description line, specs grid, operation-rating row, price/CTA row, quote/compare logic, router behavior.
- Branch: `feat/premium-product-card` off `master`. First commit = the spec file.

---

### Task 1: Branch + commit the spec

**Files:**
- Commit (already on disk, untracked): `docs/superpowers/specs/2026-07-17-premium-product-card-design.md`
- Commit (this plan): `docs/superpowers/plans/2026-07-17-premium-product-card.md`

**Interfaces:**
- Consumes: nothing.
- Produces: branch `feat/premium-product-card` that all later tasks commit to.

- [ ] **Step 1: Create the branch from master**

Run: `git checkout -b feat/premium-product-card master`
Expected: `Switched to a new branch 'feat/premium-product-card'`

- [ ] **Step 2: Commit spec + plan**

```bash
git add docs/superpowers/specs/2026-07-17-premium-product-card-design.md docs/superpowers/plans/2026-07-17-premium-product-card.md
git commit -m "docs(spec): premium product card - bezel display with hover theatre"
```

---

### Task 2: SKU line formatter (`lib/productSku.ts`)

**Files:**
- Create: `lib/productSku.ts`
- Test: `lib/productSku.test.ts`

**Interfaces:**
- Consumes: `Product` from `@/data/products` (fields: `series: string`, `subCategory?: string`, `category: string`, `specs.screenSizes: string[]`).
- Produces: `formatSkuLine(product: Product): string` — e.g. `"QET SERIES · 43–82″"`. Task 4 imports exactly this name from `@/lib/productSku`.

Data facts (verified in spec §3): `series` values already include the word "Series" (e.g. `"QET Series"`); `screenSizes` entries are numeric strings (`"43"`, `"21.5"`) or non-numeric (`"Custom"`).

- [ ] **Step 1: Write the failing test**

Create `lib/productSku.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatSkuLine } from "./productSku";
import { Product } from "@/data/products";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: "test-product",
    name: "Test Product",
    category: "Digital Signage",
    series: "QET Series",
    description: "",
    features: [],
    specs: {
      resolution: "4K",
      brightness: "300 nit",
      screenSizes: ["43", "50", "82"],
      operationTime: "16/7",
    },
    images: [],
    ...overrides,
  };
}

describe("formatSkuLine", () => {
  it("uppercases series and shows min–max size range with en dash and double prime", () => {
    expect(formatSkuLine(makeProduct({}))).toBe("QET SERIES · 43–82″");
  });

  it("shows a single size without a range", () => {
    expect(
      formatSkuLine(makeProduct({ specs: { resolution: "4K", brightness: "700 nit", screenSizes: ["55"], operationTime: "24/7" } }))
    ).toBe("QET SERIES · 55″");
  });

  it("preserves decimal sizes", () => {
    expect(
      formatSkuLine(makeProduct({ specs: { resolution: "FHD", brightness: "250 nit", screenSizes: ["21.5", "32"], operationTime: "16/7" } }))
    ).toBe("QET SERIES · 21.5–32″");
  });

  it("omits the size segment when no numeric sizes exist", () => {
    expect(
      formatSkuLine(makeProduct({ specs: { resolution: "Custom", brightness: "n/a", screenSizes: ["Custom"], operationTime: "24/7" } }))
    ).toBe("QET SERIES");
  });

  it("falls back to subCategory then category when series is empty", () => {
    expect(formatSkuLine(makeProduct({ series: "", subCategory: "Business TV" }))).toBe("BUSINESS TV · 43–82″");
    expect(formatSkuLine(makeProduct({ series: "" }))).toBe("DIGITAL SIGNAGE · 43–82″");
  });

  it("ignores non-numeric entries mixed with numeric ones", () => {
    expect(
      formatSkuLine(makeProduct({ specs: { resolution: "4K", brightness: "300 nit", screenSizes: ["Custom", "46"], operationTime: "24/7" } }))
    ).toBe("QET SERIES · 46″");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/productSku.test.ts`
Expected: FAIL — cannot resolve `./productSku`.

- [ ] **Step 3: Write the implementation**

Create `lib/productSku.ts`:

```ts
import { Product } from "@/data/products";

/** Card SKU line, e.g. "QET SERIES · 43–82″".
 *  Label prefers series, then subCategory, then category (spec: real fields
 *  only — Product has no model-code or availability fields). Size range comes
 *  from the numeric entries of specs.screenSizes; non-numeric entries like
 *  "Custom" are ignored, and with no numeric sizes the label stands alone. */
export function formatSkuLine(product: Product): string {
  const label = (product.series || product.subCategory || product.category).toUpperCase();
  const sizes = product.specs.screenSizes
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
  if (sizes.length === 0) return label;
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  const range = min === max ? `${min}″` : `${min}–${max}″`;
  return `${label} · ${range}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/productSku.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/productSku.ts lib/productSku.test.ts
git commit -m "feat(card): SKU line formatter from series + screen-size range"
```

---

### Task 3: Shared accent-fonts module

**Files:**
- Create: `app/fonts-accent.ts`
- Modify: `components/sections/HeroSection.tsx:3-23` (imports only; Caveat stays local)

**Interfaces:**
- Consumes: nothing.
- Produces: named exports `spaceGrotesk` and `plexMono` (NextFont instances) from `@/app/fonts-accent`. Task 4 uses `spaceGrotesk.className` and `plexMono.className`; HeroSection keeps using `spaceGrotesk.variable` / `plexMono.variable`.

Constraint (spec §4): the `variable:` names `--font-display` / `--font-mono` must stay exactly as-is — the hero deliberately shadows the layout-level Plus Jakarta Sans `--font-display` inside its own subtree. Moving the instances to a shared module must not change any rendered font in the hero. The card must use `.className` only, never the variables.

- [ ] **Step 1: Create `app/fonts-accent.ts`**

```ts
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

// Shared "accent" families used by the hero (via CSS variables) and the
// product card (via .className directly on elements). --font-display here
// deliberately shadows the site-wide Plus Jakarta Sans ONLY where .variable
// is applied (the hero <section>); the card never touches the variables.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
```

- [ ] **Step 2: Point HeroSection at the shared module**

In `components/sections/HeroSection.tsx`, replace the import and the two local instances (keep Caveat exactly as-is):

```tsx
// before
import { Space_Grotesk, IBM_Plex_Mono, Caveat } from "next/font/google";
// ...
const spaceGrotesk = Space_Grotesk({ ... });   // delete
const plexMono = IBM_Plex_Mono({ ... });       // delete

// after
import { Caveat } from "next/font/google";
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
```

The `caveat` instance and the `<section className={\`${spaceGrotesk.variable} ${plexMono.variable} ${caveat.variable} ...\`}>` usage stay byte-identical.

- [ ] **Step 3: Verify types and tests**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `npm test` — expected: all suites pass (hero test `components/sections/hero/useStageChannel.test.ts` untouched and green).

- [ ] **Step 4: Commit**

```bash
git add app/fonts-accent.ts components/sections/HeroSection.tsx
git commit -m "refactor(fonts): extract Space Grotesk + IBM Plex Mono to shared app/fonts-accent"
```

---

### Task 4: ProductCard bezel display + hover theatre + text rows

**Files:**
- Modify: `components/ProductCard.tsx` (image area lines 81–113; series-chip/name block lines 117–127; imports)

**Interfaces:**
- Consumes: `formatSkuLine` from `@/lib/productSku` (Task 2); `spaceGrotesk`, `plexMono` from `@/app/fonts-accent` (Task 3).
- Produces: final card markup; nothing downstream consumes it programmatically.

Notes for the implementer:
- The card shell (`SpotlightCard ... group`) provides the `group` for `group-hover` / `group-focus-within` variants — the clickable panel is focusable (`tabIndex={0}`), and the compare button / links inside the card also trigger `focus-within`, which is intended.
- The sheen travels via `transform` (GPU-friendly), not `left`: the band is 30% of panel width, starting at `left:-45%`, so a `translate-x` of `585%` of its own width carries it fully across and off the right edge (mockup's `left:-45% → 130%` equivalent).
- The old panel's `border-b border-slate-100/50`, `bg-linear-to-b from-slate-50 to-white`, and `px-6 py-8` box are replaced by the frame + mat; panel keeps `h-64` outer height so layout shift is only the uniform ~11.5px of margin+bezel.
- The series chip (`inline-flex ... {product.series}` badge row) is REPLACED by the SKU line — the mockup of record shows SKU + name with no chip, and the SKU line already carries the series.

- [ ] **Step 1: Update imports**

At the top of `components/ProductCard.tsx` add:

```tsx
import { formatSkuLine } from "@/lib/productSku";
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
```

- [ ] **Step 2: Replace the image area (current lines 81–113) with the bezel display**

```tsx
      {/* Bezel display (spec 2026-07-17): thin metal-gradient frame around a
          uniform light mat. Light mat — not the dark "display" panel — because
          27 of 50 primary images are opaque white JPEGs; mix-blend-multiply
          only melts them into a light surface. */}
      <div
        className="spotlight-content relative mx-2.5 mt-2.5 rounded-lg p-[1.5px] transition-shadow duration-500 group-hover:shadow-[0_0_30px_-6px_rgba(37,99,235,0.45)] group-focus-within:shadow-[0_0_30px_-6px_rgba(37,99,235,0.45)]"
        style={{ background: "linear-gradient(160deg, #4b5563, #182131 35%, #2a3648)" }}
      >
        <div
          onClick={handleImageClick}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleImageClick();
            }
          }}
          aria-label={`View details for ${product.name}`}
          className="relative h-64 rounded-[6.5px] overflow-hidden flex items-center justify-center cursor-pointer px-6 py-8 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
          style={{ background: "linear-gradient(160deg, #f6f8fb, #eef2f7 60%, #f2f5fa)" }}
        >
          {/* Backlight glow — fades in on hover/focus; under reduced motion it
              still appears, just without the transition. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[20%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
            style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.16), transparent 70%)" }}
          />

          {/* Fixed-height image box normalises display size across sources:
              some product shots fill edge-to-edge, others float with whitespace.
              Capping the height keeps every card's display visually consistent. */}
          <div className="relative w-[82%] h-[170px] mix-blend-multiply">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={`${product.name} — Samsung ${product.series} ${product.category}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-300 font-medium">
                Image unavailable
              </div>
            )}
          </div>

          {/* Sheen sweep — one pass across the panel; transform-driven so it
              stays compositor-only. Hidden under reduced motion. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-[-30%] left-[-45%] w-[30%] -skew-x-[18deg] transition-transform duration-700 ease-out group-hover:translate-x-[585%] group-focus-within:translate-x-[585%] motion-reduce:hidden"
            style={{ background: "linear-gradient(105deg, transparent, rgba(37,99,235,0.08) 50%, transparent)" }}
          />
        </div>
      </div>
```

Unchanged within this block: `onClick`/`onKeyDown`/`role`/`tabIndex`/`aria-label` semantics, `Image` `src`/`alt`/`fill`/`sizes`, `h-[170px]`, `mix-blend-multiply`. Changed: image wrapper `w-full` → `w-[82%]` (spec: photo centered ~82% of panel).

- [ ] **Step 3: Replace the series chip with the SKU line and set the name font (current lines 117–127)**

```tsx
        <div className="mb-5">
          <p className={`${plexMono.className} text-[11px] tracking-[0.12em] text-slate-500 mb-2`}>
            {formatSkuLine(product)}
          </p>
          <h3 className={`${spaceGrotesk.className} text-[1.15rem] font-bold text-slate-900 mt-1 mb-2.5 leading-snug tracking-tight line-clamp-2`}>
            <Link href={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
              {product.name}
            </Link>
          </h3>
```

The description `<p>` below the name, specs grid, operation row, and footer buttons are untouched.

- [ ] **Step 4: Type-check and test**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `npm test` — expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat(card): bezel display with light mat, hover theatre, mono SKU line"
```

---

### Task 5: Runtime verification + Lighthouse sanity

**Files:** none (verification only; fix-commits allowed if issues found).

**Interfaces:**
- Consumes: the built branch from Tasks 1–4.
- Produces: screenshot evidence + go/no-go for the finishing-a-development-branch step.

- [ ] **Step 1: Invoke the project `verify` skill** (build/launch/drive recipe). Beware the Windows orphan-server trap: after stopping a background `next` server, kill the PID on the port or stale builds poison the results.

- [ ] **Step 2: Products listing checks at 1440px and 390px**

On `/products` (or the main listing page the verify skill uses), capture screenshots for each state:
- Rest: bezel frame + light mat + SKU line render on every card; grid is uniform (no dark/light patchwork).
- Hover: glow fades in, sheen sweeps once, rim light on frame, image scales 105%, existing card lift intact.
- Focus-within: keyboard-Tab to a card's panel — same theatre as hover.
- Reduced motion (emulate `prefers-reduced-motion: reduce`): no scale, no sheen, glow present.
- 390px: rest state reads complete on its own (touch devices get no hover).

- [ ] **Step 3: Mat consistency spot-check**

Side-by-side screenshot of one alpha product (**Samsung QET Series**, alpha cut-out) and one opaque product (**Samsung Small QBC**, white-bg JPEG): both must sit on an identical-looking mat with no visible white box around the QBC image.

- [ ] **Step 4: Chrome overlay check**

Badge (top-left) and compare button (top-right) sit above the frame at their exact previous positions, legible against the mat.

- [ ] **Step 5: Lighthouse (mobile) sanity on the listing page**

Compare against master's score; expected: no measurable change (pure CSS, no new downloads). If it regresses, investigate before proceeding.

- [ ] **Step 6: Commit any fixes, then finish the branch**

```bash
git add -A && git commit -m "fix(card): runtime verification fixes"   # only if fixes were needed
```

Then use superpowers:finishing-a-development-branch to choose merge/PR/cleanup.
