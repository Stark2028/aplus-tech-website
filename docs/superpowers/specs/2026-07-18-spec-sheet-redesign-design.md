# Spec Sheet PDF Redesign — "Manufacturer Pro"

**Date:** 2026-07-18
**Status:** Approved by user (visual mockups reviewed in brainstorming session; direction "A · Manufacturer Pro" chosen, logo + watermark additions requested and applied)
**Scope:** Rewrite the layout of the generated per-product spec sheet PDF in `lib/pdf/specSheet.ts`. No changes to product data, download flow, or lead gate.

## Problem

The current generated spec sheet reads as a plain table dump: no product image, no logo, one spec per line with oversized rows, a sparse second page, and weak branding. The user wants a commercial-grade datasheet comparable to manufacturer (Samsung/LG/NEC) enterprise spec sheets, produced automatically for every product.

Confirmed pain points (all four): looks plain/template-y · no product image · wasteful sparse layout · weak branding/typography.

## Approach decision

**Chosen: keep the existing client-side pdf-lib generator and rewrite the layout code.**

- pdf-lib was chosen originally because clickable link annotations survive Safari's Save-as-PDF (browser print → PDF loses them). That reason still holds.
- The existing helpers (`wrapText`, `drawSpacedText`, `safe`, `addLinkAnnotation`, `imageToPngBytes`) are reused as-is.
- Rejected: HTML-to-PDF via print CSS (loses link annotations, fonts inconsistent across browsers) and server-side rendering (new infra for no user-visible gain).
- No new dependencies. Fonts stay `StandardFonts.Helvetica` / `HelveticaBold` (no fontkit, no bundle growth).

## Page architecture

A4 portrait, two pages for typical products (specs may spill to more; layout adapts).

### Page 1 — the datasheet

Top to bottom:

1. **Brand bar** — full-bleed solid rectangle across the very top, 6 pt tall, brand blue `#2563eb`.
2. **Header** — left: Aplus logo (`/logo.png`, ~30 pt square) beside a two-line block: "APLUS TECHNOLOGY SOLUTIONS" (bold, tracked, ~10.5 pt) over "Authorized Samsung Commercial Display Distributor · India" (7.5 pt gray). Right-aligned: "SPEC SHEET" (bold tracked) over series name and document date (en-IN format). Bottom edge: 1.5 pt black rule.
3. **Title zone** — two cells:
   - Left (~62% width): blue tracked eyebrow `{CATEGORY} · {SERIES} SERIES` (uppercase), product name at 20 pt bold (wraps), short `description` at ~8.5 pt gray.
   - Right (~38%): product photo (first entry of `product.images`, AVIF → PNG via `imageToPngBytes`) centered on a light panel (gray-50 fill, hairline border), aspect-fit.
4. **KPI strip** — bordered 4-cell row (gray-50 fills, hairline dividers): RESOLUTION / BRIGHTNESS / OPERATION / SIZES. Tiny tracked gray labels, bold ~10.5 pt values. Values auto-shrink (existing logic) down to 6.5 pt to fit; sizes joined with " · ".
5. **Key Features** — section header (black tracked caps + 1.5 pt rule), then features in a two-column checklist with small blue square bullets, ~8.5 pt, tight leading. Any count wraps; odd counts leave the last cell empty.
6. **Technical Specifications** — section header, then **two side-by-side columns** of spec group tables (see "Spec table system").
7. **Page footer** (every page) — hairline rule, "Aplus Technology Solutions · aplustechsol.com" left, "Page N of M" right, 7 pt gray.

### Page 2+ — continuation and pitch

1. **Slim continuation header** (every page after 1) — brand bar (same 6 pt blue), small logo (~16 pt) + "APLUS TECHNOLOGY SOLUTIONS" left, "SPEC SHEET · {product name}" right, hairline rule. No date repeat.
2. **Spec continuation** — if page 1 columns overflowed, remaining groups continue in the same two-column system.
3. **Product Overview** — section header + `longDescription` paragraphs, ~9 pt, 1.6 line-height, gray-700.
4. **Why Buy From Aplus** — section header + three bordered cards in a row (static copy, same for all products):
   - "Samsung Authorized" — Genuine India-spec units with full Samsung warranty.
   - "Pan-India Installation" — Site survey, mounting and commissioning across India.
   - "ISO 9001:2015" — Certified quality management, GST invoicing, bulk pricing.
5. **Contact band** — full-content-width dark navy (`#0f172a`) block: left "CONTACT SALES" tracked gray-blue + "Bulk pricing · GST invoice · Pan-India installation" bold white; right phone (bold white, `tel:` link), email + site (light blue `#93c5fd`, `mailto:`/https links). All three clickable via `addLinkAnnotation`.
6. **Legal line** — CIN + GSTIN left; "© {year} Aplus Technology Solutions Pvt. Ltd. · Specifications subject to change · Page N of M" right, 7 pt gray. On the last page this legal line **replaces** the standard page footer (no stacked double footer).

The contact band + legal always sit at the **bottom of the last page** (drawn after content, anchored to the bottom margin). If content would collide, a new page is added first.

### Watermark (every page)

Aplus logo PNG, centered on the page, ~300 pt wide, drawn at **opacity 0.10** (user-requested bump from the original 0.05), upright. Drawn FIRST on each page (immediately after page creation, including pages created by pagination) so all content renders above it. `pdf-lib` `drawImage` supports `opacity` directly.

## Spec table system (the density fix)

- Content area splits into two columns: `colW = (CONTENT_WIDTH - 14) / 2`.
- **Row style:** label (gray, regular) / value (black, bold) at **8.5 pt**, line height ~11 pt, vertical padding ~4 pt (≈19 pt per single-line row vs ~29 pt today), alternating gray-50 row shading, hairline bottom border per row. Label gets ~47% of column width; value wraps.
- **Group header:** blue-50 band, 3 pt blue left accent, blue-700 tracked caps, ~18 pt tall.
- **Column flow algorithm (greedy first-fit, order-preserving):**
  1. Measure each group's height (header + sum of measured row heights) using `wrapText` at final font sizes.
  2. Fill the left column top-down with whole groups until the next group doesn't fit the remaining column height; continue in the right column; when both columns are full, continue on the next page (two fresh columns under the slim header).
  3. A single group taller than a full empty column is split across columns/pages; the continuation column repeats the group header with " (CONT.)" suffix.
- **Flat fallback** (products without `specGroups`): synthesize one group "Specifications" from `specs` + `additionalSpecs` and run it through the same two-column system.

## Graceful degradation rules

- **No product image / image fails to load:** title zone spans full width; no empty panel. (`imageToPngBytes` already returns `null` on failure — generation must never fail because of an image.)
- **Logo fails to load:** header renders text-only (current behavior), watermark skipped.
- **Long product names:** wrap up to 3 lines at 20 pt (no auto-shrink needed at A4 width).
- **Many sizes (e.g. QET's 7):** existing KPI auto-shrink handles it.
- **No `longDescription`:** Product Overview section omitted; page 2 may collapse into page 1's remainder — contact band still anchors to the bottom of the last page.
- **Any feature/spec text:** passes through `safe()` (WinAnsi transliteration) exactly as today.

## Technical notes

- **File changed:** `lib/pdf/specSheet.ts` (full layout rewrite). `lib/pdf/helpers.ts` gains at most: a navy color token (`C.navy = #0f172a`), and an `embedLogo`/opacity-drawing helper if needed. No API changes — `buildSpecSheetPdf(product)` signature unchanged, so `SpecSheetButton` and the lead gate flow are untouched.
- **Logo embedding:** fetch `/logo.png` → `doc.embedPng` (already PNG; no canvas conversion). Runs client-side like today.
- **Page N of M:** page count is known only after layout; keep references to all created pages and draw footers in a final pass.
- **Image sizing:** product photo drawn aspect-fit inside its panel (compute scale from embedded image dims); cap embedded resolution via existing 1600 px cap in `imageToPngBytes`.
- **Two-column layout state:** the `Ctx` object gains column awareness (`colIndex`, `colTopY`) during the spec section only; the rest of the document remains single-flow.

## Testing / verification

- Unit-testable pieces (pure): column flow/balancing given group heights, row height measurement. Add tests if practical without a DOM (pdf-lib runs in Node).
- Runtime verification via the `verify` skill: generate PDFs for (a) VMB-U 46 (grouped specs, 1 size, image), (b) QET Series (7 sizes, long feature list), (c) a product without `specGroups`, and (d) a product with a missing image path. Check: no crash, correct page count/footers, no overlapping text, contact links clickable, watermark subtle.
- Visual check against the approved mockup (`.superpowers/brainstorm/4740-1784358437/content/design-full-v2.html`).

## Out of scope

- Quote PDF (`QuoteItemsCard`) restyle — separate task if wanted later.
- Per-product model-code/SKU additions to data (tracked separately by the catalog work).
- Server-side PDF generation or custom font embedding.
