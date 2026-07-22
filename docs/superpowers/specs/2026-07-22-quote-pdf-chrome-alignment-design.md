# Quote PDF — Align to Spec Sheet "Manufacturer Pro" chrome

**Date:** 2026-07-22
**Status:** Approved (design)

## Goal

Make the Quote Request PDF ([lib/pdf/quote.ts](../../../lib/pdf/quote.ts)) read as the same
document family as the shipped Spec Sheet PDF ([lib/pdf/specSheet.ts](../../../lib/pdf/specSheet.ts)).
Today the two share only [lib/pdf/helpers.ts](../../../lib/pdf/helpers.ts) primitives; the quote is a
flatter, text-only layout while the spec sheet has a distinctive "Manufacturer Pro" chrome
(brand bar, logo watermark, logo-in-header, heavy section rules, navy contact band, Page N of M
footers). This work brings the quote up to that chrome while keeping its quote-specific body
(items table + pricing note + Next Steps prose).

Scope decision: **full chrome match** (not header-only, not band-only).

## What changes (visual)

Quote PDF gains, matching the spec sheet exactly:

1. **Brand bar** — 6pt `blue600` rectangle across the top of every page.
2. **Logo watermark** — `/logo.png` centered at 10% opacity on every page. Loads via
   `fetchPngBytes`, degrades to `null` on any failure (never aborts generation).
3. **First-page header** — 30×30 logo icon at the left margin, `APLUS TECHNOLOGY SOLUTIONS`
   (11pt tracked) + sub-line `Commercial Display & Video Conferencing Supply · Pan-India`;
   right side a blue `QUOTE REQUEST` eyebrow + the quote ref (12pt bold) + `Issued <date>`;
   closed by a **1.5pt** black rule (was 0.75pt). Phone/email leave the header — identity moves
   to the contact band.
4. **Continuation-page header** — small logo + company name on the left, `QUOTE REQUEST · <ref>`
   on the right, thin rule; content resumes at `CONT_TOP`. (New — quote had none.)
5. **Section headers** — 9.5pt tracked caps + **1.5pt** black rule (was 8.5pt + 0.75pt), matching
   the spec sheet's `sectionHeader`.
6. **Items table** — same columns (#, Product, Specifications, Qty). Rows gain **light zebra
   striping** (alternating `gray50` backgrounds) to match the spec sheet's spec tables; the
   existing thin per-row hairline is replaced by the zebra fill.
7. **Pricing note** — unchanged (slate50 box + blue left rule; already on-language).
8. **Next Steps** — kept as a short prose section (quote-specific, genuinely useful).
9. **Navy contact band** — replaces the old two-column "Reach Us" info-grid column and the old
   plain CIN/GSTIN footer's contact role. `CONTACT SALES` label + bold white tagline on the left,
   clickable phone / email · site on the right. Anchored just above the legal line on the last page.
10. **Footers** — Page N of M on continuation pages; legal line (CIN/GSTIN + `© <year> …` +
    Page N of M) on the last page. Requires tracking a `pages[]` array.

Unchanged: A4 size, margins, the QuoteItem → spec-line mapping (`buildSpecLines`), the pricing
note copy, multi-page support for large carts.

## Architecture — shared chrome module

Decision: **extract shared chrome into `lib/pdf/chrome.ts` and refactor BOTH generators onto it**
(single source of truth; existing spec sheet tests guard against regression).

### New file: `lib/pdf/chrome.ts`

Exports:

- **Type** `ChromeCtx` — the minimal shape both generators satisfy:
  ```ts
  interface ChromeCtx {
    doc: PDFDocument;
    page: PDFPage;
    pages: PDFPage[];
    fonts: { regular: PDFFont; bold: PDFFont };
    y: number;
    logo: PDFImage | null;
  }
  ```
  (specSheet's `Ctx` also carries `productName`; the extra field is fine under structural typing.)

- **Constants** (moved verbatim from specSheet.ts): `BAR_H = 6`, `FOOT_FLOOR = 52`,
  `CONT_TOP = A4_HEIGHT - 64`, `BAND_H = 58`.

- `loadLogo(doc): Promise<PDFImage | null>` — the fetch(`/logo.png`) + `embedPng` block with its
  try/catch, extracted so both generators call one implementation.

- `paintPageChrome(ctx: ChromeCtx)` — watermark (10% opacity, centered, width 300) + brand bar.
  MUST run first on every page. Moved verbatim.

- `drawContactBand(ctx, opts?: { tagline?: string })` — navy band. `tagline` defaults to the spec
  sheet's `"Bulk pricing · GST invoice · Pan-India installation"` (both documents use it, so the
  default keeps the spec sheet byte-identical). Label stays `CONTACT SALES`. Clickable phone /
  email / site via `addLinkAnnotation`, sourced from `lib/contact`.

- `drawFootersAndLegal(ctx: ChromeCtx)` — Page N of M on non-last pages, legal line on the last.
  Moved verbatim; identical for both documents.

Document-specific pieces (first-page header, continuation-page header) stay in each generator
because their eyebrow / right-side text differ (`SPEC SHEET · <product>` vs `QUOTE REQUEST · <ref>`).
They call the shared `paintPageChrome` and shared constants.

### `lib/pdf/specSheet.ts` refactor

Delete its local `BAR_H`/`FOOT_FLOOR`/`CONT_TOP`/`BAND_H`, `paintPageChrome`, `drawContactBand`,
`drawFootersAndLegal`, and the inline logo-load block; import them from `chrome.ts`. Pass the
existing tagline explicitly to `drawContactBand` (or rely on the default, which equals it).
`trustCardsFor`, `distributorLineFor`, `seriesLabel`, the KPI strip, spec tables, features, and
overview stay put. No visual change intended — verified by the existing spec sheet tests.

### `lib/pdf/quote.ts` refactor

- Extend `Ctx` to include `pages: PDFPage[]` and `logo: PDFImage | null`.
- In `buildQuotePdf`: call `loadLogo(doc)`, seed `pages: []`, and push the first page.
- Rewrite `drawHeader` to the spec-sheet first-page-header layout (logo icon, company +
  sub-line, `QUOTE REQUEST` eyebrow + ref + issued date, 1.5pt rule). Call `paintPageChrome` first.
- Add `addContinuationPage(ctx)` (company + `QUOTE REQUEST · <ref>` + thin rule) and route
  `drawItemRow`'s page-break through it; push each new page to `ctx.pages`.
- Bump `sectionHeader` to 9.5pt / 1.5pt rule.
- Add zebra fill in `drawItemRow` (alternating `gray50` behind odd rows), dropping the trailing
  per-row hairline.
- Replace `drawInfoGrid` + `drawFooter`: keep a `drawNextSteps` prose section, then call the
  shared `drawContactBand`, then `drawFootersAndLegal` at the very end (after all content, so page
  count is final).
- Align the content floor to `FOOT_FLOOR` (+ band/footer headroom) instead of `MARGIN_BOTTOM`, so
  the band and footer always have room.

## Data flow

`QuoteItemsCard` / `QuoteSubmitForm` → `buildQuotePdf(params)` unchanged (`{ items, totalItems,
quoteRef, quoteDate }`). No signature change; only rendering changes.

## Error handling

Same posture as the spec sheet: every asset load (`/logo.png`) degrades to `null`; `safe()` guards
all text; generation never throws on a missing logo or an odd glyph.

## Testing

- Existing `lib/pdf/specSheet.test.ts` and `lib/pdf/specSheet.brand.test.ts` MUST still pass after
  the extraction (they are the regression guard for the moved chrome).
- Add a smoke test for `buildQuotePdf`: given a small item list it returns a non-empty `Uint8Array`
  whose bytes start with `%PDF`, and (if practical) that page count / link annotations exist.
- Manual: generate a quote from the running site (single item, and a large cart that paginates),
  confirm brand bar, watermark, header, zebra items, navy band, and Page N of M footers render and
  the phone/email/site links are clickable.

## Out of scope

- Restyling the items table beyond zebra + section-header weight (columns/spec mapping unchanged).
- Any change to the spec sheet's own visual output.
- Changes to how the quote ref/date are generated or to the submit flow.
