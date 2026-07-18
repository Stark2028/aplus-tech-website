# Commercial-Grade Spec Sheet PDF ("Manufacturer Pro") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the generated per-product spec sheet PDF into a two-page commercial datasheet (logo header, product photo, KPI strip, dense two-column spec tables, trust strip, navy contact band, watermark) per the approved spec.

**Architecture:** Keep the client-side pdf-lib generator. A new pure module `lib/pdf/specLayout.ts` plans the two-column spec flow (unit-tested, no pdf-lib). `lib/pdf/specSheet.ts` is fully rewritten to draw the new layout; `lib/pdf/helpers.ts` gains two color tokens and a null-safe PNG fetcher. `buildSpecSheetPdf(product)` keeps its exact signature so `SpecSheetButton` and the lead gate are untouched.

**Tech Stack:** TypeScript, pdf-lib 1.17 (`StandardFonts.Helvetica`/`HelveticaBold` only — no fontkit), vitest (node environment), Next.js 16 app (generator runs in the browser via dynamic import).

**Spec:** `docs/superpowers/specs/2026-07-18-spec-sheet-redesign-design.md` — read it before starting.

## Global Constraints

- No new dependencies. Fonts stay `StandardFonts.Helvetica` / `HelveticaBold`.
- `buildSpecSheetPdf(product: Product): Promise<Uint8Array>` signature unchanged.
- Generation must NEVER throw because an asset failed: missing logo → text-only header + no watermark; missing/failed product image → full-width title block.
- All user-visible strings pass through `safe()` before drawing (WinAnsi transliteration).
- Watermark: logo centered, 300 pt wide, opacity 0.05, drawn FIRST on every page.
- Colors: brand blue `#2563eb` (`C.blue600`), navy `#0f172a` (`C.navy`), light blue `#93c5fd` (`C.blueLight`); existing gray tokens.
- Page N of M footers; on the last page the CIN/GSTIN legal line replaces the standard footer.
- Commit after each task; never commit unrelated working-tree changes (`app/`, `components/sections/`, `public/team/` have unrelated WIP).

---

### Task 1: Pure column-flow planner (`lib/pdf/specLayout.ts`)

**Files:**
- Create: `lib/pdf/specLayout.ts`
- Test: `lib/pdf/specLayout.test.ts`

**Interfaces:**
- Consumes: nothing (pure module, zero imports).
- Produces (Task 3 imports these exact names):
  - `interface MeasuredRow { labelLines: string[]; valueLines: string[]; height: number }`
  - `interface MeasuredGroup { title: string; rows: MeasuredRow[] }`
  - `interface PlacedChunk { page: number; col: 0 | 1; title: string; rows: MeasuredRow[]; y: number }`
  - `interface FlowOptions { firstColH: number; contColH: number; headerH: number; groupGap: number }`
  - `function rowHeight(labelLineCount: number, valueLineCount: number, lineH: number, padV: number): number`
  - `function chunkHeight(chunk: { rows: MeasuredRow[] }, headerH: number): number`
  - `function flowGroups(groups: MeasuredGroup[], opts: FlowOptions): PlacedChunk[]`

- [ ] **Step 1: Write the failing tests**

Create `lib/pdf/specLayout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  type MeasuredGroup,
  type MeasuredRow,
  chunkHeight,
  flowGroups,
  rowHeight,
} from "./specLayout";

const row = (h = 20): MeasuredRow => ({ labelLines: ["l"], valueLines: ["v"], height: h });
const group = (title: string, rows: number, h = 20): MeasuredGroup => ({
  title,
  rows: Array.from({ length: rows }, () => row(h)),
});

// headerH 18 → a 2-row group is 58 pt, a 1-row group is 38 pt.
const OPTS = { firstColH: 100, contColH: 200, headerH: 18, groupGap: 10 };

describe("rowHeight", () => {
  it("uses the taller of label/value line counts plus padding", () => {
    expect(rowHeight(1, 3, 11, 4)).toBe(3 * 11 + 8);
  });
  it("never returns less than one line", () => {
    expect(rowHeight(0, 0, 11, 4)).toBe(11 + 8);
  });
});

describe("chunkHeight", () => {
  it("is header plus the sum of row heights", () => {
    expect(chunkHeight(group("G", 3), 18)).toBe(18 + 60);
  });
});

describe("flowGroups", () => {
  it("places a small group at the top of the first column", () => {
    const placed = flowGroups([group("Display", 2)], OPTS);
    expect(placed).toHaveLength(1);
    expect(placed[0]).toMatchObject({ page: 0, col: 0, y: 0, title: "Display" });
  });

  it("filters out empty groups", () => {
    const placed = flowGroups([group("Empty", 0), group("A", 1)], OPTS);
    expect(placed).toHaveLength(1);
    expect(placed[0].title).toBe("A");
  });

  it("stacks a second group in the same column separated by groupGap", () => {
    // 58 + 10 + 38 = 106 ≤ 120
    const placed = flowGroups([group("A", 2), group("B", 1)], { ...OPTS, firstColH: 120 });
    expect(placed[1]).toMatchObject({ page: 0, col: 0, y: 68 });
  });

  it("moves a group that fits a fresh column to the second column instead of splitting", () => {
    // col0: A (58 ≤ 100). B needs 10 + 58 = 68 more → 126 > 100, but 58 fits an empty column.
    const placed = flowGroups([group("A", 2), group("B", 2)], OPTS);
    expect(placed[1]).toMatchObject({ page: 0, col: 1, y: 0, title: "B" });
  });

  it("overflows to a continuation page when both columns are full", () => {
    const tight = { ...OPTS, firstColH: 60 }; // each 58-pt group fills a column
    const placed = flowGroups([group("A", 2), group("B", 2), group("C", 2)], tight);
    expect(placed.map((p) => [p.page, p.col])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });

  it("splits a group taller than any column and suffixes continuations once", () => {
    // 10 rows × 20 = 200 + 18 header. Columns of 100: 4 rows fit per column
    // (18 + 80 = 98 ≤ 100).
    const placed = flowGroups([group("G", 10)], { ...OPTS, contColH: 100 });
    expect(placed.map((p) => [p.page, p.col, p.title, p.rows.length])).toEqual([
      [0, 0, "G", 4],
      [0, 1, "G (CONT.)", 4],
      [1, 0, "G (CONT.)", 2],
    ]);
  });

  it("force-places a row taller than an empty column instead of looping forever", () => {
    const placed = flowGroups([group("Huge", 1, 500)], { ...OPTS, contColH: 100 });
    expect(placed).toHaveLength(1);
    expect(placed[0].rows).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/pdf/specLayout.test.ts`
Expected: FAIL — `Cannot find module './specLayout'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `lib/pdf/specLayout.ts`:

```ts
/**
 * Pure layout planner for the spec sheet's two-column technical-spec section.
 *
 * No pdf-lib imports — heights are supplied by the caller, so this module is
 * fully unit-testable in Node. `flowGroups` packs measured spec groups into
 * two columns per page (greedy first-fit, order-preserving), splitting a
 * group across columns only when it cannot fit a fresh column whole.
 */

export interface MeasuredRow {
  labelLines: string[];
  valueLines: string[];
  /** Total row height in pt (line count × line height + vertical padding). */
  height: number;
}

export interface MeasuredGroup {
  title: string;
  rows: MeasuredRow[];
}

export interface PlacedChunk {
  /** 0-based page index within the spec section (0 = the section's first page). */
  page: number;
  col: 0 | 1;
  title: string;
  rows: MeasuredRow[];
  /** Offset from the top of the column, in pt. */
  y: number;
}

export interface FlowOptions {
  /** Column height available on the section's first page. */
  firstColH: number;
  /** Column height available on continuation pages. */
  contColH: number;
  /** Group header band height. */
  headerH: number;
  /** Vertical gap between groups within one column. */
  groupGap: number;
}

export function rowHeight(
  labelLineCount: number,
  valueLineCount: number,
  lineH: number,
  padV: number
): number {
  return Math.max(labelLineCount, valueLineCount, 1) * lineH + padV * 2;
}

export function chunkHeight(chunk: { rows: MeasuredRow[] }, headerH: number): number {
  return headerH + chunk.rows.reduce((sum, r) => sum + r.height, 0);
}

const CONT_SUFFIX = " (CONT.)";
const contTitle = (t: string) => (t.endsWith(CONT_SUFFIX) ? t : t + CONT_SUFFIX);

export function flowGroups(groups: MeasuredGroup[], opts: FlowOptions): PlacedChunk[] {
  const placed: PlacedChunk[] = [];
  const queue = groups
    .filter((g) => g.rows.length > 0)
    .map((g) => ({ title: g.title, rows: g.rows.slice() }));

  let page = 0;
  let col: 0 | 1 = 0;
  let colH = opts.firstColH;
  let used = 0;

  const advance = () => {
    if (col === 0) {
      col = 1;
    } else {
      col = 0;
      page += 1;
    }
    if (page > 0) colH = opts.contColH;
    used = 0;
  };

  for (let i = 0; i < queue.length; i++) {
    const g = queue[i];
    const gap = used > 0 ? opts.groupGap : 0;
    const total = chunkHeight(g, opts.headerH);

    // Whole group fits in the current column.
    if (used + gap + total <= colH) {
      placed.push({ page, col, title: g.title, rows: g.rows, y: used + gap });
      used += gap + total;
      continue;
    }

    // Whole group fits a fresh column — move there rather than splitting.
    const freshH = col === 0 ? colH : opts.contColH;
    if (used > 0 && total <= freshH) {
      advance();
      i -= 1;
      continue;
    }

    // Split: header + as many rows as fit here; the rest continues next column.
    const avail = colH - used - gap - opts.headerH;
    let take = 0;
    let h = 0;
    for (const r of g.rows) {
      if (h + r.height > avail) break;
      h += r.height;
      take += 1;
    }
    if (take === 0) {
      if (used > 0) {
        advance();
        i -= 1;
        continue;
      }
      // A single row taller than an empty column: overflow rather than loop.
      take = 1;
    }
    placed.push({ page, col, title: g.title, rows: g.rows.slice(0, take), y: used + gap });
    if (take < g.rows.length) {
      queue.splice(i + 1, 0, { title: contTitle(g.title), rows: g.rows.slice(take) });
    }
    advance();
  }

  return placed;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/pdf/specLayout.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/specLayout.ts lib/pdf/specLayout.test.ts
git commit -m "feat(pdf): pure two-column flow planner for spec sheet layout"
```

---

### Task 2: Helper additions (`C.navy`, `C.blueLight`, `fetchPngBytes`)

**Files:**
- Modify: `lib/pdf/helpers.ts` (palette block at ~line 31; new function after `imageToPngBytes`)
- Test: `lib/pdf/helpers.test.ts` (new)

**Interfaces:**
- Consumes: nothing new.
- Produces (Task 3 imports these):
  - `C.navy: RGB` (#0f172a), `C.blueLight: RGB` (#93c5fd)
  - `function fetchPngBytes(url: string): Promise<Uint8Array | null>` — resolves `null` on HTTP error or thrown fetch (never rejects).

- [ ] **Step 1: Write the failing tests**

Create `lib/pdf/helpers.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { C, fetchPngBytes } from "./helpers";

describe("palette", () => {
  it("exposes navy and blueLight tokens", () => {
    expect(C.navy).toBeDefined();
    expect(C.blueLight).toBeDefined();
  });
});

describe("fetchPngBytes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns bytes on a successful fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
      })
    );
    expect(await fetchPngBytes("/logo.png")).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("returns null on an HTTP error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchPngBytes("/logo.png")).toBeNull();
  });

  it("returns null when fetch throws (Node relative URL, offline)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    expect(await fetchPngBytes("/logo.png")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/pdf/helpers.test.ts`
Expected: FAIL — `fetchPngBytes` is not exported / `C.navy` undefined.

- [ ] **Step 3: Implement**

In `lib/pdf/helpers.ts`, extend the `C` palette object (after the `blue50` line):

```ts
  blue50:  rgb(0.94, 0.96, 1.00),       // #eff6ff
  blueLight: rgb(0.576, 0.773, 0.988),  // #93c5fd — links on the navy band
  navy: rgb(0.059, 0.086, 0.165),       // #0f172a — contact band
```

Add after `imageToPngBytes`:

```ts
/**
 * Fetch a PNG (or any bytes) from a same-origin URL. Resolves null on ANY
 * failure — HTTP error, network error, or non-browser environment — so PDF
 * generation can degrade (skip logo/watermark) instead of throwing.
 */
export async function fetchPngBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/pdf/helpers.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/helpers.ts lib/pdf/helpers.test.ts
git commit -m "feat(pdf): navy/blueLight palette tokens + null-safe fetchPngBytes"
```

---

### Task 3: Rewrite the generator (`lib/pdf/specSheet.ts`)

**Files:**
- Modify: `lib/pdf/specSheet.ts` (full rewrite — replace the entire file)
- Test: `lib/pdf/specSheet.test.ts` (new)

**Interfaces:**
- Consumes: Task 1 (`flowGroups`, `rowHeight`, `chunkHeight`, types), Task 2 (`C.navy`, `C.blueLight`, `fetchPngBytes`), existing helpers (`wrapText`, `drawSpacedText`, `widthOfSpacedText`, `drawHr`, `safe`, `addLinkAnnotation`, `imageToPngBytes`), `formatSize`, `PHONE_DISPLAY`/`PHONE_TEL`/`CONTACT_EMAIL`.
- Produces: `buildSpecSheetPdf(product: Product): Promise<Uint8Array>` — unchanged export, consumed by `components/SpecSheetButton.tsx` via dynamic import.

- [ ] **Step 1: Write the failing integration test**

Create `lib/pdf/specSheet.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import type { Product } from "@/data/products";
import { products } from "@/data/products";
import { buildSpecSheetPdf } from "./specSheet";

const byId = (id: string): Product => {
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error(`missing product ${id}`);
  return p;
};

// Exercises every fallback path: no image, no specGroups, no features,
// no longDescription — the sheet must still render.
const minimal: Product = {
  id: "test-minimal",
  name: "Test Minimal Product",
  category: "Digital Signage",
  series: "TST",
  description: "Minimal product exercising the fallback paths.",
  features: [],
  specs: {
    resolution: "1,920 × 1,080 (FHD)",
    brightness: "300 nit",
    screenSizes: ["43"],
    operationTime: "16/7",
  },
  images: [],
};

describe("buildSpecSheetPdf", () => {
  it("renders the VMB-U (grouped specs) as a loadable multi-page PDF", async () => {
    const bytes = await buildSpecSheetPdf(byId("samsung-vmb-u-46"));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("renders a many-size product (QET, 7 sizes)", async () => {
    const bytes = await buildSpecSheetPdf(byId("samsung-qet-series"));
    await expect(PDFDocument.load(bytes)).resolves.toBeDefined();
  });

  it("renders a minimal product (no image/groups/features/overview)", async () => {
    const bytes = await buildSpecSheetPdf(minimal);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("renders every catalog product without throwing", async () => {
    for (const p of products) {
      await expect(buildSpecSheetPdf(p), p.id).resolves.toBeInstanceOf(Uint8Array);
    }
  });
});
```

Note: in Node, `imageToPngBytes` returns `null` (no `window`) and `fetchPngBytes("/logo.png")` returns `null` (relative URL throws) — so these tests exercise exactly the degraded asset paths. The with-image path is verified at runtime in Task 4.

- [ ] **Step 2: Run test to verify current state**

Run: `npx vitest run lib/pdf/specSheet.test.ts`
Expected: PASS against the OLD generator (it has the same export). That's fine — this test is the safety net; the real assertion of the new layout is Task 4's visual check. Continue.

- [ ] **Step 3: Replace `lib/pdf/specSheet.ts` entirely with the new generator**

```ts
/**
 * Spec Sheet PDF generator — "Manufacturer Pro" commercial datasheet.
 *
 * Two-page A4 layout: brand bar + logo header, title block with product
 * photo, KPI strip, features checklist, dense two-column spec tables
 * (planned by lib/pdf/specLayout.ts), product overview, trust strip, navy
 * contact band, logo watermark on every page, Page N of M footers.
 *
 * Design spec: docs/superpowers/specs/2026-07-18-spec-sheet-redesign-design.md
 */

import type { Product } from "@/data/products";
import { formatSize } from "@/lib/formatSize";
import { CONTACT_EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

import {
  A4_HEIGHT,
  A4_WIDTH,
  C,
  CONTENT_WIDTH,
  MARGIN_X,
  addLinkAnnotation,
  drawHr,
  drawSpacedText,
  fetchPngBytes,
  imageToPngBytes,
  safe,
  widthOfSpacedText,
  wrapText,
} from "./helpers";
import {
  type MeasuredGroup,
  type PlacedChunk,
  flowGroups,
  rowHeight,
} from "./specLayout";

type PDFDocument = import("pdf-lib").PDFDocument;
type PDFPage = import("pdf-lib").PDFPage;
type PDFFont = import("pdf-lib").PDFFont;
type PDFImage = import("pdf-lib").PDFImage;

// ── Layout constants (pt) ─────────────────────────────────────────────────
const BAR_H = 6;                       // blue brand bar across the page top
const FOOT_FLOOR = 52;                 // content never drawn below this y
const CONT_TOP = A4_HEIGHT - 64;       // content top on continuation pages

const ROW_FONT = 8.5;
const ROW_LINE_H = 11;
const ROW_PAD_V = 4;
const GROUP_HEADER_H = 18;
const GROUP_GAP = 10;
const SPEC_COL_GAP = 14;
const SPEC_COL_W = (CONTENT_WIDTH - SPEC_COL_GAP) / 2;
const SPEC_LABEL_W = Math.round(SPEC_COL_W * 0.47);

const IMG_PANEL_W = 190;
const IMG_PANEL_H = 120;

const BAND_H = 58;                     // navy contact band height

const TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Samsung Authorized", "Genuine India-spec units with full Samsung warranty."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["ISO 9001:2015", "Certified quality management, GST invoicing, bulk pricing."],
];

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  fonts: { regular: PDFFont; bold: PDFFont };
  y: number;
  logo: PDFImage | null;
  productName: string;
}

export async function buildSpecSheetPdf(product: Product): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  doc.setTitle(`${product.name} — Spec Sheet`);
  doc.setAuthor("Aplus Technology Solutions Pvt. Ltd.");
  doc.setSubject(`${product.series} Series specifications`);
  doc.setProducer("aplustechsol.com");
  doc.setCreator("aplustechsol.com");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Brand + product images. Every failure degrades to null — generation
  // must never fail because an asset didn't load.
  let logo: PDFImage | null = null;
  const logoBytes = await fetchPngBytes("/logo.png");
  if (logoBytes) {
    try {
      logo = await doc.embedPng(logoBytes);
    } catch {
      logo = null;
    }
  }

  let productImg: PDFImage | null = null;
  const imgBytes = product.images[0] ? await imageToPngBytes(product.images[0]) : null;
  if (imgBytes) {
    try {
      productImg = await doc.embedPng(imgBytes);
    } catch {
      productImg = null;
    }
  }

  const ctx: Ctx = {
    doc,
    page: undefined as unknown as PDFPage,
    pages: [],
    fonts: { regular, bold },
    y: 0,
    logo,
    productName: safe(product.name),
  };

  const docDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  addFirstPage(ctx, product, docDate);
  drawTitleBlock(ctx, product, productImg);
  drawKpiStrip(ctx, product);
  if (product.features.length > 0) drawFeatures(ctx, product);
  drawSpecSection(ctx, product);
  if (product.longDescription) drawOverview(ctx, product);
  drawTrustStrip(ctx);
  drawContactBand(ctx);
  drawFootersAndLegal(ctx);

  return doc.save();
}

// ── Page infrastructure ───────────────────────────────────────────────────

/** Watermark + brand bar. MUST run first on every page so content sits above. */
function paintPageChrome(ctx: Ctx) {
  if (ctx.logo) {
    const w = 300;
    const h = (ctx.logo.height / ctx.logo.width) * w;
    ctx.page.drawImage(ctx.logo, {
      x: (A4_WIDTH - w) / 2,
      y: (A4_HEIGHT - h) / 2,
      width: w,
      height: h,
      opacity: 0.05,
    });
  }
  ctx.page.drawRectangle({
    x: 0,
    y: A4_HEIGHT - BAR_H,
    width: A4_WIDTH,
    height: BAR_H,
    color: C.blue600,
  });
}

function addFirstPage(ctx: Ctx, product: Product, docDate: string) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.pages.push(ctx.page);
  paintPageChrome(ctx);
  const { page, fonts } = ctx;

  const textX = ctx.logo ? MARGIN_X + 40 : MARGIN_X;
  if (ctx.logo) {
    page.drawImage(ctx.logo, { x: MARGIN_X, y: A4_HEIGHT - 48, width: 30, height: 30 });
  }
  drawSpacedText(page, "APLUS TECHNOLOGY SOLUTIONS", {
    x: textX, y: A4_HEIGHT - 30, size: 11, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  page.drawText(safe("Authorized Samsung Commercial Display Distributor · India"), {
    x: textX, y: A4_HEIGHT - 43, size: 7.5, font: fonts.regular, color: C.gray500,
  });

  const rightX = A4_WIDTH - MARGIN_X;
  const sheetW = widthOfSpacedText("SPEC SHEET", fonts.bold, 8.5, 1.6);
  drawSpacedText(page, "SPEC SHEET", {
    x: rightX - sheetW, y: A4_HEIGHT - 30, size: 8.5, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  const seriesTxt = safe(`${product.series} Series`);
  page.drawText(seriesTxt, {
    x: rightX - fonts.regular.widthOfTextAtSize(seriesTxt, 7.5),
    y: A4_HEIGHT - 42, size: 7.5, font: fonts.regular, color: C.gray500,
  });
  page.drawText(docDate, {
    x: rightX - fonts.regular.widthOfTextAtSize(docDate, 7.5),
    y: A4_HEIGHT - 53, size: 7.5, font: fonts.regular, color: C.gray500,
  });

  drawHr(page, MARGIN_X, rightX, A4_HEIGHT - 62, 1.5, C.black);
  ctx.y = A4_HEIGHT - 80;
}

function addContinuationPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.pages.push(ctx.page);
  paintPageChrome(ctx);
  const { page, fonts } = ctx;

  const textX = ctx.logo ? MARGIN_X + 22 : MARGIN_X;
  if (ctx.logo) {
    page.drawImage(ctx.logo, { x: MARGIN_X, y: A4_HEIGHT - 38, width: 16, height: 16 });
  }
  drawSpacedText(page, "APLUS TECHNOLOGY SOLUTIONS", {
    x: textX, y: A4_HEIGHT - 33, size: 8.5, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  const rightTxt = safe(`SPEC SHEET · ${ctx.productName}`);
  const rightX = A4_WIDTH - MARGIN_X;
  page.drawText(rightTxt, {
    x: rightX - fonts.regular.widthOfTextAtSize(rightTxt, 7.5),
    y: A4_HEIGHT - 33, size: 7.5, font: fonts.regular, color: C.gray500,
  });
  drawHr(page, MARGIN_X, rightX, A4_HEIGHT - 46, 0.5, C.gray200);
  ctx.y = CONT_TOP;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < FOOT_FLOOR) addContinuationPage(ctx);
}

/** Bold tracked caps + heavy rule. */
function sectionHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 34);
  drawSpacedText(ctx.page, safe(label).toUpperCase(), {
    x: MARGIN_X, y: ctx.y, size: 9.5, font: ctx.fonts.bold, color: C.black, characterSpacing: 2,
  });
  drawHr(ctx.page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - 7, 1.5, C.black);
  ctx.y -= 22;
}

// ── Page 1 sections ───────────────────────────────────────────────────────

function drawTitleBlock(ctx: Ctx, product: Product, productImg: PDFImage | null) {
  const { page, fonts } = ctx;
  const topY = ctx.y;
  const titleW = productImg ? CONTENT_WIDTH - IMG_PANEL_W - 16 : CONTENT_WIDTH;

  const eyebrow = safe(`${product.category} · ${product.series} Series`).toUpperCase();
  drawSpacedText(page, eyebrow, {
    x: MARGIN_X, y: ctx.y, size: 8, font: fonts.bold, color: C.blue600, characterSpacing: 2.2,
  });
  ctx.y -= 18;

  for (const line of wrapText(safe(product.name), fonts.bold, 20, titleW)) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 20, font: fonts.bold, color: C.black });
    ctx.y -= 24;
  }
  ctx.y -= 2;

  for (const line of wrapText(safe(product.description), fonts.regular, 9, titleW)) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 9, font: fonts.regular, color: C.gray700 });
    ctx.y -= 13;
  }

  if (productImg) {
    const panelX = A4_WIDTH - MARGIN_X - IMG_PANEL_W;
    const panelTop = topY + 8;
    page.drawRectangle({
      x: panelX, y: panelTop - IMG_PANEL_H, width: IMG_PANEL_W, height: IMG_PANEL_H,
      color: C.gray50, borderWidth: 0.5, borderColor: C.gray200,
    });
    const maxW = IMG_PANEL_W - 16;
    const maxH = IMG_PANEL_H - 16;
    const s = Math.min(maxW / productImg.width, maxH / productImg.height);
    const w = productImg.width * s;
    const h = productImg.height * s;
    page.drawImage(productImg, {
      x: panelX + (IMG_PANEL_W - w) / 2,
      y: panelTop - IMG_PANEL_H + (IMG_PANEL_H - h) / 2,
      width: w,
      height: h,
    });
    ctx.y = Math.min(ctx.y, panelTop - IMG_PANEL_H - 6);
  }
  ctx.y -= 14;
}

function drawKpiStrip(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;
  const stripH = 44;
  const top = ctx.y;
  const stats = [
    { label: "RESOLUTION", value: safe(product.specs.resolution.split("(")[0].trim()) },
    { label: "BRIGHTNESS", value: safe(product.specs.brightness) },
    { label: "OPERATION", value: safe(product.specs.operationTime) },
    { label: "SIZES", value: safe(product.specs.screenSizes.map(formatSize).join(" · ")) },
  ];

  page.drawRectangle({
    x: MARGIN_X, y: top - stripH, width: CONTENT_WIDTH, height: stripH,
    color: C.gray50, borderWidth: 0.5, borderColor: C.gray200,
  });

  const colW = CONTENT_WIDTH / 4;
  stats.forEach((stat, i) => {
    const colX = MARGIN_X + i * colW + 10;
    drawSpacedText(page, stat.label, {
      x: colX, y: top - 15, size: 7, font: fonts.bold, color: C.gray400, characterSpacing: 1.4,
    });
    let size = 11;
    const innerW = colW - 20;
    while (size > 6.5 && fonts.bold.widthOfTextAtSize(stat.value, size) > innerW) {
      size -= 0.5;
    }
    page.drawText(stat.value, { x: colX, y: top - 32, size, font: fonts.bold, color: C.black });
    if (i > 0) {
      page.drawLine({
        start: { x: MARGIN_X + i * colW, y: top - 6 },
        end: { x: MARGIN_X + i * colW, y: top - stripH + 6 },
        thickness: 0.5, color: C.gray200,
      });
    }
  });

  ctx.y = top - stripH - 20;
}

function drawFeatures(ctx: Ctx, product: Product) {
  const { fonts } = ctx;
  const colW = (CONTENT_WIDTH - 24) / 2;
  const half = Math.ceil(product.features.length / 2);
  const cols = [product.features.slice(0, half), product.features.slice(half)];
  const colHeight = (col: string[]) =>
    col.reduce((s, f) => s + wrapText(safe(f), fonts.regular, 9, colW - 12).length * 12 + 5, 0);
  ensureSpace(ctx, 34 + Math.max(colHeight(cols[0]), colHeight(cols[1])));

  sectionHeader(ctx, "Key Features");
  const page = ctx.page;
  const startY = ctx.y;
  let minY = startY;
  cols.forEach((col, ci) => {
    let cy = startY;
    const x = MARGIN_X + ci * (colW + 24);
    for (const feat of col) {
      const lines = wrapText(safe(feat), fonts.regular, 9, colW - 12);
      page.drawRectangle({ x, y: cy + 2.2, width: 3, height: 3, color: C.blue600 });
      lines.forEach((line, li) => {
        page.drawText(line, { x: x + 10, y: cy - li * 12, size: 9, font: fonts.regular, color: C.gray700 });
      });
      cy -= lines.length * 12 + 5;
    }
    if (cy < minY) minY = cy;
  });
  ctx.y = minY - 14;
}

// ── Technical specifications (two-column flow) ────────────────────────────

function specGroupsOf(product: Product): { title: string; rows: [string, string][] }[] {
  if (product.specGroups) {
    return Object.entries(product.specGroups)
      .map(([title, rows]) => ({ title, rows: Object.entries(rows) as [string, string][] }))
      .filter((g) => g.rows.length > 0);
  }
  const rows: [string, string][] = [
    ["Resolution", product.specs.resolution],
    ["Brightness", product.specs.brightness],
    ["Available Sizes", product.specs.screenSizes.map(formatSize).join(" · ")],
    ["Operation Hours", product.specs.operationTime],
    ["Series", product.series],
  ];
  if (product.additionalSpecs) {
    const seen = new Set(rows.map(([l]) => l.toLowerCase()));
    for (const [label, value] of Object.entries(product.additionalSpecs)) {
      if (!seen.has(label.toLowerCase())) rows.push([label, value]);
    }
  }
  return [{ title: "Specifications", rows }];
}

function drawSpecSection(ctx: Ctx, product: Product) {
  const { fonts } = ctx;
  // Keep the section header attached to at least a group header + 3 rows.
  ensureSpace(ctx, 34 + GROUP_HEADER_H + 3 * (ROW_LINE_H + ROW_PAD_V * 2));
  sectionHeader(ctx, "Technical Specifications");

  const labelMax = SPEC_LABEL_W - 10;
  const valueMax = SPEC_COL_W - SPEC_LABEL_W - 10;
  const measured: MeasuredGroup[] = specGroupsOf(product).map((g) => ({
    title: g.title,
    rows: g.rows.map(([label, value]) => {
      const labelLines = wrapText(safe(label), fonts.regular, ROW_FONT, labelMax);
      const valueLines = wrapText(safe(value), fonts.bold, ROW_FONT, valueMax);
      return {
        labelLines,
        valueLines,
        height: rowHeight(labelLines.length, valueLines.length, ROW_LINE_H, ROW_PAD_V),
      };
    }),
  }));

  const sectionTops: number[] = [ctx.y];
  const placements = flowGroups(measured, {
    firstColH: ctx.y - FOOT_FLOOR,
    contColH: CONT_TOP - FOOT_FLOOR,
    headerH: GROUP_HEADER_H,
    groupGap: GROUP_GAP,
  });

  let curPage = 0;
  let bottomY = ctx.y;
  for (const chunk of placements) {
    while (chunk.page > curPage) {
      addContinuationPage(ctx);
      sectionTops.push(CONT_TOP);
      curPage += 1;
      bottomY = CONT_TOP;
    }
    const x = MARGIN_X + chunk.col * (SPEC_COL_W + SPEC_COL_GAP);
    const yEnd = drawGroupChunk(ctx, chunk, x, sectionTops[chunk.page] - chunk.y);
    if (yEnd < bottomY) bottomY = yEnd;
  }
  ctx.y = bottomY - 18;
}

/** Draw one group header band + rows at (x, topY). Returns the bottom y. */
function drawGroupChunk(ctx: Ctx, chunk: PlacedChunk, x: number, topY: number): number {
  const { page, fonts } = ctx;

  page.drawRectangle({
    x, y: topY - GROUP_HEADER_H, width: SPEC_COL_W, height: GROUP_HEADER_H, color: C.blue50,
  });
  page.drawRectangle({
    x, y: topY - GROUP_HEADER_H, width: 3, height: GROUP_HEADER_H, color: C.blue600,
  });
  drawSpacedText(page, safe(chunk.title).toUpperCase(), {
    x: x + 9, y: topY - 12.5, size: 7.5, font: fonts.bold, color: C.blue700, characterSpacing: 1.6,
  });

  let y = topY - GROUP_HEADER_H;
  chunk.rows.forEach((row, i) => {
    if (i % 2 === 0) {
      page.drawRectangle({ x, y: y - row.height, width: SPEC_COL_W, height: row.height, color: C.gray50 });
    }
    const contentLines = Math.max(row.labelLines.length, row.valueLines.length, 1);
    const labelOffset = ((contentLines - row.labelLines.length) * ROW_LINE_H) / 2;
    const valueOffset = ((contentLines - row.valueLines.length) * ROW_LINE_H) / 2;
    // First baseline sits ROW_PAD_V + 8 below the row top (8 ≈ 8.5pt ascender).
    row.labelLines.forEach((line, li) => {
      page.drawText(line, {
        x: x + 5, y: y - ROW_PAD_V - 8 - labelOffset - li * ROW_LINE_H,
        size: ROW_FONT, font: fonts.regular, color: C.gray600,
      });
    });
    row.valueLines.forEach((line, li) => {
      page.drawText(line, {
        x: x + SPEC_LABEL_W + 5, y: y - ROW_PAD_V - 8 - valueOffset - li * ROW_LINE_H,
        size: ROW_FONT, font: fonts.bold, color: C.black,
      });
    });
    drawHr(page, x, x + SPEC_COL_W, y - row.height, 0.4, C.gray200);
    y -= row.height;
  });
  return y;
}

// ── Page 2 sections ───────────────────────────────────────────────────────

function drawOverview(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Product Overview");
  const { fonts } = ctx;
  const paragraphs = (product.longDescription ?? "").split("\n\n").filter(Boolean);
  for (const para of paragraphs) {
    const lines = wrapText(safe(para), fonts.regular, 9, CONTENT_WIDTH);
    ensureSpace(ctx, lines.length * 14 + 8);
    for (const line of lines) {
      ctx.page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 9, font: fonts.regular, color: C.gray700 });
      ctx.y -= 14;
    }
    ctx.y -= 6;
  }
  ctx.y -= 6;
}

function drawTrustStrip(ctx: Ctx) {
  const { fonts } = ctx;
  const cardGap = 10;
  const cardW = (CONTENT_WIDTH - cardGap * 2) / 3;
  const bodies = TRUST_CARDS.map(([, body]) => wrapText(safe(body), fonts.regular, 7.5, cardW - 20));
  const cardH = 26 + Math.max(...bodies.map((b) => b.length)) * 10;
  ensureSpace(ctx, 34 + cardH);

  sectionHeader(ctx, "Why Buy From Aplus");
  const top = ctx.y;
  TRUST_CARDS.forEach(([title], i) => {
    const x = MARGIN_X + i * (cardW + cardGap);
    ctx.page.drawRectangle({
      x, y: top - cardH, width: cardW, height: cardH, borderWidth: 0.5, borderColor: C.gray200,
    });
    ctx.page.drawText(safe(title), { x: x + 10, y: top - 16, size: 9, font: fonts.bold, color: C.black });
    bodies[i].forEach((line, li) => {
      ctx.page.drawText(line, {
        x: x + 10, y: top - 28 - li * 10, size: 7.5, font: fonts.regular, color: C.gray500,
      });
    });
  });
  ctx.y = top - cardH - 16;
}

// ── Contact band + footers ────────────────────────────────────────────────

function drawContactBand(ctx: Ctx) {
  // Anchored to the bottom of the last page, just above the legal line.
  if (ctx.y < FOOT_FLOOR + BAND_H + 10) addContinuationPage(ctx);
  const { doc, page, fonts } = ctx;
  const bandY = FOOT_FLOOR;

  page.drawRectangle({
    x: MARGIN_X, y: bandY, width: CONTENT_WIDTH, height: BAND_H, color: C.navy,
  });

  drawSpacedText(page, "CONTACT SALES", {
    x: MARGIN_X + 16, y: bandY + BAND_H - 18, size: 7, font: fonts.bold,
    color: C.gray400, characterSpacing: 1.8,
  });
  page.drawText(safe("Bulk pricing · GST invoice · Pan-India installation"), {
    x: MARGIN_X + 16, y: bandY + BAND_H - 36, size: 10, font: fonts.bold, color: C.white,
  });

  const rightX = A4_WIDTH - MARGIN_X - 16;
  const phoneW = fonts.bold.widthOfTextAtSize(PHONE_DISPLAY, 11.5);
  page.drawText(PHONE_DISPLAY, {
    x: rightX - phoneW, y: bandY + BAND_H - 22, size: 11.5, font: fonts.bold, color: C.white,
  });
  addLinkAnnotation(doc, page, PHONE_TEL, {
    x: rightX - phoneW, y: bandY + BAND_H - 25, width: phoneW, height: 15,
  });

  const contactLine = safe(`${CONTACT_EMAIL} · aplustechsol.com`);
  const lineW = fonts.regular.widthOfTextAtSize(contactLine, 8);
  const lineX = rightX - lineW;
  page.drawText(contactLine, {
    x: lineX, y: bandY + BAND_H - 38, size: 8, font: fonts.regular, color: C.blueLight,
  });
  const emailW = fonts.regular.widthOfTextAtSize(CONTACT_EMAIL, 8);
  addLinkAnnotation(doc, page, `mailto:${CONTACT_EMAIL}`, {
    x: lineX, y: bandY + BAND_H - 41, width: emailW, height: 12,
  });
  const siteW = fonts.regular.widthOfTextAtSize("aplustechsol.com", 8);
  addLinkAnnotation(doc, page, "https://www.aplustechsol.com", {
    x: rightX - siteW, y: bandY + BAND_H - 41, width: siteW, height: 12,
  });
}

function drawFootersAndLegal(ctx: Ctx) {
  const { fonts } = ctx;
  const total = ctx.pages.length;
  const year = new Date().getFullYear();

  ctx.pages.forEach((page, i) => {
    const n = i + 1;
    const rightX = A4_WIDTH - MARGIN_X;
    if (n < total) {
      drawHr(page, MARGIN_X, rightX, 38, 0.4, C.gray200);
      page.drawText(safe("Aplus Technology Solutions · aplustechsol.com"), {
        x: MARGIN_X, y: 28, size: 7, font: fonts.regular, color: C.gray400,
      });
      const pn = `Page ${n} of ${total}`;
      page.drawText(pn, {
        x: rightX - fonts.regular.widthOfTextAtSize(pn, 7),
        y: 28, size: 7, font: fonts.regular, color: C.gray400,
      });
    } else {
      // Legal line replaces the standard footer on the last page.
      page.drawText(safe("CIN U72900DL2020PTC374888 · GSTIN 07AAUCA5631L1Z6"), {
        x: MARGIN_X, y: 30, size: 7, font: fonts.regular, color: C.gray500,
      });
      const legal = safe(
        `© ${year} Aplus Technology Solutions Pvt. Ltd. · Specifications subject to change · Page ${n} of ${total}`
      );
      page.drawText(legal, {
        x: rightX - fonts.regular.widthOfTextAtSize(legal, 7),
        y: 30, size: 7, font: fonts.regular, color: C.gray400,
      });
    }
  });
}
```

- [ ] **Step 4: Run the full test suite**

Run: `npx vitest run lib/pdf/`
Expected: PASS — specLayout (9), helpers (4), specSheet (4). If the "every catalog product" test fails, the failure message names the product id; fix the layout code (not the data).

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors in `lib/pdf/*` (pre-existing errors elsewhere, if any, are out of scope).

- [ ] **Step 6: Commit**

```bash
git add lib/pdf/specSheet.ts lib/pdf/specSheet.test.ts
git commit -m "feat(pdf): commercial-grade Manufacturer Pro spec sheet layout"
```

---

### Task 4: Runtime verification and visual tuning

**Files:**
- Modify (only if visual fixes needed): `lib/pdf/specSheet.ts`

**Interfaces:**
- Consumes: the running site + Task 3's generator.
- Produces: verified PDFs matching the approved mockup (`.superpowers/brainstorm/4740-1784358437/content/design-full-v2.html`).

- [ ] **Step 1: Launch the site with the project recipe**

Invoke the `verify` skill (project skill — build/launch/drive recipe for this Next.js site) and follow it to get a dev/prod server running. Note the Windows gotcha from project memory: after stopping background next servers, kill by port PID or stale builds poison verification.

- [ ] **Step 2: Bypass the lead gate in the browser session**

In the driven browser, before clicking download, run:

```js
localStorage.setItem("aplus_lead_gate", JSON.stringify({
  name: "QA Test", email: "qa@test.local", phone: "9999999999", capturedAt: Date.now(),
}));
```

(Key and shape from `lib/leadGate.ts` — `hasGated()` then skips the modal.)

- [ ] **Step 3: Download and inspect three PDFs**

For each of these product pages, click "Download Spec Sheet (PDF)" and open the downloaded file:

1. `/products/samsung-vmb-u-46` — grouped specs, single size, has image.
2. `/products/samsung-qet-series` — 7 sizes, long features, has image.
3. One product without `specGroups` (search `data/products.ts` for an entry lacking `specGroups:`; if all have groups, VMB-U + QET suffice and note it).

Check each against the approved mockup:
- Logo top-left in header; watermark visible but subtle (≈5% opacity) on every page.
- Product photo aspect-fit in the right panel; no overlap with the title.
- KPI strip values fit their cells (QET's 7 sizes shrink but stay legible).
- Spec tables in two balanced columns, group headers with blue accent, alternating row shading, no text overflowing a column or colliding with the footer.
- Page 2: overview paragraphs, trust strip cards, navy contact band at the bottom, legal line with correct `Page 2 of 2`.
- Clickable: phone (tel:), email (mailto:), website link on the band.

- [ ] **Step 4: Fix any visual defects found**

Adjust only layout constants/draw code in `lib/pdf/specSheet.ts`; re-run `npx vitest run lib/pdf/` after each change, re-download, re-check.

- [ ] **Step 5: Commit tuning (if any changes were made)**

```bash
git add lib/pdf/specSheet.ts
git commit -m "fix(pdf): visual tuning after runtime verification"
```

---

## Self-Review Results

- **Spec coverage:** brand bar/header/logo (T3 `addFirstPage`), title+photo (T3 `drawTitleBlock`), KPI strip (T3), features (T3), two-column spec flow + split with (CONT.) (T1+T3), overview (T3), trust strip (T3), navy contact band with links (T3), watermark every page (T3 `paintPageChrome`), Page N of M + last-page legal (T3 `drawFootersAndLegal`), degradation rules (T2 `fetchPngBytes` + null guards in T3, verified by T3 tests), runtime checks (T4). No gaps.
- **Type consistency:** `MeasuredRow/MeasuredGroup/PlacedChunk/FlowOptions/rowHeight/chunkHeight/flowGroups` names match between T1 and T3 imports; `C.navy`/`C.blueLight`/`fetchPngBytes` match between T2 and T3.
- **Placeholder scan:** clean — every code step contains complete code; commands include expected outcomes.
