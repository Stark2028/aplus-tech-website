import { describe, it, expect } from "vitest";
import { cleanTitle, labelFromPath, resolvePageLabel } from "./pageLabel";

describe("cleanTitle", () => {
  it("takes the segment before the brand suffix", () => {
    expect(cleanTitle("Samsung QB55C | Aplus Technology Solutions")).toBe("Samsung QB55C");
  });
  it("strips a trailing model code in parentheses", () => {
    expect(cleanTitle("Samsung QB55C (LH55QBCEBGCXXL) | Aplus Technology Solutions")).toBe("Samsung QB55C");
  });
  it("returns '' for the home default (brand at the front)", () => {
    expect(cleanTitle("Aplus Technology Solutions | Authorized Samsung Business Display Distributor")).toBe("");
  });
  it("returns '' for a brand-only title", () => {
    expect(cleanTitle("Aplus Technology Solutions")).toBe("");
  });
  it("returns '' for empty/whitespace", () => {
    expect(cleanTitle("")).toBe("");
    expect(cleanTitle("   ")).toBe("");
  });
  it("passes a title through when there is no brand suffix", () => {
    expect(cleanTitle("Contact Us")).toBe("Contact Us");
  });
});

describe("labelFromPath", () => {
  it("title-cases the last segment", () => {
    expect(labelFromPath("/products/samsung-qb55c")).toBe("Samsung Qb55c");
  });
  it("ignores query and hash", () => {
    expect(labelFromPath("/displays?ref=x#top")).toBe("Displays");
  });
  it("returns '' for root", () => {
    expect(labelFromPath("/")).toBe("");
    expect(labelFromPath("")).toBe("");
  });
});

describe("resolvePageLabel", () => {
  it("prefers a cleaned page title", () => {
    expect(resolvePageLabel({ pageTitle: "Video Walls | Aplus Technology Solutions", page: "/x" })).toBe("Video Walls");
  });
  it("falls back to the path when the title is unusable", () => {
    expect(resolvePageLabel({ pageTitle: "Aplus Technology Solutions", page: "/products/samsung-qb55c" })).toBe("Samsung Qb55c");
  });
  it("falls back to 'our website' when nothing is usable", () => {
    expect(resolvePageLabel({ pageTitle: "", page: "/" })).toBe("our website");
    expect(resolvePageLabel({})).toBe("our website");
  });
});
