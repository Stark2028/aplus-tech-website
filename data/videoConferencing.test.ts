import { describe, it, expect } from "vitest";
import { videoConferencingProducts } from "./videoConferencing";

const BANNED = /authoriz|partner|certif|samsung/i;
const VALID_SUBCATS = new Set([
  "Video Bars & Systems",
  "Cameras",
  "Controllers & Scheduling",
  "Room Compute",
]);

describe("videoConferencingProducts", () => {
  it("has exactly 16 products", () => {
    expect(videoConferencingProducts).toHaveLength(16);
  });

  it("every product is brand Logitech in the Video Conferencing category", () => {
    for (const p of videoConferencingProducts) {
      expect(p.brand).toBe("Logitech");
      expect(p.category).toBe("Video Conferencing");
      expect(VALID_SUBCATS.has(p.subCategory ?? "")).toBe(true);
    }
  });

  it("never sets catalog2026 (that flag is Samsung-only)", () => {
    for (const p of videoConferencingProducts) {
      expect(p.catalog2026).toBeUndefined();
    }
  });

  it("has unique ids", () => {
    const ids = videoConferencingProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries the four required display-spec fields on every product", () => {
    for (const p of videoConferencingProducts) {
      expect(typeof p.specs.resolution).toBe("string");
      expect(typeof p.specs.brightness).toBe("string");
      expect(Array.isArray(p.specs.screenSizes)).toBe(true);
      expect(typeof p.specs.operationTime).toBe("string");
      expect(p.features.length).toBeGreaterThan(0);
    }
  });

  it("contains no authorization/partner/certification/Samsung wording anywhere", () => {
    for (const p of videoConferencingProducts) {
      const blob = JSON.stringify(p);
      expect(BANNED.test(blob)).toBe(false);
    }
  });
});
