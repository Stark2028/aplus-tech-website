import { describe, it, expect } from "vitest";
import { softwareProducts } from "./software";

const VALID_SUBCATS = new Set(["Cloud Platform"]);

describe("softwareProducts", () => {
  it("has exactly 2 products", () => {
    expect(softwareProducts).toHaveLength(2);
  });

  it("contains Samsung VXT and Samsung LYNK Cloud", () => {
    const ids = softwareProducts.map((p) => p.id);
    expect(ids).toContain("samsung-vxt");
    expect(ids).toContain("samsung-lynk-cloud");
  });

  it("every product is Samsung (brand absent) in the Software Solutions category", () => {
    for (const p of softwareProducts) {
      // brand absent ⇒ Samsung (never set explicitly, matching all Samsung data)
      expect(p.brand).toBeUndefined();
      expect(p.category).toBe("Software Solutions");
      expect(VALID_SUBCATS.has(p.subCategory ?? "")).toBe(true);
    }
  });

  it("is flagged as 2026 catalog on every product", () => {
    for (const p of softwareProducts) {
      expect(p.catalog2026).toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = softwareProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries the four required spec fields (software has no screen sizes)", () => {
    for (const p of softwareProducts) {
      expect(typeof p.specs.resolution).toBe("string");
      expect(typeof p.specs.brightness).toBe("string");
      expect(Array.isArray(p.specs.screenSizes)).toBe(true);
      expect(p.specs.screenSizes).toHaveLength(0);
      expect(typeof p.specs.operationTime).toBe("string");
      expect(p.features.length).toBeGreaterThan(0);
    }
  });
});
