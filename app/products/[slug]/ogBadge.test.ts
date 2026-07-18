import { describe, it, expect } from "vitest";
import { ogBadgeLabel } from "./ogBadge";

describe("ogBadgeLabel", () => {
  it("shows 'Authorized Samsung Partner' for Samsung products", () => {
    expect(ogBadgeLabel({ category: "Digital Signage" })).toBe("Authorized Samsung Partner");
  });

  it("shows a neutral Logitech label with no banned wording", () => {
    const label = ogBadgeLabel({ brand: "Logitech", category: "Video Conferencing" });
    expect(label).not.toMatch(/authoriz|partner|certif|samsung/i);
    expect(label).toMatch(/Video Conferencing|Logitech/);
  });
});
