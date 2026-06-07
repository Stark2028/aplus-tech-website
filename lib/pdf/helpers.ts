/**
 * Shared low-level helpers for generating real PDF files with pdf-lib.
 *
 * Used by SpecSheetButton and QuoteItemsCard to produce downloads with
 * embedded fonts, vector text, and *clickable* link annotations that
 * survive Safari's Save-as-PDF (unlike browser print → PDF).
 */

import type {
  PDFDocument,
  PDFFont,
  PDFPage,
  RGB,
} from "pdf-lib";
import {
  PDFArray,
  PDFName,
  PDFString,
  rgb,
} from "pdf-lib";

// ── A4 dimensions in points ────────────────────────────────────────────
export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;
export const MARGIN_X = 42; // ≈ 14.8mm
export const MARGIN_TOP = 50;
export const MARGIN_BOTTOM = 42;
export const CONTENT_WIDTH = A4_WIDTH - MARGIN_X * 2;

// ── Palette (matches site Tailwind tokens) ─────────────────────────────
export const C = {
  black: rgb(0.067, 0.067, 0.067),      // #111
  gray900: rgb(0.10, 0.10, 0.11),
  gray700: rgb(0.22, 0.25, 0.32),       // #374151
  gray600: rgb(0.30, 0.34, 0.41),
  gray500: rgb(0.42, 0.45, 0.50),       // #6b7280
  gray400: rgb(0.61, 0.64, 0.69),       // #9ca3af
  gray300: rgb(0.82, 0.84, 0.86),       // #d1d5db
  gray200: rgb(0.90, 0.91, 0.92),       // #e5e7eb
  gray100: rgb(0.95, 0.96, 0.97),       // #f3f4f6
  gray50:  rgb(0.97, 0.98, 0.99),       // #f9fafb
  blue700: rgb(0.11, 0.31, 0.78),
  blue600: rgb(0.15, 0.39, 0.92),       // #2563eb
  blue50:  rgb(0.94, 0.96, 1.00),       // #eff6ff
  slate50: rgb(0.97, 0.98, 0.99),       // #f8fafc
  white: rgb(1, 1, 1),
};

/**
 * Add a clickable URL annotation on top of an existing drawn text block.
 * Coordinates are pdf-lib's (origin bottom-left).
 */
export function addLinkAnnotation(
  doc: PDFDocument,
  page: PDFPage,
  url: string,
  rect: { x: number; y: number; width: number; height: number }
): void {
  const annot = doc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(url),
    },
  });
  const ref = doc.context.register(annot);
  const existing = page.node.lookup(PDFName.of("Annots"));
  if (existing instanceof PDFArray) {
    existing.push(ref);
  } else {
    page.node.set(PDFName.of("Annots"), doc.context.obj([ref]));
  }
}

/** Word-wrap text into lines that fit `maxWidth` at the given font/size. */
export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // If a single word is longer than maxWidth, hard-break it
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, fontSize) > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draw a string with letter-spacing (pdf-lib's drawText doesn't expose
 * Tc / characterSpacing, so we render glyph-by-glyph).
 * Returns the rendered width.
 */
export function drawSpacedText(
  page: PDFPage,
  text: string,
  opts: {
    x: number;
    y: number;
    font: PDFFont;
    size: number;
    color: RGB;
    characterSpacing?: number;
  }
): number {
  const tracking = opts.characterSpacing ?? 0;
  if (!tracking) {
    page.drawText(text, {
      x: opts.x,
      y: opts.y,
      font: opts.font,
      size: opts.size,
      color: opts.color,
    });
    return opts.font.widthOfTextAtSize(text, opts.size);
  }
  let cursor = opts.x;
  for (const ch of text) {
    page.drawText(ch, {
      x: cursor,
      y: opts.y,
      font: opts.font,
      size: opts.size,
      color: opts.color,
    });
    cursor += opts.font.widthOfTextAtSize(ch, opts.size) + tracking;
  }
  return cursor - opts.x - tracking;
}

/** Measure rendered width of letter-spaced text. */
export function widthOfSpacedText(
  text: string,
  font: PDFFont,
  size: number,
  characterSpacing = 0
): number {
  return (
    font.widthOfTextAtSize(text, size) +
    Math.max(0, text.length - 1) * characterSpacing
  );
}

/** Draw a horizontal rule. */
export function drawHr(
  page: PDFPage,
  x1: number,
  x2: number,
  y: number,
  thickness = 0.5,
  color: RGB = C.gray200
) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness,
    color,
  });
}

/** Render a Latin-1 safe string (pdf-lib WinAnsi font can't encode em-dashes etc.). */
export function safe(text: string): string {
  return text
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/[“”″]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/·/g, "•")
    .replace(/…/g, "...")
    .replace(/×/g, "x")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/Ω/g, "Ohm")
    .replace(/[​-‏‪-‮﻿]/g, ""); // strip zero-width / direction marks
}

/**
 * Fetch an image (any format the browser can decode — AVIF/WebP/PNG/JPG)
 * and convert to PNG bytes via canvas. Returns null on failure.
 */
export async function imageToPngBytes(src: string): Promise<Uint8Array | null> {
  if (typeof window === "undefined") return null;
  try {
    return await new Promise<Uint8Array>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          // Cap to a sensible max to keep PDF size reasonable
          const maxDim = 1600;
          const scale = Math.min(
            1,
            maxDim / Math.max(img.naturalWidth, img.naturalHeight)
          );
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("canvas ctx unavailable"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            async (blob) => {
              if (!blob) return reject(new Error("canvas toBlob failed"));
              const buf = await blob.arrayBuffer();
              resolve(new Uint8Array(buf));
            },
            "image/png"
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error(`image load failed: ${src}`));
      img.src = src;
    });
  } catch (err) {
    console.warn("[pdf] imageToPngBytes failed", err);
    return null;
  }
}

// `downloadPdf` moved to ./download (pdf-lib-free) so components can trigger a
// download without statically pulling pdf-lib into their bundle. Re-exported
// here for backwards compatibility with any existing importer.
export { downloadPdf } from "./download";
