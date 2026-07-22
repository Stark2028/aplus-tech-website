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
