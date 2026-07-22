# Quote PDF Chrome Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Quote Request PDF render in the spec sheet's "Manufacturer Pro" chrome (brand bar, logo watermark, logo header, heavy section rules, navy contact band, Page N of M footers) by extracting the shared chrome into one module and refactoring both generators onto it.

**Architecture:** Move the page chrome (`paintPageChrome`), navy contact band, footer/legal line, and logo loading out of `lib/pdf/specSheet.ts` into a new `lib/pdf/chrome.ts` shared by both generators. Refactor `specSheet.ts` onto it with zero visual change (guarded by its existing tests), then rebuild `lib/pdf/quote.ts` to use the same chrome plus a zebra-striped items table.

**Tech Stack:** TypeScript, `pdf-lib`, Vitest. Browser-side PDF generation (fonts embedded, clickable link annotations).

## Global Constraints

- A4 geometry and palette come from `lib/pdf/helpers.ts` (`A4_WIDTH`, `A4_HEIGHT`, `MARGIN_X`, `CONTENT_WIDTH`, `C`, `safe`, `wrapText`, `drawHr`, `drawSpacedText`, `widthOfSpacedText`, `addLinkAnnotation`, `fetchPngBytes`). Do not redefine them.
- Every asset load MUST degrade to `null` on failure — PDF generation must never throw because `/logo.png` didn't load.
- All user/product text passes through `safe()` before drawing (WinAnsi font encoding).
- Contact details come only from `lib/contact.ts` (`PHONE_DISPLAY`, `PHONE_TEL`, `CONTACT_EMAIL`). No hardcoded numbers/emails.
- The spec sheet's rendered output MUST NOT change. The default contact-band tagline stays exactly `"Bulk pricing · GST invoice · Pan-India installation"`.
- Test runner: `npx vitest run <file>` (repo script is `npm test` → `vitest run`).

---

### Task 1: Extract shared chrome into `lib/pdf/chrome.ts` and refactor the spec sheet onto it

**Files:**
- Create: `lib/pdf/chrome.ts`
- Modify: `lib/pdf/specSheet.ts` (delete the inline chrome, import from `chrome.ts`)
- Test (guard, existing): `lib/pdf/specSheet.test.ts`, `lib/pdf/specSheet.brand.test.ts`

**Interfaces:**
- Produces:
  - `interface ChromeCtx { doc: PDFDocument; page: PDFPage; pages: PDFPage[]; fonts: { regular: PDFFont; bold: PDFFont }; y: number; logo: PDFImage | null; }`
  - `const BAR_H = 6`, `const FOOT_FLOOR = 52`, `const CONT_TOP = A4_HEIGHT - 64`, `const BAND_H = 58`
  - `async function loadLogo(doc: PDFDocument): Promise<PDFImage | null>`
  - `function paintPageChrome(ctx: ChromeCtx): void`
  - `function drawContactBand(ctx: ChromeCtx, opts?: { tagline?: string }): void`
  - `function drawFootersAndLegal(ctx: ChromeCtx): void`
- Consumes: helpers from `lib/pdf/helpers.ts`, contact constants from `lib/contact.ts`.

- [ ] **Step 1: Establish the green baseline for the spec sheet**

Run: `npx vitest run lib/pdf/specSheet.test.ts lib/pdf/specSheet.brand.test.ts`
Expected: PASS (these are the regression guard for the code we are about to move).

- [ ] **Step 2: Create `lib/pdf/chrome.ts`**

Note vs. the current spec sheet: the "no room → add a continuation page" check that lived *inside* `drawContactBand` moves OUT to the caller (page management stays with each generator, which owns its continuation-page header). `drawContactBand` here only draws at the floor.

```ts
/**
 * Shared "Manufacturer Pro" page chrome for the PDF generators.
 *
 * Brand bar + centered logo watermark, the navy contact band, the Page N of M
 * footers / legal line, and logo loading — extracted from specSheet.ts so the
 * spec sheet and the quote request render as one document family from a single
 * source of truth.
 */

import type { PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
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
  safe,
} from "./helpers";

// ── Layout constants (pt) ─────────────────────────────────────────────────
export const BAR_H = 6;                 // blue brand bar across the page top
export const FOOT_FLOOR = 52;           // content never drawn below this y
export const CONT_TOP = A4_HEIGHT - 64; // content top on continuation pages
export const BAND_H = 58;               // navy contact band height

/** The minimal context shape the shared chrome needs. Both generators' own
 *  Ctx types are structurally compatible (they may carry extra fields). */
export interface ChromeCtx {
  doc: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  fonts: { regular: PDFFont; bold: PDFFont };
  y: number;
  logo: PDFImage | null;
}

/** Load /logo.png as an embeddable image. Degrades to null on ANY failure so
 *  generation never aborts because the logo didn't load. */
export async function loadLogo(doc: PDFDocument): Promise<PDFImage | null> {
  const bytes = await fetchPngBytes("/logo.png");
  if (!bytes) return null;
  try {
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

/** Watermark + brand bar. MUST run first on every page so content sits above. */
export function paintPageChrome(ctx: ChromeCtx) {
  if (ctx.logo) {
    const w = 300;
    const h = (ctx.logo.height / ctx.logo.width) * w;
    ctx.page.drawImage(ctx.logo, {
      x: (A4_WIDTH - w) / 2,
      y: (A4_HEIGHT - h) / 2,
      width: w,
      height: h,
      opacity: 0.1,
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

const DEFAULT_TAGLINE = "Bulk pricing · GST invoice · Pan-India installation";

/**
 * Navy contact band anchored at the page floor (FOOT_FLOOR). Clickable phone /
 * email / site. The CALLER must guarantee room first (add a continuation page
 * when `ctx.y < FOOT_FLOOR + BAND_H + 10`).
 */
export function drawContactBand(ctx: ChromeCtx, opts: { tagline?: string } = {}) {
  const { doc, page, fonts } = ctx;
  const bandY = FOOT_FLOOR;

  page.drawRectangle({
    x: MARGIN_X, y: bandY, width: CONTENT_WIDTH, height: BAND_H, color: C.navy,
  });

  drawSpacedText(page, "CONTACT SALES", {
    x: MARGIN_X + 16, y: bandY + BAND_H - 18, size: 7, font: fonts.bold,
    color: C.gray400, characterSpacing: 1.8,
  });
  page.drawText(safe(opts.tagline ?? DEFAULT_TAGLINE), {
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

/** Page N of M on non-last pages, legal line on the last. Draw AFTER all
 *  content so the page count is final. */
export function drawFootersAndLegal(ctx: ChromeCtx) {
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
      page.drawText(safe("CIN U72900DL2020PTC374888 · GSTIN 07AAUCA5631L1Z6"), {
        x: MARGIN_X, y: 30, size: 7, font: fonts.regular, color: C.gray500,
      });
      const legal = safe(
        `© ${year} Aplus Technology Solutions Pvt. Ltd. · Page ${n} of ${total}`
      );
      page.drawText(legal, {
        x: rightX - fonts.regular.widthOfTextAtSize(legal, 7),
        y: 30, size: 7, font: fonts.regular, color: C.gray400,
      });
    }
  });
}
```

- [ ] **Step 3: Refactor `lib/pdf/specSheet.ts` to import the shared chrome**

In the imports, add a `./chrome` import and drop `fetchPngBytes` from the `./helpers` import (now only used inside `chrome.ts`; keep it in `helpers` if still referenced elsewhere in the file — it is not):

```ts
import {
  A4_HEIGHT,
  A4_WIDTH,
  C,
  CONTENT_WIDTH,
  MARGIN_X,
  addLinkAnnotation,
  drawHr,
  drawSpacedText,
  imageToPngBytes,
  safe,
  widthOfSpacedText,
  wrapText,
} from "./helpers";
import {
  BAND_H,
  CONT_TOP,
  FOOT_FLOOR,
  drawContactBand,
  drawFootersAndLegal,
  loadLogo,
  paintPageChrome,
} from "./chrome";
```

Then DELETE from `specSheet.ts` (now provided by `chrome.ts`):
- the local `const BAR_H`, `const FOOT_FLOOR`, `const CONT_TOP`, `const BAND_H` declarations;
- the entire `function paintPageChrome(ctx: Ctx)`;
- the entire `function drawContactBand(ctx: Ctx)`;
- the entire `function drawFootersAndLegal(ctx: Ctx)`.

Keep `BAR_H` usage gone (it was only used inside the moved `paintPageChrome`). Keep `CONT_TOP`, `FOOT_FLOOR`, `BAND_H` imported because the rest of `specSheet.ts` still references them.

- [ ] **Step 4: Replace the inline logo-load block in `buildSpecSheetPdf`**

Find the block that starts `let logo: PDFImage | null = null;` … through its `try/catch` and replace it with:

```ts
  const logo = await loadLogo(doc);
```

(The `productImg` block below it is unchanged — it uses `imageToPngBytes`, not the logo loader.)

- [ ] **Step 5: Move the band's space-guard to the call site**

In `buildSpecSheetPdf`, the call is currently `drawContactBand(ctx);`. Because the continuation check moved out of `drawContactBand`, guard it here (right where `drawContactBand` is invoked, replacing that single line):

```ts
  if (ctx.y < FOOT_FLOOR + BAND_H + 10) addContinuationPage(ctx);
  drawContactBand(ctx);
```

`drawContactBand(ctx)` uses the default tagline, which equals the spec sheet's previous hardcoded string — output is unchanged.

- [ ] **Step 6: Run the spec sheet tests — output MUST be unchanged**

Run: `npx vitest run lib/pdf/specSheet.test.ts lib/pdf/specSheet.brand.test.ts`
Expected: PASS (same as the Step 1 baseline). If anything fails, the extraction changed behavior — fix before committing.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/pdf/chrome.ts` or `lib/pdf/specSheet.ts`.

- [ ] **Step 8: Commit**

```bash
git add lib/pdf/chrome.ts lib/pdf/specSheet.ts
git commit -m "refactor(pdf): extract shared page chrome into lib/pdf/chrome.ts

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Quote PDF — page plumbing, watermark/brand bar, logo header, continuation page

**Files:**
- Create: `lib/pdf/quote.test.ts`
- Modify: `lib/pdf/quote.ts`

**Interfaces:**
- Consumes (from Task 1): `ChromeCtx`-compatible fields, `CONT_TOP`, `FOOT_FLOOR`, `BAND_H`, `loadLogo`, `paintPageChrome`, `drawContactBand`, `drawFootersAndLegal`.
- Produces: `buildQuotePdf(params: { items: QuoteItem[]; totalItems: number; quoteRef: string; quoteDate: string }): Promise<Uint8Array>` (signature unchanged); internal `addFirstPage(ctx)`, `addContinuationPage(ctx)`.

- [ ] **Step 1: Write the quote smoke test (regression guard)**

```ts
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import type { Product } from "@/data/products";
import type { QuoteItem } from "@/context/QuoteContext";
import { buildQuotePdf } from "./quote";

const base: Product = {
  id: "test-signage",
  name: "Test Signage Display",
  category: "Digital Signage",
  series: "TST",
  description: "Test product for the quote PDF smoke test.",
  features: [],
  specs: {
    resolution: "3,840 × 2,160 (4K UHD)",
    brightness: "500 nit",
    screenSizes: ["43", "55", "65"],
    operationTime: "16/7",
  },
  images: [],
};

const items = (n: number): QuoteItem[] =>
  Array.from({ length: n }, (_, i) => ({
    product: { ...base, id: `test-${i}`, name: `Test Product ${i + 1}` },
    quantity: i + 1,
  }));

const params = (n: number) => {
  const list = items(n);
  return {
    items: list,
    totalItems: list.reduce((s, it) => s + it.quantity, 0),
    quoteRef: "Q-20260722-TEST",
    quoteDate: "22 Jul 2026",
  };
};

describe("buildQuotePdf", () => {
  it("renders a single-item quote as a loadable PDF", async () => {
    const bytes = await buildQuotePdf(params(1));
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    await expect(PDFDocument.load(bytes)).resolves.toBeDefined();
  });

  it("paginates a large cart across multiple pages", async () => {
    const bytes = await buildQuotePdf(params(25));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("sets the quote ref in the PDF title", async () => {
    const bytes = await buildQuotePdf(params(3));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getTitle()).toContain("Q-20260722-TEST");
  });
});
```

- [ ] **Step 2: Run it against the current generator to confirm a green baseline**

Run: `npx vitest run lib/pdf/quote.test.ts`
Expected: PASS. This guards that the refactor keeps producing a loadable, paginating, correctly-titled PDF. (In the test env `fetch("/logo.png")` fails and `loadLogo` returns null — same as the spec sheet tests.)

- [ ] **Step 3: Add pdf-lib type aliases and extend `Ctx` in `quote.ts`**

Below the imports, add aliases (mirroring `specSheet.ts`) and extend `Ctx`:

```ts
type PDFDocument = import("pdf-lib").PDFDocument;
type PDFPage = import("pdf-lib").PDFPage;
type PDFFont = import("pdf-lib").PDFFont;
type PDFImage = import("pdf-lib").PDFImage;

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  fonts: { regular: PDFFont; bold: PDFFont };
  y: number;
  logo: PDFImage | null;
  params: QuoteParams;
}
```

- [ ] **Step 4: Update imports in `quote.ts`**

Replace the `./helpers` import list and add the `./chrome` import. Drop the now-unused `MARGIN_BOTTOM`, `MARGIN_TOP`, and `addLinkAnnotation` (links now live in the shared band); add `widthOfSpacedText`:

```ts
import {
  A4_HEIGHT,
  A4_WIDTH,
  C,
  CONTENT_WIDTH,
  MARGIN_X,
  drawHr,
  drawSpacedText,
  safe,
  widthOfSpacedText,
  wrapText,
} from "./helpers";
import {
  BAND_H,
  CONT_TOP,
  FOOT_FLOOR,
  drawContactBand,
  drawFootersAndLegal,
  loadLogo,
  paintPageChrome,
} from "./chrome";
```

- [ ] **Step 5: Rewrite `buildQuotePdf` orchestration**

Replace the body of `buildQuotePdf` (from `const page = doc.addPage(...)` through `return doc.save();`) with page plumbing that loads the logo, seeds `pages`, and calls the new section order. Keep the `doc.setTitle(...)`/metadata block above it unchanged:

```ts
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const logo = await loadLogo(doc);

  const ctx: Ctx = {
    doc,
    page: undefined as unknown as PDFPage,
    pages: [],
    fonts: { regular, bold },
    y: 0,
    logo,
    params,
  };

  addFirstPage(ctx);
  drawTitleBlock(ctx);
  drawItemsSection(ctx);
  drawPricingNote(ctx);
  drawNextSteps(ctx);
  if (ctx.y < FOOT_FLOOR + BAND_H + 10) addContinuationPage(ctx);
  drawContactBand(ctx);
  drawFootersAndLegal(ctx);

  return doc.save();
```

- [ ] **Step 6: Replace `drawHeader` with `addFirstPage`**

Delete the entire `function drawHeader(ctx: Ctx)` and add:

```ts
function addFirstPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.pages.push(ctx.page);
  paintPageChrome(ctx);
  const { page, fonts, params } = ctx;

  const textX = ctx.logo ? MARGIN_X + 40 : MARGIN_X;
  if (ctx.logo) {
    page.drawImage(ctx.logo, { x: MARGIN_X, y: A4_HEIGHT - 48, width: 30, height: 30 });
  }
  drawSpacedText(page, "APLUS TECHNOLOGY SOLUTIONS", {
    x: textX, y: A4_HEIGHT - 30, size: 11, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  page.drawText(safe("Commercial Display & Video Conferencing Supply · Pan-India"), {
    x: textX, y: A4_HEIGHT - 43, size: 7.5, font: fonts.regular, color: C.gray500,
  });

  const rightX = A4_WIDTH - MARGIN_X;
  const eyebrowW = widthOfSpacedText("QUOTE REQUEST", fonts.bold, 8.5, 1.6);
  drawSpacedText(page, "QUOTE REQUEST", {
    x: rightX - eyebrowW, y: A4_HEIGHT - 30, size: 8.5, font: fonts.bold, color: C.blue600, characterSpacing: 1.6,
  });
  const refTxt = safe(params.quoteRef);
  page.drawText(refTxt, {
    x: rightX - fonts.bold.widthOfTextAtSize(refTxt, 12),
    y: A4_HEIGHT - 46, size: 12, font: fonts.bold, color: C.black,
  });
  const issued = safe(`Issued ${params.quoteDate}`);
  page.drawText(issued, {
    x: rightX - fonts.regular.widthOfTextAtSize(issued, 7.5),
    y: A4_HEIGHT - 58, size: 7.5, font: fonts.regular, color: C.gray500,
  });

  drawHr(page, MARGIN_X, rightX, A4_HEIGHT - 66, 1.5, C.black);
  ctx.y = A4_HEIGHT - 84;
}
```

- [ ] **Step 7: Replace `addNewPage` with `addContinuationPage`**

Delete the entire `function addNewPage(ctx: Ctx)` and add:

```ts
function addContinuationPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.pages.push(ctx.page);
  paintPageChrome(ctx);
  const { page, fonts, params } = ctx;

  const textX = ctx.logo ? MARGIN_X + 22 : MARGIN_X;
  if (ctx.logo) {
    page.drawImage(ctx.logo, { x: MARGIN_X, y: A4_HEIGHT - 38, width: 16, height: 16 });
  }
  drawSpacedText(page, "APLUS TECHNOLOGY SOLUTIONS", {
    x: textX, y: A4_HEIGHT - 33, size: 8.5, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  const rightTxt = safe(`QUOTE REQUEST · ${params.quoteRef}`);
  const rightX = A4_WIDTH - MARGIN_X;
  page.drawText(rightTxt, {
    x: rightX - fonts.regular.widthOfTextAtSize(rightTxt, 7.5),
    y: A4_HEIGHT - 33, size: 7.5, font: fonts.regular, color: C.gray500,
  });
  drawHr(page, MARGIN_X, rightX, A4_HEIGHT - 46, 0.5, C.gray200);
  ctx.y = CONT_TOP;
}
```

- [ ] **Step 8: Point `ensureSpace` and the item-row page break at the new floor/continuation**

In `ensureSpace`, change the body to use `FOOT_FLOOR` and the new page fn:

```ts
function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < FOOT_FLOOR) addContinuationPage(ctx);
}
```

In `drawItemRow`, the page-break block currently reads
`if (ctx.y - rowHeight < MARGIN_BOTTOM + 70) { addNewPage(ctx); ... }`. Change the condition and call:

```ts
  if (ctx.y - rowHeight < FOOT_FLOOR) {
    addContinuationPage(ctx);
    sectionHeader(ctx, "Items Requested (continued)");
    drawItemsHeader(ctx);
  }
```

- [ ] **Step 9: Run the smoke test — still green**

Run: `npx vitest run lib/pdf/quote.test.ts`
Expected: PASS (loadable, paginates, titled). `drawNextSteps` does not exist yet — it is added in Task 4, so temporarily stub it OR reorder: to keep this task compiling, add a placeholder at the bottom of the file now and flesh it out in Task 4:

```ts
function drawNextSteps(ctx: Ctx) {
  // Filled in Task 4. For now, retain the existing info grid so the document
  // stays complete while the chrome lands incrementally.
  drawInfoGrid(ctx);
}
```

(Task 4 replaces this stub and deletes `drawInfoGrid`.)

- [ ] **Step 10: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`drawFooter`, `drawInfoGrid`, `drawLeftLink` still exist and are still referenced — they are removed in Task 4.)

- [ ] **Step 11: Commit**

```bash
git add lib/pdf/quote.ts lib/pdf/quote.test.ts
git commit -m "feat(pdf): quote gains the shared chrome header, watermark and pagination

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Quote PDF — heavier section headers and zebra-striped items table

**Files:**
- Modify: `lib/pdf/quote.ts`

**Interfaces:**
- Consumes: `C.gray50`, `CONTENT_WIDTH`, `MARGIN_X` (helpers); `Ctx` from Task 2.
- Produces: no new exports.

- [ ] **Step 1: Bump `sectionHeader` to the spec sheet's weight**

Replace the body of `sectionHeader`:

```ts
function sectionHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 34);
  const { page, fonts } = ctx;
  drawSpacedText(page, safe(label).toUpperCase(), {
    x: MARGIN_X, y: ctx.y, size: 9.5, font: fonts.bold, color: C.black, characterSpacing: 2,
  });
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - 7, 1.5, C.black);
  ctx.y -= 22;
}
```

- [ ] **Step 2: Add zebra striping and drop the per-row hairline in `drawItemRow`**

In `drawItemRow`, immediately after `const rowTop = ctx.y;`, draw the zebra band behind odd rows (before any text):

```ts
  if (idx % 2 === 1) {
    page.drawRectangle({
      x: MARGIN_X,
      y: rowTop + 7 - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: C.gray50,
    });
  }
```

Then, at the end of `drawItemRow`, DELETE the trailing hairline line:

```ts
  // remove:
  // drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y + 6, 0.4, C.gray100);
```

Keep `ctx.y -= rowHeight;`.

- [ ] **Step 3: Run the smoke test**

Run: `npx vitest run lib/pdf/quote.test.ts`
Expected: PASS (still loadable + paginating).

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/quote.ts
git commit -m "style(pdf): heavier quote section headers and zebra-striped items

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Quote PDF — Next Steps section + navy contact band, retire the info grid and old footer

**Files:**
- Modify: `lib/pdf/quote.ts`

**Interfaces:**
- Consumes: `drawContactBand`, `drawFootersAndLegal` (Task 1); `wrapText`, `drawHr`, `drawSpacedText`, `C`, `CONTENT_WIDTH`, `MARGIN_X`.
- Produces: `drawNextSteps(ctx: Ctx)` (real implementation, replacing the Task 2 stub).

- [ ] **Step 1: Implement `drawNextSteps`**

Replace the Task 2 stub `drawNextSteps` with the real prose section (full-width, light label — not the heavy section header, so it reads as a closing note above the band):

```ts
function drawNextSteps(ctx: Ctx) {
  ensureSpace(ctx, 70);
  const { page, fonts } = ctx;

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.75, C.black);
  ctx.y -= 16;
  drawSpacedText(page, "NEXT STEPS", {
    x: MARGIN_X, y: ctx.y, size: 7.5, font: fonts.bold, color: C.gray500, characterSpacing: 1.4,
  });

  const body = safe(
    "Submit this quote online or share this PDF with our team to receive formal pricing within 24 business hours. This is a quote request, not an invoice — pricing is subject to confirmation."
  );
  const lines = wrapText(body, fonts.regular, 9, CONTENT_WIDTH);
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X, y: ctx.y - 14 - i * 13, size: 9, font: fonts.regular, color: C.black,
    });
  });
  ctx.y = ctx.y - 14 - lines.length * 13 - 16;
}
```

- [ ] **Step 2: Delete the retired functions**

DELETE from `quote.ts` (the contact band + shared footer now cover their jobs):
- the entire `function drawInfoGrid(ctx: Ctx)`;
- the entire `function drawFooter(ctx: Ctx)`;
- the entire `function drawLeftLink(...)` helper (only used by `drawInfoGrid`).

Keep `drawRightText` (still used by the items header/total and could be reused).

- [ ] **Step 3: Confirm the orchestration already calls the band + footers**

`buildQuotePdf` (from Task 2, Step 5) already ends with:

```ts
  drawNextSteps(ctx);
  if (ctx.y < FOOT_FLOOR + BAND_H + 10) addContinuationPage(ctx);
  drawContactBand(ctx);
  drawFootersAndLegal(ctx);
```

No change needed here — just verify it matches after the stub replacement.

- [ ] **Step 4: Run the smoke test**

Run: `npx vitest run lib/pdf/quote.test.ts`
Expected: PASS.

- [ ] **Step 5: Full test suite + typecheck + lint**

Run: `npx vitest run lib/pdf` then `npx tsc --noEmit` then `npx next lint --file lib/pdf/quote.ts --file lib/pdf/chrome.ts`
Expected: all PASS, no errors, no lint warnings (no unused imports left behind — `MARGIN_BOTTOM`, `MARGIN_TOP`, `addLinkAnnotation` must be gone from `quote.ts`).

- [ ] **Step 6: Commit**

```bash
git add lib/pdf/quote.ts
git commit -m "feat(pdf): quote closes with the shared navy contact band and legal footer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Runtime verification

**Files:** none (manual verification).

- [ ] **Step 1: Verify at runtime using the project's verify recipe**

Use the `verify` skill (or `run` skill) to launch the site, add 1 product then a large cart (e.g. 12+ products) to the quote, and download the quote PDF from `QuoteItemsCard` / `QuoteSubmitForm`.

Confirm on the generated PDF:
- Blue brand bar across the top of every page; centered 10% logo watermark.
- First-page header: logo icon + `APLUS TECHNOLOGY SOLUTIONS` + sub-line on the left; blue `QUOTE REQUEST` eyebrow + ref + `Issued …` on the right; heavy rule below.
- Items table has zebra-striped rows; section headers use the heavy rule.
- The large cart paginates with a continuation header (`QUOTE REQUEST · <ref>`) and `Page N of M` footers.
- The document closes with the Next Steps prose, the navy contact band (phone/email/site clickable), and the legal line on the last page.
- Side-by-side with a spec-sheet download, the two read as the same family.

- [ ] **Step 2: Windows server cleanup**

After stopping the dev server, kill any orphaned Next process by port PID (per the project's known Windows TaskStop-orphan behavior) so a stale build doesn't poison a later verify.

- [ ] **Step 3 (optional): Update memory**

If anything non-obvious surfaced (e.g. a chrome constant that had to change for the quote), note it against the existing spec-sheet / quote memory entries.

---

## Self-Review

**Spec coverage:**
- Brand bar + watermark → Task 1 (`paintPageChrome`), wired in Task 2 (`addFirstPage`/`addContinuationPage`). ✓
- First-page + continuation headers → Task 2 Steps 6–7. ✓
- Heavy section rules → Task 3 Step 1. ✓
- Zebra items table → Task 3 Step 2. ✓
- Pricing note unchanged → untouched. ✓
- Next Steps kept → Task 4 Step 1. ✓
- Navy contact band replaces info grid → Task 4 (band call in Task 2 orchestration, `drawInfoGrid` deleted Task 4 Step 2). ✓
- Page N of M footers + legal → Task 1 (`drawFootersAndLegal`), called Task 2 orchestration. ✓
- Shared `chrome.ts`, both generators refactored → Task 1. ✓
- Spec sheet output unchanged → Task 1 Steps 5–6 (default tagline + existing tests). ✓

**Placeholder scan:** The only intentional temporary is the Task 2 Step 9 `drawNextSteps` stub, explicitly replaced in Task 4 Step 1. No `TBD`/`TODO`/vague steps remain.

**Type consistency:** `Ctx` (Task 2) is structurally compatible with `ChromeCtx` (Task 1) — same fields, `params` is an extra field which structural typing permits. `addContinuationPage`/`addFirstPage` names are used consistently. `drawContactBand`/`drawFootersAndLegal`/`loadLogo`/`paintPageChrome` signatures match between definition (Task 1) and calls (Tasks 1–4).
