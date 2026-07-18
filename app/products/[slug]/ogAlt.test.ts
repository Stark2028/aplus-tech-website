import { describe, it, expect } from "vitest";
import { ogAltFor } from "./ogAlt";

describe("ogAltFor", () => {
  it("returns the exact legacy Samsung alt for a Samsung product", () => {
    expect(ogAltFor({ name: "Some Display", brand: "Samsung" })).toBe(
      "Samsung Commercial Display — Aplus Technology Solutions"
    );
  });

  it("returns the exact legacy Samsung alt when brand is absent", () => {
    expect(ogAltFor({ name: "Some Display" })).toBe(
      "Samsung Commercial Display — Aplus Technology Solutions"
    );
  });

  it("returns a neutral, Samsung-free alt naming the product for Logitech", () => {
    const alt = ogAltFor({ name: "Logitech Rally Bar", brand: "Logitech" });
    expect(alt).not.toMatch(/authoriz|partner|certif|samsung/i);
    expect(alt).toMatch(/Logitech Rally Bar/);
  });
});
