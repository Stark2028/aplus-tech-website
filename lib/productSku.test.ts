import { describe, it, expect } from "vitest";
import { formatSkuLine } from "./productSku";
import { Product } from "@/data/products";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: "test-product",
    name: "Test Product",
    category: "Digital Signage",
    series: "QET Series",
    description: "",
    features: [],
    specs: {
      resolution: "4K",
      brightness: "300 nit",
      screenSizes: ["43", "50", "82"],
      operationTime: "16/7",
    },
    images: [],
    ...overrides,
  };
}

describe("formatSkuLine", () => {
  it("uppercases series and shows min–max size range with en dash and double prime", () => {
    expect(formatSkuLine(makeProduct({}))).toBe("QET SERIES · 43–82″");
  });

  it("shows a single size without a range", () => {
    expect(
      formatSkuLine(
        makeProduct({
          specs: { resolution: "4K", brightness: "700 nit", screenSizes: ["55"], operationTime: "24/7" },
        })
      )
    ).toBe("QET SERIES · 55″");
  });

  it("preserves decimal sizes", () => {
    expect(
      formatSkuLine(
        makeProduct({
          specs: { resolution: "FHD", brightness: "250 nit", screenSizes: ["21.5", "32"], operationTime: "16/7" },
        })
      )
    ).toBe("QET SERIES · 21.5–32″");
  });

  it("omits the size segment when no numeric sizes exist", () => {
    expect(
      formatSkuLine(
        makeProduct({
          specs: { resolution: "Custom", brightness: "n/a", screenSizes: ["Custom"], operationTime: "24/7" },
        })
      )
    ).toBe("QET SERIES");
  });

  it("falls back to subCategory then category when series is empty", () => {
    expect(formatSkuLine(makeProduct({ series: "", subCategory: "Business TV" }))).toBe("BUSINESS TV · 43–82″");
    expect(formatSkuLine(makeProduct({ series: "" }))).toBe("DIGITAL SIGNAGE · 43–82″");
  });

  it("ignores non-numeric entries mixed with numeric ones", () => {
    expect(
      formatSkuLine(
        makeProduct({
          specs: { resolution: "4K", brightness: "300 nit", screenSizes: ["Custom", "46"], operationTime: "24/7" },
        })
      )
    ).toBe("QET SERIES · 46″");
  });
});
