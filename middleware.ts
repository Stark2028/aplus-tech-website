import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  MERGED_PRODUCT_TO_CANONICAL,
} from "@/lib/redirects";

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
]);

/** Permanent redirect helper (301 — preserves ranking equity). */
function permanent(url: URL) {
  return NextResponse.redirect(url, 301);
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const clean = pathname.replace(/\/+$/, ""); // tolerate old trailing slashes
  if (clean === "") return NextResponse.next(); // home

  const segments = clean.split("/").filter(Boolean);
  const first = segments[0];

  // Products removed as duplicates still 301 to the twin they duplicated, so the
  // ranking equity of their URLs (and of every old slug that redirects into one)
  // survives the merge instead of dying on a 404. This MUST precede the
  // RESERVED_ROOTS check below, which would otherwise wave every /products/ path
  // straight through. Safe from looping because no canonical id is itself a key.
  if (first === "products" && segments.length === 2) {
    const canonical = MERGED_PRODUCT_TO_CANONICAL[segments[1]];
    if (canonical) {
      return permanent(new URL(`/products/${canonical}`, req.url));
    }
  }

  // Never interfere with the new site's own routes.
  if (RESERVED_ROOTS.has(first)) return NextResponse.next();

  // Old blog → new blogs (root and posts).
  if (first === "blog") {
    const rest = segments.slice(1).join("/");
    return permanent(new URL(rest ? `/blogs/${rest}` : "/blogs", req.url));
  }

  // Single-segment static / role-root pages.
  if (segments.length === 1 && OLD_EXACT_PATH_TO_NEW[first]) {
    return permanent(new URL(OLD_EXACT_PATH_TO_NEW[first], req.url));
  }

  // Any old product page — matched on the LAST segment so every prefix
  // (category root, city, distributor/suppliers/exporters) resolves at once.
  const last = segments[segments.length - 1];
  const productId = OLD_PRODUCT_SLUG_TO_ID[last];
  if (productId) {
    return permanent(new URL(`/products/${productId}`, req.url));
  }

  // Old category-root landing page → new category page.
  if (segments.length === 1 && OLD_CATEGORY_ROOT_TO_ID[first]) {
    return permanent(new URL(`/categories/${OLD_CATEGORY_ROOT_TO_ID[first]}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next internals, static files (with a dot), and _next.
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
