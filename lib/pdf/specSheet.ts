/**
 * Spec Sheet PDF generator (pdf-lib).
 *
 * Clean two-column tabular layout — no hero image.
 * Sections rendered with alternating row shading and blue group headers.
 */

import type { Product } from "@/data/products";

import {
  A4_HEIGHT,
  A4_WIDTH,
  C,
  CONTENT_WIDTH,
  MARGIN_BOTTOM,
  MARGIN_TOP,
  MARGIN_X,
  addLinkAnnotation,
  drawHr,
  drawSpacedText,
  safe,
  widthOfSpacedText,
  wrapText,
} from "./helpers";

interface Ctx {
  doc: import("pdf-lib").PDFDocument;
  page: import("pdf-lib").PDFPage;
  fonts: {
    regular: import("pdf-lib").PDFFont;
    bold: import("pdf-lib").PDFFont;
  };
  y: number;
}

// Column layout for the two-column spec table
const LABEL_W = CONTENT_WIDTH * 0.40;       // 40% for labels
const COL_GAP = 14;                          // gap between columns
const VALUE_X = MARGIN_X + LABEL_W + COL_GAP;
const VALUE_W = CONTENT_WIDTH - LABEL_W - COL_GAP;
const ROW_FONT_SIZE = 9;
const ROW_LINE_H = 15;                       // generous line-height (was 13)
const ROW_PAD_V = 7;                         // vertical padding — must exceed ascender height (~6.5pt for 9pt Helvetica)

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

  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  const ctx: Ctx = {
    doc,
    page,
    fonts: { regular, bold },
    y: A4_HEIGHT - MARGIN_TOP,
  };

  const docDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  drawHeader(ctx, product, docDate);
  drawTitleBlock(ctx, product);
  drawStatsStrip(ctx, product);

  if (product.specGroups) {
    drawSpecsGrouped(ctx, product);
  } else {
    drawSpecsFlat(ctx, product);
  }

  if (product.features.length > 0) {
    drawFeatures(ctx, product);
  }

  if (product.longDescription) {
    drawOverview(ctx, product);
  }

  drawContactAndFooter(ctx);

  return doc.save();
}

// ── Header ────────────────────────────────────────────────────────────────

function drawHeader(ctx: Ctx, product: Product, docDate: string) {
  const { page, fonts } = ctx;
  const yTop = ctx.y;

  drawSpacedText(page, safe("APLUS TECHNOLOGY SOLUTIONS"), {
    x: MARGIN_X,
    y: yTop,
    size: 9,
    font: fonts.bold,
    color: C.black,
    characterSpacing: 1.4,
  });
  page.drawText(
    safe("Authorized Samsung Commercial Display Distributor · Noida, India"),
    { x: MARGIN_X, y: yTop - 12, size: 7.5, font: fonts.regular, color: C.gray500 }
  );

  const metaLines: { text: string; bold?: boolean }[] = [
    { text: "SPEC SHEET", bold: true },
    { text: safe(product.series) },
    { text: docDate },
  ];
  metaLines.forEach((line, i) => {
    const font = line.bold ? fonts.bold : fonts.regular;
    const size = 7.5;
    const tracking = line.bold ? 1.4 : 0;
    const w = widthOfSpacedText(line.text, font, size, tracking);
    drawSpacedText(page, line.text, {
      x: A4_WIDTH - MARGIN_X - w,
      y: yTop - i * 11,
      size,
      font,
      color: line.bold ? C.black : C.gray500,
      characterSpacing: tracking,
    });
  });

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, yTop - 28, 0.75, C.black);
  ctx.y = yTop - 44;
}

// ── Title block ───────────────────────────────────────────────────────────

function drawTitleBlock(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;

  // Eyebrow
  const eyebrow = safe(
    `${product.category}${product.subCategory ? ` · ${product.subCategory}` : ""}`
  ).toUpperCase();
  drawSpacedText(page, eyebrow, {
    x: MARGIN_X,
    y: ctx.y,
    size: 7.5,
    font: fonts.bold,
    color: C.blue600,
    characterSpacing: 1.8,
  });
  ctx.y -= 16;

  // Product name
  const titleLines = wrapText(safe(product.name), fonts.bold, 20, CONTENT_WIDTH);
  for (const line of titleLines) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 20, font: fonts.bold, color: C.black });
    ctx.y -= 24;
  }

  // Series subtitle
  page.drawText(safe(`${product.series} Series`), {
    x: MARGIN_X, y: ctx.y, size: 9.5, font: fonts.regular, color: C.gray500,
  });
  ctx.y -= 20;

  // Short description
  const descLines = wrapText(safe(product.description), fonts.regular, 9, CONTENT_WIDTH);
  for (const line of descLines) {
    page.drawText(line, { x: MARGIN_X, y: ctx.y, size: 9, font: fonts.regular, color: C.gray700 });
    ctx.y -= 13;
  }
  ctx.y -= 10;
}

// ── Stats strip ───────────────────────────────────────────────────────────

function drawStatsStrip(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;
  const top = ctx.y;
  const stripH = 42;

  const stats = [
    { label: "RESOLUTION", value: safe(product.specs.resolution.split("(")[0].trim()) },
    { label: "BRIGHTNESS", value: safe(product.specs.brightness) },
    { label: "OPERATION", value: safe(product.specs.operationTime) },
    { label: "SIZES", value: safe(product.specs.screenSizes.map((s) => `${s}"`).join(" • ")) },
  ];

  // Background fill
  page.drawRectangle({
    x: MARGIN_X, y: top - stripH,
    width: CONTENT_WIDTH, height: stripH,
    color: C.gray50,
    borderWidth: 0.5, borderColor: C.gray200,
  });

  const colW = CONTENT_WIDTH / 4;
  const colPadX = 10;
  const innerW = colW - colPadX * 2;

  stats.forEach((stat, i) => {
    const colX = MARGIN_X + i * colW + colPadX;
    drawSpacedText(page, stat.label, {
      x: colX, y: top - 14,
      size: 7, font: fonts.bold, color: C.gray400, characterSpacing: 1.2,
    });

    // Auto-fit value: shrink font size until it fits the column
    let valueSize = 10;
    while (
      valueSize > 6.5 &&
      fonts.bold.widthOfTextAtSize(stat.value, valueSize) > innerW
    ) {
      valueSize -= 0.5;
    }

    page.drawText(stat.value, {
      x: colX, y: top - 30,
      size: valueSize, font: fonts.bold, color: C.black,
    });

    if (i > 0) {
      page.drawLine({
        start: { x: MARGIN_X + i * colW, y: top - 6 },
        end: { x: MARGIN_X + i * colW, y: top - stripH + 6 },
        thickness: 0.5, color: C.gray200,
      });
    }
  });

  ctx.y = top - stripH - 22;
}

// ── Product overview ──────────────────────────────────────────────────────

function drawOverview(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Product Overview");
  const { page, fonts } = ctx;
  const fontSize = 9;
  const lineH = 14;
  const paragraphs = (product.longDescription ?? "").split("\n\n").filter(Boolean);
  for (const para of paragraphs) {
    const lines = wrapText(safe(para), fonts.regular, fontSize, CONTENT_WIDTH);
    ensureSpace(ctx, lines.length * lineH + 10);
    for (const line of lines) {
      page.drawText(line, { x: MARGIN_X, y: ctx.y, size: fontSize, font: fonts.regular, color: C.gray700 });
      ctx.y -= lineH;
    }
    ctx.y -= 6;
  }
  ctx.y -= 8;
}

// ── Key features ──────────────────────────────────────────────────────────

function drawFeatures(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Key Features");
  const { page, fonts } = ctx;
  const colW = CONTENT_WIDTH / 2 - 12;
  const fontSize = 9;
  const lineH = 13;

  const half = Math.ceil(product.features.length / 2);
  const cols = [product.features.slice(0, half), product.features.slice(half)];
  const startY = ctx.y;
  let minY = startY;

  cols.forEach((col, ci) => {
    let cy = startY;
    const x = MARGIN_X + ci * (colW + 24);
    for (const feat of col) {
      const lines = wrapText(safe(feat), fonts.regular, fontSize, colW - 14);
      ensureSpace(ctx, lines.length * lineH + 4);
      page.drawRectangle({ x: x + 3, y: cy + 3, width: 4, height: 1, color: C.blue600 });
      lines.forEach((line, li) => {
        page.drawText(line, { x: x + 14, y: cy - li * lineH, size: fontSize, font: fonts.regular, color: C.gray700 });
      });
      cy -= lines.length * lineH + 5;
    }
    if (cy < minY) minY = cy;
  });

  ctx.y = minY - 16;
}

// ── Spec table helpers ────────────────────────────────────────────────────

function drawSpecRow(
  ctx: Ctx,
  label: string,
  value: string,
  shaded: boolean
) {
  const { fonts } = ctx;
  const labelLines = wrapText(safe(label), fonts.regular, ROW_FONT_SIZE, LABEL_W - 6);
  const valueLines = wrapText(safe(value), fonts.bold, ROW_FONT_SIZE, VALUE_W - 4);
  const contentLines = Math.max(labelLines.length, valueLines.length);
  const rowH = contentLines * ROW_LINE_H + ROW_PAD_V * 2;

  ensureSpace(ctx, rowH + 2);

  if (shaded) {
    ctx.page.drawRectangle({
      x: MARGIN_X, y: ctx.y - rowH,
      width: CONTENT_WIDTH, height: rowH,
      color: C.gray50,
    });
  }

  // Vertical separator between label and value columns
  ctx.page.drawLine({
    start: { x: MARGIN_X + LABEL_W + COL_GAP / 2, y: ctx.y },
    end:   { x: MARGIN_X + LABEL_W + COL_GAP / 2, y: ctx.y - rowH },
    thickness: 0.4,
    color: C.gray200,
  });

  // Vertically center shorter column when lines differ
  const labelOffset = Math.round((contentLines - labelLines.length) * ROW_LINE_H / 2);
  const valueOffset = Math.round((contentLines - valueLines.length) * ROW_LINE_H / 2);

  labelLines.forEach((line, i) => {
    ctx.page.drawText(line, {
      x: MARGIN_X + 6,
      y: ctx.y - ROW_PAD_V - labelOffset - i * ROW_LINE_H,
      size: ROW_FONT_SIZE, font: fonts.regular, color: C.gray600,
    });
  });
  valueLines.forEach((line, i) => {
    ctx.page.drawText(line, {
      x: VALUE_X,
      y: ctx.y - ROW_PAD_V - valueOffset - i * ROW_LINE_H,
      size: ROW_FONT_SIZE, font: fonts.bold, color: C.black,
    });
  });

  // Bottom divider — full width
  drawHr(ctx.page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - rowH, 0.4, C.gray200);
  ctx.y -= rowH;
}

function drawGroupHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 46);
  const { fonts } = ctx;

  ctx.page.drawRectangle({
    x: MARGIN_X, y: ctx.y - 22,
    width: CONTENT_WIDTH, height: 22,
    color: C.blue50,
  });
  // Left accent bar
  ctx.page.drawRectangle({
    x: MARGIN_X, y: ctx.y - 22,
    width: 3, height: 22,
    color: C.blue600,
  });
  drawSpacedText(ctx.page, safe(label).toUpperCase(), {
    x: MARGIN_X + 10, y: ctx.y - 14,
    size: 7.5, font: fonts.bold, color: C.blue700, characterSpacing: 1.4,
  });
  ctx.y -= 22;
}

// ── Technical specs — grouped ─────────────────────────────────────────────

function drawSpecsGrouped(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Technical Specifications");

  // Outer border around entire table
  const tableTopY = ctx.y;

  let rowIndex = 0;
  for (const [group, rows] of Object.entries(product.specGroups!)) {
    const rowEntries = Object.entries(rows);
    if (rowEntries.length === 0) continue;

    drawGroupHeader(ctx, group);

    for (const [label, value] of rowEntries) {
      drawSpecRow(ctx, label, value, rowIndex % 2 === 0);
      rowIndex++;
    }
  }

  // Draw outer border retroactively is complex in pdf-lib; draw a left + right rule instead
  void tableTopY;
  ctx.y -= 8;
}

// ── Technical specs — flat fallback ──────────────────────────────────────

function drawSpecsFlat(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Technical Specifications");

  const rows: [string, string][] = [
    ["Resolution", product.specs.resolution],
    ["Brightness", product.specs.brightness],
    ["Available Sizes", product.specs.screenSizes.map((s) => `${s}"`).join(" · ")],
    ["Operation Hours", product.specs.operationTime],
    ["Series", product.series],
  ];

  if (product.additionalSpecs) {
    const seen = new Set(rows.map(([l]) => l.toLowerCase()));
    for (const [label, value] of Object.entries(product.additionalSpecs)) {
      if (!seen.has(label.toLowerCase())) rows.push([label, value]);
    }
  }

  rows.forEach(([label, value], i) => drawSpecRow(ctx, label, value, i % 2 === 0));
  ctx.y -= 8;
}

// ── Section header (bold label + heavy rule) ──────────────────────────────

function sectionHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 28);
  const { page, fonts } = ctx;
  drawSpacedText(page, safe(label).toUpperCase(), {
    x: MARGIN_X, y: ctx.y,
    size: 8.5, font: fonts.bold, color: C.black, characterSpacing: 1.6,
  });
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - 7, 0.75, C.black);
  ctx.y -= 20;
}

// ── Pagination ────────────────────────────────────────────────────────────

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN_BOTTOM + 60) {
    ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
    ctx.y = A4_HEIGHT - MARGIN_TOP;
  }
}

// ── Contact + footer ──────────────────────────────────────────────────────

function drawContactAndFooter(ctx: Ctx) {
  ensureSpace(ctx, 90);
  const { doc, page, fonts } = ctx;

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.75, C.black);
  ctx.y -= 14;

  drawSpacedText(page, "CONTACT SALES", {
    x: MARGIN_X, y: ctx.y,
    size: 7.5, font: fonts.bold, color: C.gray500, characterSpacing: 1.6,
  });
  page.drawText(safe("Bulk pricing • GST invoice • Pan-India installation"), {
    x: MARGIN_X, y: ctx.y - 14, size: 10, font: fonts.bold, color: C.black,
  });

  const rightX = A4_WIDTH - MARGIN_X;
  drawRightAlignedLink(doc, page, fonts.bold, "+91 93105 09909", rightX, ctx.y, 10.5, C.black, "tel:+919310509909");
  drawRightAlignedLink(doc, page, fonts.regular, "sales@aplustechsol.com", rightX, ctx.y - 14, 9, C.blue600, "mailto:sales@aplustechsol.com");
  drawRightAlignedLink(doc, page, fonts.regular, "aplustechsol.com", rightX, ctx.y - 27, 9, C.blue600, "https://www.aplustechsol.com");

  ctx.y -= 50;

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.4, C.gray200);
  ctx.y -= 14;

  // CIN / GSTIN
  drawSpacedText(page, "CIN", { x: MARGIN_X, y: ctx.y, size: 7, font: fonts.bold, color: C.gray500, characterSpacing: 1 });
  page.drawText("U72900DL2020PTC374888", { x: MARGIN_X + 22, y: ctx.y, size: 7.5, font: fonts.regular, color: C.gray500 });
  drawSpacedText(page, "GSTIN", { x: MARGIN_X, y: ctx.y - 11, size: 7, font: fonts.bold, color: C.gray500, characterSpacing: 1 });
  page.drawText("07AAUCA5631L1Z6", { x: MARGIN_X + 32, y: ctx.y - 11, size: 7.5, font: fonts.regular, color: C.gray500 });

  // Copyright
  const copyR1 = safe(`© ${new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd.`);
  const copyR2 = "All specifications subject to change without notice.";
  drawRightText(page, fonts.regular, copyR1, rightX, ctx.y, 7.5, C.gray400);
  drawRightText(page, fonts.regular, copyR2, rightX, ctx.y - 11, 7.5, C.gray400);
}

// ── Drawing utilities ─────────────────────────────────────────────────────

function drawRightText(
  page: Ctx["page"], font: import("pdf-lib").PDFFont,
  text: string, rightX: number, y: number, size: number,
  color: import("pdf-lib").RGB
) {
  page.drawText(text, { x: rightX - font.widthOfTextAtSize(text, size), y, size, font, color });
}

function drawRightAlignedLink(
  doc: Ctx["doc"], page: Ctx["page"], font: import("pdf-lib").PDFFont,
  text: string, rightX: number, y: number, size: number,
  color: import("pdf-lib").RGB, url: string
) {
  const w = font.widthOfTextAtSize(text, size);
  const x = rightX - w;
  page.drawText(text, { x, y, size, font, color });
  page.drawLine({ start: { x, y: y - 1 }, end: { x: rightX, y: y - 1 }, thickness: 0.4, color });
  addLinkAnnotation(doc, page, url, { x, y: y - 2, width: w, height: size + 4 });
}
