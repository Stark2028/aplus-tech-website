import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { redirectTo, proxy } from "./proxy";
import { products } from "@/data/products";
import {
  OLD_PRODUCT_SLUG_TO_ID,
  MERGED_PRODUCT_TO_CANONICAL,
} from "@/lib/redirects";

describe("redirectTo", () => {
  it("preserves the query string on redirect", () => {
    const req = new NextRequest(
      "https://www.aplustechsol.com/mumbai/samsung-qb43c/?utm_source=google&gclid=abc"
    );
    const res = redirectTo(req, "/products/samsung-signage-qbc");
    const loc = new URL(res.headers.get("location")!);

    expect(loc.pathname).toBe("/products/samsung-signage-qbc");
    expect(loc.searchParams.get("utm_source")).toBe("google");
    expect(loc.searchParams.get("gclid")).toBe("abc");
  });

  it("produces a bare path when there is no query string", () => {
    const req = new NextRequest("https://www.aplustechsol.com/mumbai/samsung-qb43c/");
    const res = redirectTo(req, "/products/samsung-signage-qbc");
    const loc = new URL(res.headers.get("location")!);

    expect(loc.pathname).toBe("/products/samsung-signage-qbc");
    expect(loc.search).toBe("");
  });

  it("issues a permanent (301) redirect", () => {
    const req = new NextRequest("https://www.aplustechsol.com/old");
    const res = redirectTo(req, "/new");
    expect(res.status).toBe(301);
  });

  it("redirects on the request's own origin", () => {
    const req = new NextRequest("https://staging.example.com/old?a=1");
    const res = redirectTo(req, "/new");
    const loc = new URL(res.headers.get("location")!);

    expect(loc.origin).toBe("https://staging.example.com");
    expect(loc.search).toBe("?a=1");
  });
});

describe("proxy city handling", () => {
  const run = (path: string) =>
    proxy(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

  it("passes a legacy city root through untouched (no redirect)", () => {
    // NextResponse.next() has no Location header; a redirect would be 301/307/308.
    expect(run("/delhi").headers.get("location")).toBeNull();
  });

  it("passes a net-new tier-2 city root through untouched", () => {
    expect(run("/mysuru").headers.get("location")).toBeNull();
  });

  it("still 301s a city×product URL to the product page", () => {
    const res = run("/delhi/samsung-interactive-display-flip-3");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      "https://www.aplustechsol.com/products/samsung-interactive-flip-3"
    );
  });

  it("301s the legacy /our-presence page to /locations", () => {
    const res = run("/our-presence");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.aplustechsol.com/locations");
  });
});

/**
 * Regression guard for the Search Console "Soft 404" report of 2026-07-28, which
 * listed 133 pages Google refused to index. Four old product slugs accounted for
 * 128 of them; none appear in the archived WordPress sitemap, so nothing but GSC
 * would have caught them. Each slug is multiplied across ~121 city roots and the
 * three role roots, so one missing entry costs well over a hundred indexed URLs.
 */
describe("proxy — slugs from the GSC soft-404 report", () => {
  const run = (path: string) =>
    proxy(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

  const cases: [slug: string, productId: string][] = [
    // Published with a typo ("dispaly"); that is the spelling Google indexed.
    ["samsung-led-dispaly-mp016f", "samsung-mp016f"],
    ["samsung-crystal-uhd-signage-display-qbc-n-series", "samsung-signage-qbc"],
    ["samsung-be50d-h", "samsung-business-tv-bed-h"],
    ["samsung-55-inch-video-wall-display-vmc-e-series", "samsung-vmc-e"],
  ];

  it.each(cases)("301s a city page for %s", (slug, productId) => {
    const res = run(`/agra/${slug}`);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      `https://www.aplustechsol.com/products/${productId}`
    );
  });

  it.each(cases)("301s a role page for %s", (slug, productId) => {
    const res = run(`/distributor/${slug}`);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      `https://www.aplustechsol.com/products/${productId}`
    );
  });

  it("keeps the correctly spelled MP016F slug working too", () => {
    const res = run("/agra/samsung-led-display-mp016f");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      "https://www.aplustechsol.com/products/samsung-mp016f"
    );
  });
});

/**
 * The old site published a page per SKU per city. Only the SKUs with traffic
 * were mapped originally, leaving ~5,400 URLs 404ing; these spot-check the
 * families added to close that. samsung-qm55c is the URL the client reported.
 */
describe("proxy — city x SKU matrix", () => {
  const run = (path: string) =>
    proxy(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

  const cases: [slug: string, productId: string][] = [
    ["samsung-qm55c", "samsung-signage-qmc"],           // client-reported 404
    ["samsung-qh55c", "samsung-signage-qhc"],
    ["samsung-qe65t", "samsung-qet-series"],
    ["samsung-wa86f", "samsung-waf-series"],
    ["samsung-vh55ce", "samsung-vhc-e"],
    ["samsung-qm55r-t", "samsung-touch-qmr-t"],          // hyphenated generation
    ["samsung-be55c-h", "samsung-business-tv-bec-h"],    // business TV, short
    ["samsung-business-tv-be55f-h2", "samsung-business-tv-befx-h2"], // long
    ["samsung-hg55u800f", "samsung-hotel-tv-hu8000f"],   // hotel TV
  ];

  it.each(cases)("301s /noida/%s", (slug, productId) => {
    const res = run(`/noida/${slug}`);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      `https://www.aplustechsol.com/products/${productId}`
    );
  });
});

describe("proxy — case handling", () => {
  const run = (path: string) =>
    proxy(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

  it("301s a capitalised city root to its lowercase hub", () => {
    const res = run("/Noida");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.aplustechsol.com/noida");
  });

  it("resolves a capitalised product slug", () => {
    const res = run("/delhi/Samsung-QB43C");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe(
      "https://www.aplustechsol.com/products/samsung-signage-qbc"
    );
  });

  it("leaves an already-lowercase city root alone", () => {
    expect(run("/noida").headers.get("location")).toBeNull();
  });
});

describe("redirect map integrity", () => {
  const ids = new Set(products.map((p) => p.id));

  // A typo in a target sends the redirect to a 404 product page, which is worse
  // than the original 404 because it looks healthy in a crawl.
  it("every legacy slug points at a product that exists", () => {
    const broken = Object.entries(OLD_PRODUCT_SLUG_TO_ID)
      .filter(([, id]) => !ids.has(id))
      .map(([slug, id]) => `${slug} -> ${id}`);
    expect(broken).toEqual([]);
  });

  it("every merged product points at a product that exists", () => {
    const broken = Object.entries(MERGED_PRODUCT_TO_CANONICAL)
      .filter(([, id]) => !ids.has(id))
      .map(([slug, id]) => `${slug} -> ${id}`);
    expect(broken).toEqual([]);
  });

  it("no merged product redirects into another merged product", () => {
    const keys = new Set(Object.keys(MERGED_PRODUCT_TO_CANONICAL));
    const looping = Object.values(MERGED_PRODUCT_TO_CANONICAL).filter((v) => keys.has(v));
    expect(looping).toEqual([]);
  });
});
