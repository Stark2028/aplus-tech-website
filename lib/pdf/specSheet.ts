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
import { isLogitech } from "@/lib/brand";

import {
  A4_HEIGHT,
  A4_WIDTH,
  C,
  CONTENT_WIDTH,
  MARGIN_X,
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

const SAMSUNG_TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Samsung Authorized", "Genuine India-spec units, full Samsung warranty, authorized service."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["ISO 9001:2015", "Certified quality management, GST invoicing, bulk pricing."],
];

const LOGITECH_TRUST_CARDS: ReadonlyArray<readonly [string, string]> = [
  ["Supply & Sourcing", "Genuine Logitech room systems supplied across India."],
  ["Pan-India Installation", "Site survey, mounting and commissioning across India."],
  ["AMC & Support", "Ongoing maintenance, GST invoicing and bulk pricing."],
];

/** Trust cards for the spec-sheet's "Why Buy From Aplus" strip, keyed by brand.
 *  Logitech drops all authorized/partner/certified/Samsung claims (positioning
 *  rule); Samsung is unchanged. Always three cards — the layout divides by 3. */
export function trustCardsFor(
  product: Pick<Product, "brand">
): ReadonlyArray<readonly [string, string]> {
  return isLogitech(product) ? LOGITECH_TRUST_CARDS : SAMSUNG_TRUST_CARDS;
}

/** Header sub-line under the company name. Brand-scoped so Logitech sheets
 *  never claim Samsung authorization. */
export function distributorLineFor(product: Pick<Product, "brand">): string {
  return isLogitech(product)
    ? "Commercial Video Conferencing Supply & Installation · India"
    : "Authorized Samsung Commercial Display Distributor & Service Partner · India";
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  fonts: { regular: PDFFont; bold: PDFFont };
  y: number;
  logo: PDFImage | null;
  productName: string;
}

/** "VMB-U" → "VMB-U Series"; "QET Series" → "QET Series" (no doubling). */
function seriesLabel(series: string): string {
  return /series\s*$/i.test(series) ? series : `${series} Series`;
}

export async function buildSpecSheetPdf(product: Product): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  doc.setTitle(`${product.name} — Spec Sheet`);
  doc.setAuthor("Aplus Technology Solutions Pvt. Ltd.");
  doc.setSubject(`${seriesLabel(product.series)} specifications`);
  doc.setProducer("aplustechsol.com");
  doc.setCreator("aplustechsol.com");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Brand + product images. Every failure degrades to null — generation
  // must never fail because an asset didn't load.
  const logo = await loadLogo(doc);

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
  drawTrustStrip(ctx, product);
  if (ctx.y < FOOT_FLOOR + BAND_H + 10) addContinuationPage(ctx);
  drawContactBand(ctx);
  drawFootersAndLegal(ctx);

  return doc.save();
}

// ── Page infrastructure ───────────────────────────────────────────────────

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
  page.drawText(safe(distributorLineFor(product)), {
    x: textX, y: A4_HEIGHT - 43, size: 7.5, font: fonts.regular, color: C.gray500,
  });

  const rightX = A4_WIDTH - MARGIN_X;
  const sheetW = widthOfSpacedText("SPEC SHEET", fonts.bold, 8.5, 1.6);
  drawSpacedText(page, "SPEC SHEET", {
    x: rightX - sheetW, y: A4_HEIGHT - 30, size: 8.5, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  const seriesTxt = safe(seriesLabel(product.series));
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

/**
 * Bold tracked caps + heavy rule. `keepWith` reserves space below the rule so
 * a header can never strand at a page bottom without its first content lines.
 */
function sectionHeader(ctx: Ctx, label: string, keepWith = 0) {
  ensureSpace(ctx, 34 + keepWith);
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

  const eyebrow = safe(`${product.category} · ${seriesLabel(product.series)}`).toUpperCase();
  drawSpacedText(page, eyebrow, {
    x: MARGIN_X, y: ctx.y, size: 8, font: fonts.bold, color: C.blue600, characterSpacing: 2.2,
  });
  ctx.y -= 21;

  for (const line of wrapText(safe(product.name), fonts.bold, 20, titleW)) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 20, font: fonts.bold, color: C.black });
    ctx.y -= 25;
  }
  ctx.y -= 7;

  for (const line of wrapText(safe(product.description), fonts.regular, 9, titleW)) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 9, font: fonts.regular, color: C.gray700 });
    ctx.y -= 14;
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
  ctx.y -= 18;
}

function drawKpiStrip(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;
  const top = ctx.y;
  const stats = [
    { label: "RESOLUTION", value: safe(product.specs.resolution.split("(")[0].trim()) },
    { label: "BRIGHTNESS", value: safe(product.specs.brightness) },
    { label: "OPERATION", value: safe(product.specs.operationTime) },
    { label: "SIZES", value: safe(product.specs.screenSizes.map(formatSize).join(" · ")) },
  ];

  const colW = CONTENT_WIDTH / 4;
  const innerW = colW - 20;

  // Fit each value inside its cell: single line 11→8 pt, then wrap to two
  // lines 8.5→6.5 pt. Values must never overflow into the neighbouring cell.
  const fitted = stats.map((stat) => {
    for (let size = 11; size >= 8; size -= 0.5) {
      if (fonts.bold.widthOfTextAtSize(stat.value, size) <= innerW) {
        return { lines: [stat.value], size };
      }
    }
    for (let size = 8.5; size >= 6.5; size -= 0.5) {
      const lines = wrapText(stat.value, fonts.bold, size, innerW);
      if (lines.length <= 2) return { lines, size };
    }
    return { lines: wrapText(stat.value, fonts.bold, 6.5, innerW).slice(0, 3), size: 6.5 };
  });

  const maxLines = Math.max(...fitted.map((f) => f.lines.length));
  const stripH = 44 + (maxLines - 1) * 11;

  page.drawRectangle({
    x: MARGIN_X, y: top - stripH, width: CONTENT_WIDTH, height: stripH,
    color: C.gray50, borderWidth: 0.5, borderColor: C.gray200,
  });

  stats.forEach((stat, i) => {
    const colX = MARGIN_X + i * colW + 10;
    drawSpacedText(page, stat.label, {
      x: colX, y: top - 15, size: 7, font: fonts.bold, color: C.gray400, characterSpacing: 1.4,
    });
    const { lines, size } = fitted[i];
    lines.forEach((line, li) => {
      page.drawText(line, {
        x: colX, y: top - 32 - li * 11, size, font: fonts.bold, color: C.black,
      });
    });
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
  const { fonts } = ctx;
  const paragraphs = (product.longDescription ?? "").split("\n\n").filter(Boolean);
  if (paragraphs.length === 0) return;

  // Keep the header attached to at least the first three lines of prose.
  const firstLines = wrapText(safe(paragraphs[0]), fonts.regular, 9, CONTENT_WIDTH);
  sectionHeader(ctx, "Product Overview", Math.min(firstLines.length, 3) * 14);

  for (const para of paragraphs) {
    const lines = wrapText(safe(para), fonts.regular, 9, CONTENT_WIDTH);
    for (const line of lines) {
      // Paginate per line so long paragraphs flow instead of stranding headers.
      if (ctx.y < FOOT_FLOOR + 14) addContinuationPage(ctx);
      ctx.page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 9, font: fonts.regular, color: C.gray700 });
      ctx.y -= 14;
    }
    ctx.y -= 6;
  }
  ctx.y -= 6;
}

function drawTrustStrip(ctx: Ctx, product: Product) {
  const { fonts } = ctx;
  const cards = trustCardsFor(product);
  const cardGap = 10;
  const cardW = (CONTENT_WIDTH - cardGap * 2) / 3;
  const bodies = cards.map(([, body]) => wrapText(safe(body), fonts.regular, 7.5, cardW - 20));
  const cardH = 26 + Math.max(...bodies.map((b) => b.length)) * 10;
  ensureSpace(ctx, 34 + cardH);

  sectionHeader(ctx, "Why Buy From Aplus");
  const top = ctx.y;
  cards.forEach(([title], i) => {
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

