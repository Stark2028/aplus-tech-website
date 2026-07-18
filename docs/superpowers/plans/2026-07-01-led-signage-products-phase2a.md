# Phase 2a — LED Signage Products + Size-Filter Buckets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the empty LED Signage category with 5 web-verified Samsung LED products (with real images), and replace the `/products` "min screen size" filter with 5 single-select size buckets (Below 43", 43"+, 55"+, 75"+, 98"+).

**Architecture:** Two independent workstreams. (1) A filter refactor: swap `Filters.minSize: number` for `Filters.sizeBucket: string | null` backed by half-open size bands, mirroring the existing `BRIGHTNESS_BANDS` pattern — pure logic, TDD with Vitest. (2) Five new product objects appended to `data/products.ts` under `category: "LED Signage"`, `catalog2026: true`, reusing existing `Product` fields (pixel pitch in `resolution`, full detail in `specGroups`), each with real Samsung images downloaded into `public/products/led-signage/<id>/`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, lucide-react. Vitest (`npm test`) for pure logic. `curl` for image downloads; WebSearch/WebFetch to resolve real image URLs.

## Global Constraints

- **No changes to `ProductCard` or the `Product` interface.** LED reuses existing fields.
- **All 5 LED products:** `category: "LED Signage"` (exact string), `catalog2026: true`, and a `subCategory` of `"The Wall"` / `"Indoor LED"` / `"All-in-One LED"`.
- **Excluded:** Onyx (ICD) and The Wall for Virtual Production (IVC).
- **Images:** real Samsung product imagery only, downloaded into `public/products/led-signage/<id>/` as `1.<ext>`, `2.<ext>`, … Target ~10 per product, **minimum 3**. `images[]` lists only files that actually downloaded, hero first. Report actual counts.
- **Size buckets (single-select, half-open [min,max)):** `Below 43"` [0,43), `43"+` [43,55), `55"+` [55,75), `75"+` [75,98), `98"+` [98,∞). Labels verbatim as the user specified.
- **The product-finder wizard** (`finderConfig.ts` `SIZE_RANGES` / `ProductFinderSection`) is OUT OF SCOPE — it has its own separate Compact/Standard/Large/Extra-Large buckets and keeps working unchanged. This plan only changes the `/products` `ProductFilterBar`.
- **Verify** from `c:\Users\samee\b2b-website` with `npm test`, `npx tsc --noEmit`, `npm run build`.

---

## Task 1: Replace the min-size filter with single-select size buckets

**Files:**
- Modify: `lib/productFilters.ts` (interface, defaults, options, filter logic)
- Create: `lib/productFilters.test.ts`
- Modify: `components/products/ProductFilterBar.tsx` (active-chip pill + chip list)

**Interfaces:**
- Produces: `Filters.sizeBucket: string | null`; `SIZE_BUCKETS: { label: string; min: number; max: number }[]`; `applyFilters` honoring `sizeBucket`. Consumed by `ProductFilterBar.tsx`.
- Removes: `Filters.minSize`, `MIN_SIZE_OPTIONS`.

- [ ] **Step 1: Write the failing test.**

Create `lib/productFilters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { Product } from "@/data/products";
import { applyFilters, DEFAULT_FILTERS, SIZE_BUCKETS } from "@/lib/productFilters";

// Minimal product with just the sizes the filter reads.
const p = (id: string, sizes: string[]): Product =>
  ({ id, specs: { resolution: "", brightness: "", operationTime: "", screenSizes: sizes } } as Product);

const withBucket = (label: string) => ({ ...DEFAULT_FILTERS, sizeBucket: label });

describe("size bucket filter", () => {
  it("exposes the five buckets in order", () => {
    expect(SIZE_BUCKETS.map((b) => b.label)).toEqual([
      "Below 43\"", "43\"+", "55\"+", "75\"+", "98\"+",
    ]);
  });

  it("'Below 43\"' matches only sizes under 43", () => {
    const out = applyFilters([p("a", ["32"]), p("b", ["43"]), p("c", ["55"])], withBucket("Below 43\""));
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });

  it("'43\"+' matches 43 to under 55 (half-open)", () => {
    const out = applyFilters([p("a", ["32"]), p("b", ["43"]), p("c", ["50"]), p("d", ["55"])], withBucket("43\"+"));
    expect(out.map((x) => x.id)).toEqual(["b", "c"]);
  });

  it("'98\"+' matches 98 and above", () => {
    const out = applyFilters([p("a", ["85"]), p("b", ["98"]), p("c", ["146"])], withBucket("98\"+"));
    expect(out.map((x) => x.id)).toEqual(["b", "c"]);
  });

  it("uses the product's LARGEST size when it lists several", () => {
    // A product offered in 43\"–85\" should satisfy 75\"+ via its 85\" option.
    const out = applyFilters([p("multi", ["43", "55", "85"])], withBucket("75\"+"));
    expect(out.map((x) => x.id)).toEqual(["multi"]);
  });

  it("excludes products with no numeric size when a bucket is set", () => {
    const out = applyFilters([p("custom", ["Custom"])], withBucket("55\"+"));
    expect(out).toEqual([]);
  });

  it("no bucket selected → size does not filter", () => {
    const items = [p("a", ["32"]), p("b", ["146"])];
    expect(applyFilters(items, DEFAULT_FILTERS)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `npm test`
Expected: FAIL — `SIZE_BUCKETS` is not exported / `sizeBucket` unknown.

- [ ] **Step 3: Update `lib/productFilters.ts`.**

Change the `Filters` interface — replace `minSize: number;` with:

```ts
  sizeBucket: string | null;
```

Change `DEFAULT_FILTERS` — replace `minSize: 0,` with:

```ts
  sizeBucket: null,
```

Replace the `MIN_SIZE_OPTIONS` export with `SIZE_BUCKETS`:

```ts
// Single-select size buckets, half-open [min, max): a boundary inch belongs to
// exactly one bucket (a 55" panel is "55\"+", not also "43\"+"). Product size is
// its LARGEST offered diagonal. Mirrors BRIGHTNESS_BANDS.
export const SIZE_BUCKETS = [
  { label: "Below 43\"", min: 0,  max: 43 },
  { label: "43\"+",      min: 43, max: 55 },
  { label: "55\"+",      min: 55, max: 75 },
  { label: "75\"+",      min: 75, max: 98 },
  { label: "98\"+",      min: 98, max: Infinity },
];
```

Replace the `filters.minSize` block in `applyFilters` (currently lines ~80-85) with:

```ts
    if (filters.sizeBucket) {
      const bucket = SIZE_BUCKETS.find((b) => b.label === filters.sizeBucket);
      if (bucket) {
        const max = parseMaxSize(p.specs.screenSizes);
        // A product with no numeric size (parseMaxSize → 0, e.g. "Custom") can't
        // satisfy a size bucket, so it's excluded when one is selected. Note
        // "Below 43\"" has min 0, so a real 0 would match — but parseMaxSize
        // returns 0 only for non-numeric sizes, which we exclude here first.
        if (max === 0) return false;
        if (max < bucket.min || max >= bucket.max) return false;
      }
    }
```

(`parseMaxSize` and `countActive` are unchanged — `countActive` already counts any non-null/non-zero value, and `sizeBucket: null` reads as inactive.)

- [ ] **Step 4: Run the test to verify it passes.**

Run: `npm test`
Expected: PASS — all size-bucket tests plus the existing comparator tests.

- [ ] **Step 5: Update `ProductFilterBar.tsx`.**

Change the import (line ~8): replace `MIN_SIZE_OPTIONS,` with `SIZE_BUCKETS,`.

Replace the active-filter pill block (currently lines ~153-156):

```tsx
            {filters.sizeBucket && (
              <ActiveChip
                label={filters.sizeBucket === "Below 43\"" ? "Below 43\"" : `${filters.sizeBucket} screens`}
                onRemove={() => setFilters((f) => ({ ...f, sizeBucket: null }))}
              />
            )}
```

Replace the `FilterGroup title="Min Screen Size"` chip list (currently lines ~212-223):

```tsx
            <FilterGroup title="Screen Size">
              {SIZE_BUCKETS.map((b) => (
                <FilterChip
                  key={b.label}
                  label={b.label}
                  active={filters.sizeBucket === b.label}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      sizeBucket: f.sizeBucket === b.label ? null : b.label,
                    }))
                  }
                />
              ))}
            </FilterGroup>
```

- [ ] **Step 6: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors. (A leftover `minSize` reference anywhere would fail here — grep to be sure: `grep -rn "minSize\|MIN_SIZE_OPTIONS" app components lib` returns nothing.)

- [ ] **Step 7: Commit.**

```bash
git add lib/productFilters.ts lib/productFilters.test.ts components/products/ProductFilterBar.tsx
git commit -m "feat: replace min-size filter with single-select size buckets"
```

---

## Task 2: Research & record LED product specs and image URLs

**Files:**
- Create: `docs/superpowers/led-research.md` (scratch research notes — committed for traceability)

**Interfaces:**
- Produces: a per-product fact sheet (final spec values + resolved image URLs) consumed verbatim by Tasks 3–7. No code.

- [ ] **Step 1: Gather specs + image URLs for each of the 5 products.**

For each product, use WebSearch + WebFetch against Samsung official pages
(samsung.com/*/business/led-signage/*, displaysolutions.samsung.com) and, where
those are JS-only, reseller spec pages (CDW, B&H, fullcompass) and the 2026
catalog PDF tables (already extracted). Record into `docs/superpowers/led-research.md`:
- Final `resolution` (pixel-pitch string), `brightness`, `operationTime`, `screenSizes[]`.
- `specGroups` values: Pixel Pitch, Diode Type, Brightness (peak), Contrast
  Ratio, Refresh Rate, Cabinet Size, Weight, Service, IP Rating, Certification,
  and a Features/Processor group.
- Current model codes (e.g. LH012MPFAAA, LH015IACCHS) for the specGroups note.
- **Resolved image URLs** (≥3, ideally ~10) that return HTTP 200 image content.
  Prefer Samsung CDN (`images.samsung.com`, `image-us.samsung.com`) and product
  galleries. Verify each URL with:
  `curl -sIL --max-time 20 -A "Mozilla/5.0" "<url>" -o /dev/null -w "%{http_code} %{content_type}\n"`
  Keep only `200` + an `image/*` content type.

Known-good anchors to start from (verified during design):
- The Wall MPF: LH012MPFAAA (P1.2), LH016MPFAAA (P1.6); ~1,600–1,800 nit; 29,000/41,000/43,000:1; IP40/20; EMC-B; TUV Eye Comfort.
- The Wall MMF: 600 nit; 8,000:1 (P0.9,P1.2) / 10,000:1 (P1.5); EMC-A.
- Indoor LED IE: IE015A (P1.5), IE020A (P2.0), IE025A (P2.5); 1,000 nit (P1.5–P2.5) / 800 nit (P4.0); 6,000/7,500/5,000:1; HDR10/10+, GoB, NQM AI; IEF P1.2 = 600 nit / 4,000:1.
- All-in-One IAB: 146"; P0.8 (1,600 nit, 24,000:1) / P1.6 (1,400 nit, 22,000:1); Quick Build; built-in control box; ~160 kg; IP20.
- All-in-One IAC: LH015IACCHS; 130" 2K; P1.5; 1,000 nit; 6,000:1; 3,840 Hz; all-inclusive package.

- [ ] **Step 2: Commit the research notes.**

```bash
git add docs/superpowers/led-research.md
git commit -m "docs: LED product spec + image-URL research for Phase 2a"
```

---

## Tasks 3–7: Add each LED product (one task per product)

Each task follows the SAME structure. Task 3 shows it in full; Tasks 4–7 repeat
it with that product's data from `docs/superpowers/led-research.md`. Do NOT
abbreviate — each product gets its own images, entry, and verification.

### Task 3: Add "The Wall (MPF)"

**Files:**
- Create: `public/products/led-signage/samsung-the-wall-mpf/` (image files)
- Modify: `data/products.ts` (append one product object)

**Interfaces:**
- Consumes: MPF fact sheet from `docs/superpowers/led-research.md`.
- Produces: product `samsung-the-wall-mpf`, `category: "LED Signage"`, in the catalog.

- [ ] **Step 1: Download the images.**

Create the folder and download each verified MPF image URL (from research notes)
into it, numbered hero-first. Example (URLs are placeholders — use the real
verified ones):

```bash
mkdir -p public/products/led-signage/samsung-the-wall-mpf
cd public/products/led-signage/samsung-the-wall-mpf
i=1; for url in <URL1> <URL2> <URL3> ...; do
  ext="${url##*.}"; case "$ext" in jpg|jpeg|png|webp|avif) : ;; *) ext=jpg ;; esac
  curl -sL --max-time 30 -A "Mozilla/5.0" "$url" -o "$i.$ext" \
    -w "$i.$ext -> %{http_code} %{content_type} %{size_download}\n"
  i=$((i+1))
done
cd -
```

- [ ] **Step 2: Verify the downloads are real images.**

Run:
```bash
ls -la public/products/led-signage/samsung-the-wall-mpf/ && \
file public/products/led-signage/samsung-the-wall-mpf/* | grep -iE "image|bitmap|PNG|JPEG|WebP"
```
Expected: ≥3 files, each identified as a real image (not HTML/text). Delete any
that are HTML error pages or 0 bytes. If fewer than 3 real images remain, return
to Task 2 for more URLs before continuing.

- [ ] **Step 3: Append the product object to `data/products.ts`.**

Insert before the closing `];` of the `products` array. Use the MPF fact sheet.
Template (fill every value from research — no placeholders in the committed code):

```ts
  {
    id: "samsung-the-wall-mpf",
    popularity: 96,
    catalog2026: true,
    name: "Samsung The Wall (MPF)",
    category: "LED Signage",
    subCategory: "The Wall",
    series: "MPF",
    description:
      "Premium micro-LED direct-view display with flip-chip RGB LEDs, deep blacks, and modular any-size scalability — the flagship of Samsung's LED signage line.",
    longDescription: `<2–3 paragraphs from research: micro-LED, Black Seal, 20-bit processing, NQM AI Gen2, one-body design, use cases>`,
    features: [
      "Flip-chip RGB micro-LED for deep blacks and wide color",
      "Black Seal Technology for superior contrast",
      "NQM AI Gen2 processor with up-to-8K scaling",
      "Modular, bezel-free any-size installation",
      "24/7 operation, front-serviceable",
    ],
    specs: {
      resolution: "P0.8 / P1.2 / P1.6 pixel pitch",
      brightness: "1,800 nit (peak)",
      screenSizes: ["110", "130", "146"],
      operationTime: "24/7",
    },
    specGroups: {
      "LED": {
        "Pixel Pitch": "P0.8 / P1.2 / P1.6",
        "Diode Type": "Flip-chip RGB LED",
        "Brightness (peak)": "1,800 nit (P0.8, P1.2) / 1,600 nit (P1.6)",
        "Contrast Ratio": "29,000:1 (P0.8) / 41,000:1 (P1.2) / 43,000:1 (P1.6)",
        "Refresh Rate": "<from research>",
        "Model Codes": "LH012MPFAAA (P1.2), LH016MPFAAA (P1.6)",
      },
      "Cabinet": {
        "Cabinet Size (L×H×D)": "<from catalog table>",
        "Weight (per cabinet)": "<from catalog table>",
        "Service": "Front",
        "IP Rating": "IP40 / IP20 (Front / Rear)",
      },
      "Processing & Certification": {
        "Processor": "NQM AI Gen2",
        "Color": "20-bit processing, Linear Grayscale, MICRO HDR",
        "Certification": "EMC Class B, TUV Eye Comfort, Safety 62368-1 / 60950-1",
      },
    },
    images: [
      "/products/led-signage/samsung-the-wall-mpf/1.jpg",
      "/products/led-signage/samsung-the-wall-mpf/2.jpg",
      // ...only the files that actually downloaded, hero first
    ],
  },
```

- [ ] **Step 4: Type-check + build.**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build lists `/products/samsung-the-wall-mpf`.

- [ ] **Step 5: Commit.**

```bash
git add public/products/led-signage/samsung-the-wall-mpf data/products.ts
git commit -m "feat: add The Wall (MPF) LED product with images"
```

### Task 4: Add "The Wall (MMF)"

Same 5 steps as Task 3, for `samsung-the-wall-mmf` (`subCategory: "The Wall"`,
`series: "MMF"`, `popularity: 90`). Specs from research: `resolution: "P0.9 / P1.2 / P1.5 pixel pitch"`,
`brightness: "600 nit"`, `screenSizes: ["110", "130", "146"]`, `operationTime: "24/7"`;
`specGroups` LED contrast `8,000:1 (P0.9, P1.2) / 10,000:1 (P1.5)`, Diode "Flip-chip RGB LED",
Certification "EMC Class A, TUV Eye Comfort". Images into
`public/products/led-signage/samsung-the-wall-mmf/`. Commit:
`feat: add The Wall (MMF) LED product with images`.

### Task 5: Add "Indoor LED (IE Series)"

Same 5 steps, for `samsung-indoor-led-ie` (`subCategory: "Indoor LED"`,
`series: "IEA/IEF"`, `popularity: 88`). Specs: `resolution: "P1.2 / P1.5 / P2.0 / P2.5 / P4.0 pixel pitch"`,
`brightness: "1,000 nit"`, `screenSizes: ["110", "130", "146", "165"]`, `operationTime: "24/7"`;
`specGroups` LED: Diode "SMD", Contrast "6,000:1 (P1.5) / 7,500:1 (P2.0) / 5,000:1 (P2.5, P4.0); IEF P1.2 4,000:1",
Brightness "1,000 nit (P1.5–P2.5) / 800 nit (P4.0) / 600 nit (IEF P1.2)", Model Codes
"IE015A (P1.5), IE020A (P2.0), IE025A (P2.5)"; Processing group: "HDR10/10+, 4K AI upscaling,
NQM AI Processor, GoB Technology"; features include curved / L-shaped / ceiling installation.
Images into `public/products/led-signage/samsung-indoor-led-ie/`. Commit:
`feat: add Indoor LED (IE) product with images`.

### Task 6: Add "All-in-One LED (IAB)"

Same 5 steps, for `samsung-all-in-one-led-iab` (`subCategory: "All-in-One LED"`,
`series: "IAB"`, `popularity: 92`). Specs: `resolution: "P0.8 / P1.2 / P1.6 pixel pitch"`,
`brightness: "1,600 nit (peak)"`, `screenSizes: ["146"]`, `operationTime: "24/7"`;
`specGroups` LED: Diode "Flip-chip RGB LED", Brightness "1,600 nit (P0.8, 24,000:1) / 1,400 nit (P1.6, 22,000:1)",
Contrast "24,000:1 (P0.8) / 22,000:1 (P1.6)"; Features: "Quick Build, built-in control box,
all-inclusive (control box, wall brackets, speakers, décor bezels), MICRO HDR, NQM AI, 20-bit",
Weight "~160 kg", IP20, Certification "EMC Class A, TUV Eye Comfort".
Images into `public/products/led-signage/samsung-all-in-one-led-iab/`. Commit:
`feat: add All-in-One LED (IAB) product with images`.

### Task 7: Add "All-in-One LED (IAC)"

Same 5 steps, for `samsung-all-in-one-led-iac` (`subCategory: "All-in-One LED"`,
`series: "IAC"`, `popularity: 89`). Specs: `resolution: "P1.5 pixel pitch"`,
`brightness: "1,000 nit"`, `screenSizes: ["130", "146"]`, `operationTime: "24/7"`;
`specGroups` LED: Diode "SMD", Contrast "6,000:1", Refresh "3,840 Hz", Model Code "LH015IACCHS",
Resolution note "2K (FHD)"; Features "Quick Build, built-in control box, all-inclusive package".
Images into `public/products/led-signage/samsung-all-in-one-led-iac/`. Commit:
`feat: add All-in-One LED (IAC) product with images`.

---

## Task 8: Full verification — LED category is live and ordered

**Files:** none modified — verification only.

- [ ] **Step 1: Type-check, test, build.**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors; all tests pass; build lists 5 new `/products/samsung-*-led*` (and `-the-wall-*`) static pages.

- [ ] **Step 2: Confirm the LED category now shows products (not "coming soon").**

`npm run dev`, then:
```bash
curl -s --max-time 20 http://localhost:3000/products -o /tmp/p.html
grep -c "samsung-the-wall-mpf" /tmp/p.html   # >= 1
```
And confirm the LED Signage section no longer renders "Products coming soon" —
i.e. the `comingSoon` guard is now false because `totalInCategory > 0`. Check the
category page too: `curl -s http://localhost:3000/categories/led-signage` shows
the 5 cards grouped by `subCategory` (The Wall / Indoor LED / All-in-One LED) and
NOT the coming-soon placeholder.

- [ ] **Step 3: Confirm ordering + images.**

- On `/products`, the LED section lists all 5 (all `catalog2026`, ordered by
  popularity: MPF 96 → IAB 92 → MMF 90 → IAC 89 → Indoor 88).
- Every product's hero image returns a real image:
  ```bash
  for id in samsung-the-wall-mpf samsung-the-wall-mmf samsung-indoor-led-ie samsung-all-in-one-led-iab samsung-all-in-one-led-iac; do
    f=$(ls public/products/led-signage/$id | sort -V | head -1)
    file "public/products/led-signage/$id/$f"
  done
  ```
  Expected: each is a real image; each product has ≥3.

- [ ] **Step 4: Confirm the new size filter works with LED sizes.**

On `/products`, select **98"+** — the two All-in-One products (146") and any
other ≥98" products appear; select **Below 43"** — LED products (all ≥110")
disappear. This exercises the Task 1 buckets against the new LED sizes.

- [ ] **Step 5: Report actual image counts + any flagged specs.**

Summarize per product: image count downloaded, and any spec cell that was
uncertain/estimated (from research notes) for user awareness. No code change.

---

## Notes on scope boundaries

- **Product-finder wizard** size ranges (`finderConfig.ts` / `ProductFinderSection`)
  are unchanged — separate feature, still works.
- **Phase 2b** (Smart Signage: Spatial, Color E-Paper, Outdoor, Window, Stretched,
  Small, Flip WMFX) and **2c** (Crystal UHD) are separate specs/plans.
- **Onyx** and **Virtual Production IVC** remain excluded.
- If a product yields <3 real images after honest effort, STOP and surface it to
  the user rather than shipping a thin/placeholder gallery.
