import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { legacyPaths, buildLegacySitemap, LEGACY_SITEMAP_PARTS } from "./legacySitemaps";
import { proxy } from "@/proxy";
import sitemap from "@/app/sitemap";

const paths = legacyPaths();
const livePaths = new Set(sitemap().map((e) => new URL(e.url).pathname));

describe("legacyPaths", () => {
  it("covers the whole legacy URL space (~19k URLs, under the 50k sitemap cap)", () => {
    expect(paths.length).toBeGreaterThan(18000);
    expect(paths.length).toBeLessThan(50000);
  });

  it("contains no duplicates", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("never lists a live page (this sitemap is redirects-only)", () => {
    const overlap = paths.filter((p) => livePaths.has(p.replace(/\/+$/, "") || "/"));
    expect(overlap).toEqual([]);
  });

  it("every path 301s through the proxy to a live sitemap URL", () => {
    const bad: string[] = [];
    for (const p of paths) {
      const res = proxy(new NextRequest(new URL(`https://www.aplustechsol.com${p}`)));
      const loc = res.headers.get("location");
      if (res.status !== 301 || !loc) {
        bad.push(`${p} → status ${res.status}`);
        continue;
      }
      const target = new URL(loc).pathname;
      if (!livePaths.has(target)) bad.push(`${p} → ${target} (not a live page)`);
    }
    expect(bad.slice(0, 20)).toEqual([]); // slice: keep failure output readable
  });
});

describe("buildLegacySitemap", () => {
  it("splits the full inventory exactly across the parts, nothing lost", () => {
    const locs = (xml: string) => xml.match(/<loc>/g)?.length ?? 0;
    let total = 0;
    for (let part = 1; part <= LEGACY_SITEMAP_PARTS; part++) {
      total += locs(buildLegacySitemap(part));
    }
    expect(total).toBe(paths.length);
  });

  it("emits well-formed sitemap XML with absolute URLs and no lastmod", () => {
    const xml = buildLegacySitemap(1);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://www.aplustechsol.com/");
    expect(xml).not.toContain("<lastmod>"); // truth policy: we don't know real lastmod dates
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });
});
