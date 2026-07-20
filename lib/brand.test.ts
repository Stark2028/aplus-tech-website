import { describe, it, expect } from "vitest";
import {
  brandOf,
  isLogitech,
  BRAND_MANUFACTURER,
  BRAND_JSONLD_NAME,
} from "./brand";

describe("brandOf", () => {
  it("defaults to Samsung when brand is absent", () => {
    expect(brandOf({})).toBe("Samsung");
    expect(brandOf({ brand: undefined })).toBe("Samsung");
  });

  it("returns the explicit brand when set", () => {
    expect(brandOf({ brand: "Logitech" })).toBe("Logitech");
    expect(brandOf({ brand: "Samsung" })).toBe("Samsung");
  });
});

describe("isLogitech", () => {
  it("is true only for Logitech", () => {
    expect(isLogitech({ brand: "Logitech" })).toBe(true);
    expect(isLogitech({ brand: "Samsung" })).toBe(false);
    expect(isLogitech({})).toBe(false);
  });
});

describe("brand manufacturer / json-ld names", () => {
  it("maps Logitech to logitech.com with no Samsung leakage", () => {
    expect(BRAND_MANUFACTURER.Logitech.url).toBe("https://www.logitech.com");
    expect(BRAND_MANUFACTURER.Logitech.name).not.toMatch(/samsung/i);
    expect(BRAND_JSONLD_NAME.Logitech).toBe("Logitech");
  });

  it("keeps Samsung mapping intact", () => {
    expect(BRAND_MANUFACTURER.Samsung.url).toBe("https://www.samsung.com");
    expect(BRAND_JSONLD_NAME.Samsung).toBe("Samsung");
  });
});
