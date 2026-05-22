/**
 * Spec Sheet PDF generator (pdf-lib).
 *
 * Produces a real PDF with embedded fonts, vector text, and clickable
 * contact links that survive any browser's Save-as-PDF — including Safari.
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
  imageToPngBytes,
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

  // ── HEADER ────────────────────────────────────────────────────────────
  drawHeader(ctx, product, docDate);

  // ── TITLE BLOCK ───────────────────────────────────────────────────────
  drawTitle(ctx, product);

  // ── HERO IMAGE ────────────────────────────────────────────────────────
  await drawHero(ctx, product);

  // ── DESCRIPTION ───────────────────────────────────────────────────────
  drawDescription(ctx, product);

  // ── STATS STRIP ───────────────────────────────────────────────────────
  drawStats(ctx, product);

  // ── KEY FEATURES ──────────────────────────────────────────────────────
  if (product.features.length > 0) {
    drawFeatures(ctx, product);
  }

  // ── TECHNICAL SPECIFICATIONS ──────────────────────────────────────────
  drawSpecsTable(ctx, product);

  // ── CONTACT STRIP + FOOTER (always at bottom of last page) ────────────
  drawContactAndFooter(ctx);

  return doc.save();
}

// ── Sections ───────────────────────────────────────────────────────────

function drawHeader(ctx: Ctx, product: Product, docDate: string) {
  const { page, fonts } = ctx;
  const yTop = ctx.y;

  // Brand (left)
  drawSpacedText(page, safe("APLUS TECHNOLOGY SOLUTIONS"), {
    x: MARGIN_X,
    y: yTop,
    size: 9,
    font: fonts.bold,
    color: C.black,
    characterSpacing: 1.4,
  });
  page.drawText(
    safe(
      "Authorized Samsung Commercial Display Distributor · Noida, India"
    ),
    {
      x: MARGIN_X,
      y: yTop - 12,
      size: 7.5,
      font: fonts.regular,
      color: C.gray500,
    }
  );

  // Meta (right)
  const metaLines: { text: string; bold?: boolean; color?: typeof C.black }[] =
    [
      { text: "SPEC SHEET", bold: true, color: C.black },
      { text: safe(product.series), color: C.gray500 },
      { text: docDate, color: C.gray500 },
    ];
  metaLines.forEach((line, i) => {
    const font = line.bold ? fonts.bold : fonts.regular;
    const size = 7.5;
    const tracking = line.bold ? 1.4 : 0;
    const width = widthOfSpacedText(line.text, font, size, tracking);
    drawSpacedText(page, line.text, {
      x: A4_WIDTH - MARGIN_X - width,
      y: yTop - i * 11,
      size,
      font,
      color: line.color ?? C.gray500,
      characterSpacing: tracking,
    });
  });

  // Rule
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, yTop - 28, 0.75, C.black);
  ctx.y = yTop - 44;
}

function drawTitle(ctx: Ctx, product: Product) {
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

  // Title — wrap if needed
  const titleLines = wrapText(safe(product.name), fonts.bold, 22, CONTENT_WIDTH);
  for (const line of titleLines) {
    page.drawText(line, {
      x: MARGIN_X,
      y: ctx.y,
      size: 22,
      font: fonts.bold,
      color: C.black,
    });
    ctx.y -= 26;
  }

  // Subtitle
  page.drawText(safe(`${product.series} Series`), {
    x: MARGIN_X,
    y: ctx.y - 2,
    size: 10,
    font: fonts.regular,
    color: C.gray500,
  });
  ctx.y -= 18;
}

async function drawHero(ctx: Ctx, product: Product) {
  const { doc, page } = ctx;
  const heroSrc = product.images?.[0];

  // Frame
  const frameH = 180;
  const frameY = ctx.y - frameH;
  page.drawRectangle({
    x: MARGIN_X,
    y: frameY,
    width: CONTENT_WIDTH,
    height: frameH,
    borderWidth: 0.5,
    borderColor: C.gray200,
    color: C.gray50,
  });

  if (heroSrc) {
    const pngBytes = await imageToPngBytes(heroSrc);
    if (pngBytes) {
      try {
        const img = await doc.embedPng(pngBytes);
        // Fit image inside the frame with padding, preserve aspect
        const padding = 16;
        const maxW = CONTENT_WIDTH - padding * 2;
        const maxH = frameH - padding * 2;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        page.drawImage(img, {
          x: MARGIN_X + (CONTENT_WIDTH - drawW) / 2,
          y: frameY + (frameH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      } catch (err) {
        console.warn("[pdf] embed hero image failed", err);
      }
    }
  }

  ctx.y = frameY - 22;
}

function drawDescription(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;
  const lines = wrapText(safe(product.description), fonts.regular, 9.5, CONTENT_WIDTH);
  for (const line of lines) {
    page.drawText(line, {
      x: MARGIN_X,
      y: ctx.y,
      size: 9.5,
      font: fonts.regular,
      color: C.gray700,
      lineHeight: 14,
    });
    ctx.y -= 14;
  }
  ctx.y -= 10;
}

function drawStats(ctx: Ctx, product: Product) {
  const { page, fonts } = ctx;
  const top = ctx.y;
  const stats: { label: string; value: string }[] = [
    { label: "RESOLUTION", value: safe(product.specs.resolution.split("(")[0].trim()) },
    { label: "BRIGHTNESS", value: safe(product.specs.brightness) },
    { label: "OPERATION", value: safe(product.specs.operationTime) },
    {
      label: "SIZES",
      value: safe(product.specs.screenSizes.map((s) => `${s}"`).join(" · ")),
    },
  ];

  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, top, 0.5, C.gray200);
  const colW = CONTENT_WIDTH / 4;
  const stripH = 36;
  stats.forEach((stat, i) => {
    const colX = MARGIN_X + i * colW + 10;
    drawSpacedText(page, stat.label, {
      x: colX,
      y: top - 14,
      size: 7,
      font: fonts.bold,
      color: C.gray400,
      characterSpacing: 1.2,
    });

    // Fit value to column width
    const valueLines = wrapText(stat.value, fonts.bold, 10, colW - 20);
    page.drawText(valueLines[0] ?? "", {
      x: colX,
      y: top - 28,
      size: 10,
      font: fonts.bold,
      color: C.black,
    });

    if (i > 0) {
      page.drawLine({
        start: { x: MARGIN_X + i * colW, y: top - 6 },
        end: { x: MARGIN_X + i * colW, y: top - stripH + 2 },
        thickness: 0.5,
        color: C.gray200,
      });
    }
  });
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, top - stripH, 0.5, C.gray200);
  ctx.y = top - stripH - 22;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN_BOTTOM + 70) {
    addNewPage(ctx);
  }
}

function addNewPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_WIDTH, A4_HEIGHT]);
  ctx.y = A4_HEIGHT - MARGIN_TOP;
}

function sectionHeader(ctx: Ctx, label: string) {
  ensureSpace(ctx, 28);
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
  ctx.y -= 18;
}

function drawFeatures(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Key Features");
  const { page, fonts } = ctx;
  const colW = CONTENT_WIDTH / 2 - 12;
  const fontSize = 9;
  const lineH = 12.5;

  // Split features into 2 balanced columns
  const half = Math.ceil(product.features.length / 2);
  const cols = [product.features.slice(0, half), product.features.slice(half)];

  const colYStart = ctx.y;
  let maxBottom = colYStart;

  cols.forEach((col, ci) => {
    let cy = colYStart;
    const x = MARGIN_X + ci * (colW + 24);
    for (const feat of col) {
      const lines = wrapText(safe(feat), fonts.regular, fontSize, colW - 14);
      // bullet
      page.drawRectangle({
        x: x + 3,
        y: cy + 3,
        width: 4,
        height: 1,
        color: C.blue600,
      });
      lines.forEach((line, li) => {
        page.drawText(line, {
          x: x + 14,
          y: cy - li * lineH,
          size: fontSize,
          font: fonts.regular,
          color: C.gray700,
        });
      });
      cy -= lines.length * lineH + 4;
    }
    if (cy < maxBottom) maxBottom = cy;
  });

  ctx.y = maxBottom - 18;
}

function drawSpecsTable(ctx: Ctx, product: Product) {
  sectionHeader(ctx, "Technical Specifications");

  const rows: { label: string; value: string }[] = [
    { label: "Resolution", value: product.specs.resolution },
    { label: "Brightness", value: product.specs.brightness },
    {
      label: "Available Sizes",
      value: product.specs.screenSizes.map((s) => `${s}"`).join(" · "),
    },
    { label: "Operation Hours", value: product.specs.operationTime },
    { label: "Series", value: product.series },
    {
      label: "Category",
      value:
        product.category +
        (product.subCategory ? ` — ${product.subCategory}` : ""),
    },
  ];

  if (product.additionalSpecs) {
    const seen = new Set(rows.map((r) => r.label.toLowerCase()));
    for (const [label, value] of Object.entries(product.additionalSpecs)) {
      if (!seen.has(label.toLowerCase())) {
        rows.push({ label, value });
      }
    }
  }

  const { page, fonts } = ctx;
  const labelW = CONTENT_WIDTH * 0.42;
  const valueW = CONTENT_WIDTH - labelW - 12;
  const fontSize = 9.5;
  const lineH = 13;

  for (const row of rows) {
    const labelLines = wrapText(safe(row.label), fonts.regular, fontSize, labelW);
    const valueLines = wrapText(safe(row.value), fonts.bold, fontSize, valueW);
    const blockHeight = Math.max(labelLines.length, valueLines.length) * lineH + 8;
    ensureSpace(ctx, blockHeight + 4);

    labelLines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN_X,
        y: ctx.y - i * lineH,
        size: fontSize,
        font: fonts.regular,
        color: C.gray500,
      });
    });
    valueLines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN_X + labelW + 12,
        y: ctx.y - i * lineH,
        size: fontSize,
        font: fonts.bold,
        color: C.black,
      });
    });

    ctx.y -= blockHeight;
    drawHr(
      ctx.page,
      MARGIN_X,
      A4_WIDTH - MARGIN_X,
      ctx.y + 4,
      0.4,
      C.gray100
    );
  }

  ctx.y -= 14;
}

function drawContactAndFooter(ctx: Ctx) {
  ensureSpace(ctx, 100);
  const { doc, page, fonts } = ctx;

  // Top rule
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.75, C.black);
  ctx.y -= 14;

  // Contact left
  drawSpacedText(page, "CONTACT SALES", {
    x: MARGIN_X,
    y: ctx.y,
    size: 7.5,
    font: fonts.bold,
    color: C.gray500,
    characterSpacing: 1.6,
  });
  page.drawText(
    safe("Bulk pricing • GST invoice • Pan-India installation"),
    {
      x: MARGIN_X,
      y: ctx.y - 14,
      size: 10,
      font: fonts.bold,
      color: C.black,
    }
  );

  // Contact right — clickable links
  const rightX = A4_WIDTH - MARGIN_X;
  const phoneText = "+91 93105 09909";
  const emailText = "sales@aplustechsol.com";
  const siteText = "aplustechsol.com";

  drawRightAlignedLink(
    doc,
    page,
    fonts.bold,
    phoneText,
    rightX,
    ctx.y,
    10.5,
    C.black,
    "tel:+919310509909"
  );
  drawRightAlignedLink(
    doc,
    page,
    fonts.regular,
    emailText,
    rightX,
    ctx.y - 14,
    9,
    C.blue600,
    "mailto:sales@aplustechsol.com"
  );
  drawRightAlignedLink(
    doc,
    page,
    fonts.regular,
    siteText,
    rightX,
    ctx.y - 27,
    9,
    C.blue600,
    "https://www.aplustechsol.com"
  );

  ctx.y -= 50;

  // Footer
  drawHr(page, MARGIN_X, A4_WIDTH - MARGIN_X, ctx.y, 0.4, C.gray200);
  ctx.y -= 14;

  // Footer left: CIN + GSTIN
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

  // Footer right: copyright
  const copyR1 = safe(
    `© ${new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd.`
  );
  const copyR2 = "All specifications subject to change without notice.";
  drawRightText(page, fonts.regular, copyR1, rightX, ctx.y, 7.5, C.gray400);
  drawRightText(
    page,
    fonts.regular,
    copyR2,
    rightX,
    ctx.y - 11,
    7.5,
    C.gray400
  );
}

// ── small drawing helpers ──────────────────────────────────────────────

function drawRightText(
  page: Ctx["page"],
  font: import("pdf-lib").PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
  color: import("pdf-lib").RGB
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: rightX - width,
    y,
    size,
    font,
    color,
  });
}

function drawRightAlignedLink(
  doc: Ctx["doc"],
  page: Ctx["page"],
  font: import("pdf-lib").PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
  color: import("pdf-lib").RGB,
  url: string
) {
  const width = font.widthOfTextAtSize(text, size);
  const x = rightX - width;
  page.drawText(text, { x, y, size, font, color });
  // Underline for link affordance
  page.drawLine({
    start: { x, y: y - 1 },
    end: { x: rightX, y: y - 1 },
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
