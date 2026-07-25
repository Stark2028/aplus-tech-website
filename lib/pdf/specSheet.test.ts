import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import type { Product } from "@/data/products";
import { products } from "@/data/products";
import { buildSpecSheetPdf } from "./specSheet";

const byId = (id: string): Product => {
  const p = products.find((x) => x.id === id);
  if (!p) throw new Error(`missing product ${id}`);
  return p;
};

// Exercises every fallback path: no image, no specGroups, no features,
// no longDescription — the sheet must still render.
const minimal: Product = {
  id: "test-minimal",
  name: "Test Minimal Product",
  category: "Digital Signage",
  series: "TST",
  description: "Minimal product exercising the fallback paths.",
  features: [],
  specs: {
    resolution: "1,920 × 1,080 (FHD)",
    brightness: "300 nit",
    screenSizes: ["43"],
    operationTime: "16/7",
  },
  images: [],
};

describe("buildSpecSheetPdf", () => {
  it("renders the VMB-U (grouped specs) as a loadable multi-page PDF", async () => {
    const bytes = await buildSpecSheetPdf(byId("samsung-vmb-u-46"));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it("renders a many-size product (QET, 7 sizes)", async () => {
    const bytes = await buildSpecSheetPdf(byId("samsung-qet-series"));
    await expect(PDFDocument.load(bytes)).resolves.toBeDefined();
  });

  it("renders a minimal product (no image/groups/features/overview)", async () => {
    const bytes = await buildSpecSheetPdf(minimal);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("renders every catalog product without throwing", async () => {
    for (const p of products) {
      await expect(buildSpecSheetPdf(p), p.id).resolves.toBeInstanceOf(Uint8Array);
    }
  }, 30000);
});
