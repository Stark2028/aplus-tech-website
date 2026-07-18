import { describe, it, expect } from "vitest";
import { categoryOgAltFor } from "./ogAlt";

describe("categoryOgAltFor", () => {
  it("returns the exact legacy Samsung alt for a Samsung category", () => {
    expect(
      categoryOgAltFor({ id: "digital-signage", navLabel: "Digital Signage" })
    ).toBe("Samsung Commercial Display Category — Aplus Technology Solutions");
  });

  it("returns a neutral, Samsung-free alt naming the label for Video Conferencing", () => {
    const alt = categoryOgAltFor({
      id: "video-conferencing",
      navLabel: "Video Conferencing",
    });
    expect(alt).not.toMatch(/samsung/i);
    expect(alt).toMatch(/Video Conferencing/);
  });
});
