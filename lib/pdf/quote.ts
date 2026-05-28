/**
 * Quote Request PDF generator (pdf-lib).
 *
 * Multi-page support for large carts. Clickable phone / email / website
 * links via PDF link annotations.
 */

import type { QuoteItem } from "@/context/QuoteContext";

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
  wrapText,
} from "./helpers";

interface QuoteParams {
  items: QuoteItem[];
  totalItems: number;
  quoteRef: string;
  quoteDate: string;
}

interface Ctx {
  doc: import("pdf-lib").PDFDocument;
  page: import("pdf-lib").PDFPage;
  fonts: {
    regular: import("pdf-lib").PDFFont;
    bold: import("pdf-lib").PDFFont;
  };
  y: number;
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

  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);

  const ctx: Ctx = {
    doc,
    page,
    fonts: { regular, bold },
    y: A4_HEIGHT - MARGIN_TOP,
    params,
  };

  drawHeader(ctx);
  drawTitleBlock(ctx);
  drawItemsSection(ctx);
  drawPricingNote(ctx);
  drawInfoGrid(ctx);
  drawFooter(ctx);

  return doc.save();
}

// ── Sections ───────────────────────────────────────────────────────────

function drawHeader(ctx: Ctx) {
  const { page, fonts, params } = ctx;
  const yTop = ctx.y;

  // Brand block (left)
  drawSpacedText(page, safe("APLUS TECHNOLOGY SOLUTIONS"), {
    x: MARGIN_X,
    y: yTop,
    size: 10,
    font: fonts.bold,
    color: C.black,
    characterSpacing: 1.4,
  });
  const addrLines = [
    "Office No. 855, 8th Floor, Supernova Astralis",
    "Sector-94, Noida, Uttar Pradesh 201301",
  ];
  addrLines.forEach((line, i) => {
    page.drawText(safe(line), {
      x: MARGIN_X,
      y: yTop - 14 - i * 11,
      size: 8,
      font: fonts.regular,
      color: C.gray500,
    });
  });

  // Phone + email clickable
  const phone = "+91 93105 09909";
  const email = "info@aplustechsol.com";
  const sep = " • ";
  const fontSize = 8;

  const phoneW = fonts.regular.widthOfTextAtSize(phone, fontSize);
  const sepW = fonts.regular.widthOfTextAtSize(sep, fontSize);
  const emailW = fonts.regular.widthOfTextAtSize(email, fontSize);
  const lineY = yTop - 14 - 2 * 11;

  page.drawText(phone, {
    x: MARGIN_X,
    y: lineY,
    size: fontSize,
    font: fonts.regular,
    color: C.gray700,
  });
  page.drawLine({
    start: { x: MARGIN_X, y: lineY - 1 },
    end: { x: MARGIN_X + phoneW, y: lineY - 1 },
    thickness: 0.4,
    color: C.gray400,
  });
  addLinkAnnotation(ctx.doc, page, "tel:+919310509909", {
    x: MARGIN_X,
    y: lineY - 2,
    width: phoneW,
    height: fontSize + 4,
  });

  page.drawText(sep, {
    x: MARGIN_X + phoneW,
    y: lineY,
    size: fontSize,
    font: fonts.regular,
    color: C.gray400,
  });

  const emailX = MARGIN_X + phoneW + sepW;
  page.drawText(email, {
    x: emailX,
    y: lineY,
    size: fontSize,
    font: fonts.regular,
    color: C.gray700,
  });
  page.drawLine({
    start: { x: emailX, y: lineY - 1 },
    end: { x: emailX + emailW, y: lineY - 1 },
    thickness: 0.4,
    color: C.gray400,
  });
  addLinkAnnotation(ctx.doc, page, "mailto:info@aplustechsol.com", {
    x: emailX,
    y: lineY - 2,
    width: emailW,
    height: fontSize + 4,
  });

  // Meta (right)
  const rightX = A4_WIDTH - MARGIN_X;
  drawRightText(page, fonts.bold, "QUOTE REQUEST", rightX, yTop, 8, C.blue600, 1.8);
  drawRightText(
    page,
    fonts.bold,
    safe(params.quoteRef),
    rightX,
    yTop - 16,
    12,
    C.black
  );
  drawRightText(
    page,
    fonts.regular,
    safe(`Issued ${params.quoteDate}`),
    rightX,
    yTop - 32,
    8,
    C.gray500
  );

  // Rule
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, yTop - 50, 0.75, C.black);
  ctx.y = yTop - 70;
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
      `${params.totalItems} item${params.totalItems !== 1 ? "s" : ""} · Authorized Samsung Commercial Display Distributor`
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
  ensureSpace(ctx, 30);
  const { page, fonts } = ctx;
  drawSpacedText(page, safe(label).toUpperCase(), {
    x: MARGIN_X,
    y: ctx.y,
    size: 8.5,
    font: fonts.bold,
    color: C.black,
    characterSpacing: 1.6,
  });
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y - 6, 0.75, C.black);
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
    safe(`Sizes: ${p.specs.screenSizes.map((s) => `${s}"`).join(" · ")}`),
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
  const specLines = buildSpecLines(item);

  const productHeight = nameLines.length * lineH + 4 + metaSize;
  const specHeight = specLines.length * (metaSize + 4);
  const rowHeight = Math.max(productHeight, specHeight) + 14;

  // Check page space, redraw header on new page
  if (ctx.y - rowHeight < MARGIN_BOTTOM + 70) {
    addNewPage(ctx);
    sectionHeader(ctx, "Items Requested (continued)");
    drawItemsHeader(ctx);
  }

  const rowTop = ctx.y;

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
    const fitted = wrapText(line, fonts.regular, metaSize, COL_SPECS_W - 8);
    page.drawText(fitted[0] ?? "", {
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
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y + 6, 0.4, C.gray100);
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

function drawInfoGrid(ctx: Ctx) {
  ensureSpace(ctx, 110);
  const { page, fonts, doc } = ctx;

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.75, C.black);
  ctx.y -= 16;

  const colGap = 24;
  const col1W = CONTENT_WIDTH * 0.58 - colGap / 2;
  const col2X = MARGIN_X + col1W + colGap;
  const startY = ctx.y;

  // ── Col 1: Next Steps ────────────────────────────────────────────────
  drawSpacedText(page, "NEXT STEPS", {
    x: MARGIN_X,
    y: startY,
    size: 7.5,
    font: fonts.bold,
    color: C.gray500,
    characterSpacing: 1.4,
  });
  const stepsBody = safe(
    "Submit this quote online or share this PDF with our team to receive formal pricing within 24 business hours. This is a quote request, not an invoice — pricing is subject to confirmation."
  );
  const stepLines = wrapText(stepsBody, fonts.regular, 9, col1W);
  stepLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X,
      y: startY - 14 - i * 13,
      size: 9,
      font: fonts.regular,
      color: C.black,
    });
  });

  // ── Col 2: Reach Us ──────────────────────────────────────────────────
  drawSpacedText(page, "REACH US", {
    x: col2X,
    y: startY,
    size: 7.5,
    font: fonts.bold,
    color: C.gray500,
    characterSpacing: 1.4,
  });

  const phoneText = "+91 93105 09909";
  const emailText = "info@aplustechsol.com";
  const siteText = "aplustechsol.com";

  drawLeftLink(
    doc,
    page,
    fonts.bold,
    phoneText,
    col2X,
    startY - 14,
    10,
    C.black,
    "tel:+919310509909"
  );
  drawLeftLink(
    doc,
    page,
    fonts.regular,
    emailText,
    col2X,
    startY - 28,
    9,
    C.blue600,
    "mailto:info@aplustechsol.com"
  );
  drawLeftLink(
    doc,
    page,
    fonts.regular,
    siteText,
    col2X,
    startY - 42,
    9,
    C.blue600,
    "https://www.aplustechsol.com"
  );

  // Column divider
  page.drawLine({
    start: { x: col2X - colGap / 2, y: startY + 4 },
    end: { x: col2X - colGap / 2, y: startY - 60 },
    thickness: 0.4,
    color: C.gray200,
  });

  const usedHeight = Math.max(14 + stepLines.length * 13, 60);
  ctx.y = startY - usedHeight - 18;
}

function drawFooter(ctx: Ctx) {
  ensureSpace(ctx, 50);
  const { page, fonts } = ctx;

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.4, C.gray200);
  ctx.y -= 14;

  // Legal left
  drawSpacedText(page, "CIN", {
    x: MARGIN_X,
    y: ctx.y,
    size: 7,
    font: fonts.bold,
    color: C.gray500,
    characterSpacing: 1,
  });
  page.drawText("U72900DL2020PTC374888", {
    x: MARGIN_X + 22,
    y: ctx.y,
    size: 7.5,
    font: fonts.regular,
    color: C.gray500,
  });
  drawSpacedText(page, "GSTIN", {
    x: MARGIN_X,
    y: ctx.y - 11,
    size: 7,
    font: fonts.bold,
    color: C.gray500,
    characterSpacing: 1,
  });
  page.drawText("07AAUCA5631L1Z6", {
    x: MARGIN_X + 32,
    y: ctx.y - 11,
    size: 7.5,
    font: fonts.regular,
    color: C.gray500,
  });

  // Copy right
  const rightX = A4_WIDTH - MARGIN_X;
  drawRightText(
    page,
    fonts.bold,
    "Aplus Technology Solutions Pvt. Ltd.",
    rightX,
    ctx.y,
    7.5,
    C.gray600
  );
  drawRightText(
    page,
    fonts.regular,
    safe("Authorized Samsung B2B Display Distributor · Pan-India"),
    rightX,
    ctx.y - 11,
    7.5,
    C.gray400
  );
  drawRightText(
    page,
    fonts.regular,
    `© ${new Date().getFullYear()} All rights reserved.`,
    rightX,
    ctx.y - 22,
    7.5,
    C.gray400
  );
}

// ── helpers ────────────────────────────────────────────────────────────

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN_BOTTOM + 40) {
    addNewPage(ctx);
  }
}

function addNewPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.y = A4_HEIGHT - MARGIN_TOP;
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

function drawLeftLink(
  doc: Ctx["doc"],
  page: Ctx["page"],
  font: import("pdf-lib").PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: import("pdf-lib").RGB,
  url: string
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x, y, size, font, color });
  page.drawLine({
    start: { x, y: y - 1 },
    end: { x: x + width, y: y - 1 },
    thickness: 0.4,
    color,
  });
  addLinkAnnotation(doc, page, url, {
    x,
    y: y - 2,
    width,
    height: size + 4,
  });
}
