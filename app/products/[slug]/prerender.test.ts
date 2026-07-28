import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Prerender contract for /products/[slug].
 *
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute JS, so anything
 * that only exists in the RSC flight payload is invisible to them. This suite
 * asserts the *static HTML* — not the hydrated DOM — actually carries the page.
 *
 * Regression guarded: a client component calling useSearchParams() without a
 * <Suspense> wrapper makes React bail the nearest boundary to client-side
 * rendering. Because this route has a loading.tsx, that boundary is the whole
 * route, so the entire body (h1, specs, FAQ, JSON-LD) vanished from the HTML
 * and survived only as escaped text inside self.__next_f.push(...) chunks.
 * See components/SpecSheetButton.tsx.
 */
const BUILD_DIR = join(process.cwd(), ".next", "server", "app", "products");

const productPages = existsSync(BUILD_DIR)
  ? readdirSync(BUILD_DIR).filter((f) => f.endsWith(".html"))
  : [];

// `npm test` must stay runnable without a build; the check is meaningful only
// when build output exists (locally after `npm run build`, and in CI post-build).
describe.skipIf(productPages.length === 0)("product page static HTML", () => {
  const read = (file: string) => readFileSync(join(BUILD_DIR, file), "utf8");

  it("prerenders at least one product page", () => {
    expect(productPages.length).toBeGreaterThan(0);
  });

  it("never bails the route-level Suspense boundary to client-side rendering", () => {
    // Contained bailouts (analytics, ssr:false overlays) are fine and expected.
    // What must never happen is losing the page body itself, which is what the
    // h1/JSON-LD assertions below detect. This one catches the specific cause.
    const offenders = productPages.filter((f) => {
      const html = read(f);
      const body = html.slice(html.indexOf("</head>"));
      // The route boundary is the first thing in <main>; if the page content
      // bailed, there is no real markup between the skeleton and the flight data.
      return body.includes("animate-pulse") && !/<h1[ >]/.test(html);
    });
    expect(offenders).toEqual([]);
  });

  it("ships an <h1> in the server HTML for every product", () => {
    const missing = productPages.filter((f) => !/<h1[ >]/.test(read(f)));
    expect(missing).toEqual([]);
  });

  it("ships exactly one <h1> per product page", () => {
    const offenders = productPages
      .map((f) => ({ f, count: (read(f).match(/<h1[ >]/g) ?? []).length }))
      .filter(({ count }) => count !== 1);
    expect(offenders).toEqual([]);
  });

  it("ships a real <script type=application/ld+json> element, not flight data", () => {
    const missing = productPages.filter(
      (f) => !/<script[^>]*type="application\/ld\+json"/.test(read(f)),
    );
    expect(missing).toEqual([]);
  });

  it("ships Product schema and the primary CTA text in the server HTML", () => {
    const sample = productPages[0];
    const html = read(sample);
    expect(html, `${sample} missing Product schema`).toMatch(
      /"@type"\s*:\s*"Product"/,
    );
    expect(html, `${sample} missing quote CTA`).toContain("Add to Quote");
  });
});
