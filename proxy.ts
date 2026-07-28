import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  MERGED_PRODUCT_TO_CANONICAL,
  OLD_BLOG_SLUG_TO_NEW,
} from "@/lib/redirects";
import { CITY_SLUGS } from "@/data/cities";

// New / reserved top-level routes the migration redirects must never touch,
// so requests to the live site never loop or get hijacked.
const RESERVED_ROOTS = new Set([
  "products",
  "categories",
  "solutions",
  "blogs",
  "product-finder",
  "compare",
  "quote",
  "about",
  "contact",
  "privacy",
  "terms",
  "api",
  "locations",
]);

/**
 * Build a 301 to `pathname` on the same origin, carrying the original query
 * string across (301 — preserves ranking equity).
 *
 * `new URL(pathname, req.url)` takes only the ORIGIN from the base — the search
 * params are dropped — which silently destroyed utm_* and gclid on every legacy
 * redirect. Attribution for paid traffic depends on this.
 */
export function redirectTo(req: NextRequest, pathname: string) {
  const to = new URL(pathname, req.url);
  to.search = req.nextUrl.search;
  return NextResponse.redirect(to, 301);
}

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const clean = pathname.replace(/\/+$/, ""); // tolerate old trailing slashes
  if (clean === "") return NextResponse.next(); // home

  const segments = clean.split("/").filter(Boolean);
  const first = segments[0];

  // Legacy city landing pages (/delhi, /mumbai, …) are real routes now. Guard
  // them BEFORE the product-slug fallthrough below, which matches on the last
  // path segment and would otherwise 301 a single-segment city path away if a
  // product slug ever shared its name. Today no collision exists (asserted in
  // data/cities.test.ts); this keeps it safe as the catalog grows.
  if (segments.length === 1 && CITY_SLUGS.has(first)) {
    return NextResponse.next();
  }

  // Products removed as duplicates still 301 to the twin they duplicated, so the
  // ranking equity of their URLs (and of every old slug that redirects into one)
  // survives the merge instead of dying on a 404. This MUST precede the
  // RESERVED_ROOTS check below, which would otherwise wave every /products/ path
  // straight through. Safe from looping because no canonical id is itself a key.
  if (first === "products" && segments.length === 2) {
    const canonical = MERGED_PRODUCT_TO_CANONICAL[segments[1]];
    if (canonical) {
      return redirectTo(req, `/products/${canonical}`);
    }
  }

  // Never interfere with the new site's own routes.
  if (RESERVED_ROOTS.has(first)) return NextResponse.next();

  // Old blog → new blogs. The four legacy posts have bespoke targets (their new
  // slugs differ, so /blogs/{old-slug} would 404); everything else — including
  // the /blog root — falls back to the /blogs index rather than a dead page.
  if (first === "blog") {
    const slug = segments.slice(1).join("/");
    const mapped = OLD_BLOG_SLUG_TO_NEW[slug];
    return redirectTo(req, mapped ?? "/blogs");
  }

  // Single-segment static / role-root pages.
  if (segments.length === 1 && OLD_EXACT_PATH_TO_NEW[first]) {
    return redirectTo(req, OLD_EXACT_PATH_TO_NEW[first]);
  }

  // Any old product page — matched on the LAST segment so every prefix
  // (category root, city, distributor/suppliers/exporters) resolves at once.
  const last = segments[segments.length - 1];
  const productId = OLD_PRODUCT_SLUG_TO_ID[last];
  if (productId) {
    return redirectTo(req, `/products/${productId}`);
  }

  // Old category-root landing page → new category page.
  if (segments.length === 1 && OLD_CATEGORY_ROOT_TO_ID[first]) {
    return redirectTo(req, `/categories/${OLD_CATEGORY_ROOT_TO_ID[first]}`);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next internals, static files (with a dot), and _next.
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
