import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { cities } from "@/data/cities";
import { SITE } from "@/lib/jsonLd";

describe("sitemap city coverage", () => {
  const urls = new Set(sitemap().map((e) => e.url));

  it("includes every city landing page", () => {
    const missing = cities.filter((c) => !urls.has(`${SITE}/${c.slug}`)).map((c) => c.slug);
    expect(missing).toEqual([]);
  });

  it("includes the /locations index", () => {
    expect(urls.has(`${SITE}/locations`)).toBe(true);
  });
});
