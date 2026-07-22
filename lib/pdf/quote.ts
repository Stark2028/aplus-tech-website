/**
 * Quote Request PDF generator (pdf-lib).
 *
 * Multi-page support for large carts. Clickable phone / email / website
 * links via PDF link annotations.
 */

import type { QuoteItem } from "@/context/QuoteContext";
import { formatSize } from "@/lib/formatSize";

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

type PDFDocument = import("pdf-lib").PDFDocument;
type PDFPage = import("pdf-lib").PDFPage;
type PDFFont = import("pdf-lib").PDFFont;
type PDFImage = import("pdf-lib").PDFImage;

interface QuoteParams {
  items: QuoteItem[];
  totalItems: number;
  quoteRef: string;
  quoteDate: string;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  fonts: { regular: PDFFont; bold: PDFFont };
  y: number;
  logo: PDFImage | null;
  params: QuoteParams;
}

export async function buildQuotePdf(params: QuoteParams): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");

  const doc = await PDFDocument.create();
  doc.setTitle(`Quote Request ${params.quoteRef}`);
  doc.setAuthor("Aplus Technology Solutions Pvt. Ltd.");
  doc.setSubject(`Quote request for ${params.totalItems} item(s)`);
  doc.setProducer("aplustechsol.com");
  doc.setCreator("aplustechsol.com");

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
}

// ── Sections ───────────────────────────────────────────────────────────

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

function drawTitleBlock(ctx: Ctx) {
  const { page, fonts, params } = ctx;
  page.drawText("Request for Quote", {
    x: MARGIN_X,
    y: ctx.y,
    size: 22,
    font: fonts.bold,
    color: C.black,
  });
  ctx.y -= 16;
  page.drawText(
    safe(
      `${params.totalItems} item${params.totalItems !== 1 ? "s" : ""} · Commercial Display & Video Conferencing · India`
    ),
    {
      x: MARGIN_X,
      y: ctx.y - 2,
      size: 10,
      font: fonts.regular,
      color: C.gray500,
    }
  );
  ctx.y -= 28;
}

function sectionHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 34);
  const { page, fonts } = ctx;
  drawSpacedText(page, safe(label).toUpperCase(), {
    x: MARGIN_X, y: ctx.y, size: 9.5, font: fonts.bold, color: C.black, characterSpacing: 2,
  });
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - 7, 1.5, C.black);
  ctx.y -= 22;
}

function drawItemsSection(ctx: Ctx) {
  sectionHeader(ctx, "Items Requested");
  drawItemsHeader(ctx);

  for (let i = 0; i < ctx.params.items.length; i++) {
    drawItemRow(ctx, ctx.params.items[i], i);
  }

  // Total row
  ensureSpace(ctx, 36);
  drawHr(ctx.page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 1.25, C.black);
  ctx.y -= 16;
  drawSpacedText(ctx.page, "TOTAL ITEMS", {
    x: MARGIN_X,
    y: ctx.y,
    size: 9,
    font: ctx.fonts.bold,
    color: C.black,
    characterSpacing: 1.4,
  });
  const total = String(ctx.params.totalItems);
  drawRightText(
    ctx.page,
    ctx.fonts.bold,
    total,
    A4_WIDTH - MARGIN_X,
    ctx.y,
    13,
    C.black
  );
  ctx.y -= 22;
}

const COL_NUM_X = MARGIN_X;
const COL_NUM_W = 30;
const COL_QTY_W = 50;
const COL_PRODUCT_W = (CONTENT_WIDTH - COL_NUM_W - COL_QTY_W) * 0.58;
const COL_SPECS_W = CONTENT_WIDTH - COL_NUM_W - COL_QTY_W - COL_PRODUCT_W - 12;

function drawItemsHeader(ctx: Ctx) {
  const { page, fonts } = ctx;
  const y = ctx.y;
  drawSpacedText(page, "#", {
    x: COL_NUM_X,
    y,
    size: 7,
    font: fonts.bold,
    color: C.gray400,
    characterSpacing: 1.2,
  });
  drawSpacedText(page, "PRODUCT", {
    x: COL_NUM_X + COL_NUM_W,
    y,
    size: 7,
    font: fonts.bold,
    color: C.gray400,
    characterSpacing: 1.2,
  });
  drawSpacedText(page, "SPECIFICATIONS", {
    x: COL_NUM_X + COL_NUM_W + COL_PRODUCT_W,
    y,
    size: 7,
    font: fonts.bold,
    color: C.gray400,
    characterSpacing: 1.2,
  });
  drawRightText(
    page,
    fonts.bold,
    "QTY",
    A4_WIDTH - MARGIN_X,
    y,
    7,
    C.gray400,
    1.2
  );

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, y - 8, 0.5, C.gray200);
  ctx.y -= 22;
}

function buildSpecLines(item: QuoteItem): string[] {
  const p = item.product;
  const lines: string[] = [
    safe(p.specs.resolution),
    safe(p.specs.brightness),
    safe(`Sizes: ${p.specs.screenSizes.map(formatSize).join(" · ")}`),
  ];

  // Append up to 3 extra specs from specGroups (flattened) or additionalSpecs
  const extras: string[] = [];
  if (p.specGroups) {
    for (const group of Object.values(p.specGroups)) {
      for (const [k, v] of Object.entries(group)) {
        extras.push(safe(`${k}: ${v}`));
        if (extras.length === 3) break;
      }
      if (extras.length === 3) break;
    }
  } else if (p.additionalSpecs) {
    for (const [k, v] of Object.entries(p.additionalSpecs)) {
      extras.push(safe(`${k}: ${v}`));
      if (extras.length === 3) break;
    }
  }

  return [...lines, ...extras];
}

function drawItemRow(ctx: Ctx, item: QuoteItem, idx: number) {
  const { page, fonts } = ctx;
  const fontSize = 9;
  const metaSize = 8;
  const lineH = 12;

  // Build text content first to measure block height
  const nameLines = wrapText(
    safe(item.product.name),
    fonts.bold,
    fontSize,
    COL_PRODUCT_W - 8
  );
  const metaText = safe(
    `${item.product.series} · ${item.product.category}`
  );
  // Pre-wrap every spec line to the column width so long values render in
  // full (and the row height accounts for the extra lines) instead of being
  // silently truncated to their first wrapped line.
  const specLines = buildSpecLines(item).flatMap((line) =>
    wrapText(line, fonts.regular, metaSize, COL_SPECS_W - 8)
  );

  const productHeight = nameLines.length * lineH + 4 + metaSize;
  const specHeight = specLines.length * (metaSize + 4);
  const rowHeight = Math.max(productHeight, specHeight) + 14;

  // Check page space, redraw header on new page
  if (ctx.y - rowHeight < FOOT_FLOOR) {
    addContinuationPage(ctx);
    sectionHeader(ctx, "Items Requested (continued)");
    drawItemsHeader(ctx);
  }

  const rowTop = ctx.y;

  if (idx % 2 === 1) {
    page.drawRectangle({
      x: MARGIN_X,
      y: rowTop + 7 - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: C.gray50,
    });
  }

  // # number
  page.drawText(String(idx + 1).padStart(2, "0"), {
    x: COL_NUM_X,
    y: rowTop,
    size: fontSize,
    font: fonts.regular,
    color: C.gray400,
  });

  // Product name
  nameLines.forEach((line, i) => {
    page.drawText(line, {
      x: COL_NUM_X + COL_NUM_W,
      y: rowTop - i * lineH,
      size: fontSize,
      font: fonts.bold,
      color: C.black,
    });
  });
  // Product meta
  page.drawText(metaText, {
    x: COL_NUM_X + COL_NUM_W,
    y: rowTop - nameLines.length * lineH - 2,
    size: metaSize,
    font: fonts.regular,
    color: C.gray500,
  });

  // Specifications
  const specsX = COL_NUM_X + COL_NUM_W + COL_PRODUCT_W;
  specLines.forEach((line, i) => {
    page.drawText(line, {
      x: specsX,
      y: rowTop - i * (metaSize + 4),
      size: metaSize,
      font: fonts.regular,
      color: C.gray700,
    });
  });

  // Qty (right-aligned, bold)
  drawRightText(
    page,
    fonts.bold,
    String(item.quantity),
    A4_WIDTH - MARGIN_X,
    rowTop,
    11,
    C.black
  );

  ctx.y -= rowHeight;
}

function drawPricingNote(ctx: Ctx) {
  ensureSpace(ctx, 70);
  const { page, fonts } = ctx;
  const startY = ctx.y;
  const padX = 16;
  const padY = 12;

  const body = safe(
    "Final pricing will be issued by our sales team within 24 business hours of submission. Volume discounts apply on orders of 5+ units. All prices are exclusive of GST; a formal GST invoice is issued with order confirmation."
  );
  const bodyLines = wrapText(
    body,
    fonts.regular,
    8.5,
    CONTENT_WIDTH - padX * 2
  );
  const boxH = padY * 2 + 14 + bodyLines.length * 12;

  // Background
  page.drawRectangle({
    x: MARGIN_X,
    y: startY - boxH,
    width: CONTENT_WIDTH,
    height: boxH,
    color: C.slate50,
  });
  // Blue left rule
  page.drawRectangle({
    x: MARGIN_X,
    y: startY - boxH,
    width: 3,
    height: boxH,
    color: C.blue600,
  });

  // Label
  drawSpacedText(page, "PRICING", {
    x: MARGIN_X + padX,
    y: startY - padY - 8,
    size: 7.5,
    font: fonts.bold,
    color: C.blue600,
    characterSpacing: 1.6,
  });

  bodyLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X + padX,
      y: startY - padY - 22 - i * 12,
      size: 8.5,
      font: fonts.regular,
      color: C.gray700,
    });
  });

  ctx.y = startY - boxH - 22;
}

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

// ── helpers ────────────────────────────────────────────────────────────

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < FOOT_FLOOR) addContinuationPage(ctx);
}

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

function drawRightText(
  page: Ctx["page"],
  font: import("pdf-lib").PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
  color: import("pdf-lib").RGB,
  characterSpacing = 0
) {
  const width =
    font.widthOfTextAtSize(text, size) +
    characterSpacing * Math.max(0, text.length - 1);
  drawSpacedText(page, text, {
    x: rightX - width,
    y,
    size,
    font,
    color,
    characterSpacing,
  });
}

