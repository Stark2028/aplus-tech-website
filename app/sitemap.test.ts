import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { vcRoomGuides } from "@/data/vcRoomGuides";
import { educationSegments } from "@/data/educationSegments";
import { cities } from "@/data/cities";
import { SITE } from "@/lib/jsonLd";

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("has no duplicate urls", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes every VC room and platform guide", () => {
    for (const g of vcRoomGuides) {
      expect(urls).toContain(`${SITE}/categories/video-conferencing/${g.slug}`);
    }
  });

  it("includes every Class Saathi segment", () => {
    for (const s of educationSegments) {
      expect(urls).toContain(`${SITE}/categories/education/${s.slug}`);
    }
  });

  it("includes the three Logitech VC combos", () => {
    for (const i of ["corporate", "education", "hospitality"]) {
      expect(urls).toContain(`${SITE}/solutions/${i}/video-conferencing`);
    }
  });

  it("includes the four new blog posts", () => {
    for (const s of [
      "sizing-a-video-conferencing-system-to-your-room",
      "microsoft-teams-rooms-vs-zoom-rooms-hardware",
      "what-is-a-student-response-system",
      "formative-assessment-without-internet",
    ]) {
      expect(urls).toContain(`${SITE}/blogs/${s}`);
    }
  });

  it("includes every city landing page and the /locations index", () => {
    expect(urls).toContain(`${SITE}/locations`);
    for (const c of cities) {
      expect(urls).toContain(`${SITE}/${c.slug}`);
    }
  });
});
