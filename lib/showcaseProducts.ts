import { products, type Product } from "@/data/products";

/**
 * A product is "showcased" when we actively promote it on browse surfaces.
 * Discontinued / not-in-production models are NOT showcased: they must vanish
 * from the /products grid, category pages, homepage catalog, product finder,
 * marquee, related rails, solutions pages and the 404 popular list.
 *
 * They stay fully live everywhere else — detail page, URL, sitemap, on-site
 * search and Google — so we keep the SEO of a model we simply no longer sell.
 * See the `discontinued` field in data/products.ts.
 *
 * Every browse surface MUST route its product list through this predicate (or
 * `showcaseProducts`) rather than testing `discontinued` inline, so the notion
 * of "browsable" stays defined in exactly one place.
 */
export function isShowcased(p: Product): boolean {
  return !p.discontinued;
}

/** All products that should appear on browse/showcase surfaces. */
export const showcaseProducts: Product[] = products.filter(isShowcased);
