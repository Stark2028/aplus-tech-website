import { describe, it, expect } from "vitest";
import { keyFactRows } from "./KeyFacts";
import type { Product } from "@/data/products";

const p: Product = {
  id: "samsung-signage-qmc", name: "Samsung Crystal UHD Signage QMC Series",
  category: "Digital Signage", series: "QMC", description: "d", features: ["f"],
  specs: { resolution: "4K UHD", brightness: "350 nit", screenSizes: ["43", "50"], operationTime: "16/7" },
  images: ["/x.avif"],
};

describe("keyFactRows", () => {
  it("leads with the India model code when one exists", () => {
    expect(keyFactRows(p)[0].label).toBe("India model code");
  });

  it("includes resolution, brightness and sizes", () => {
    const labels = keyFactRows(p).map((r) => r.label);
    expect(labels).toEqual(expect.arrayContaining(["Resolution", "Brightness", "Screen sizes"]));
  });

  it("omits rows with empty values rather than printing blanks", () => {
    const bare = { ...p, specs: { ...p.specs, brightness: "" } };
    expect(keyFactRows(bare).map((r) => r.label)).not.toContain("Brightness");
  });

  it("never emits a price or rating row", () => {
    const json = JSON.stringify(keyFactRows(p));
    // Word-anchored: an unanchored /rating/ also matches "operating".
    expect(json).not.toMatch(/\b(price|pricing|rating|ratings|review|reviews)\b/i);
  });
});
