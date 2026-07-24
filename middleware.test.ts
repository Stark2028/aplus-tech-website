import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { redirectTo, middleware } from "./middleware";

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

describe("middleware city handling", () => {
  const run = (path: string) =>
    middleware(new NextRequest(new URL(`https://www.aplustechsol.com${path}`)));

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
