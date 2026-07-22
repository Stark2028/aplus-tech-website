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
        `© ${year} Aplus Technology Solutions Pvt. Ltd. · Specifications subject to change · Page ${n} of ${total}`
      );
      page.drawText(legal, {
        x: rightX - fonts.regular.widthOfTextAtSize(legal, 7),
        y: 30, size: 7, font: fonts.regular, color: C.gray400,
      });
    }
  });
}
