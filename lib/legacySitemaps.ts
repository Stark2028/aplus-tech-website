import {
  OLD_PRODUCT_SLUG_TO_ID,
  OLD_CATEGORY_ROOT_TO_ID,
  OLD_EXACT_PATH_TO_NEW,
  OLD_BLOG_SLUG_TO_NEW,
} from "@/lib/redirects";
import { LEGACY_CITY_SLUGS } from "@/data/legacyCities";
import { SITE } from "@/lib/jsonLd";

export const LEGACY_SITEMAP_PARTS = 3;

// The old site's local-SEO role prefixes (/{role}/{product-slug}/).
const ROLE_PREFIXES = ["distributor", "suppliers", "exporters"] as const;

/**
 * Every legacy-WordPress URL path this site 301s (see proxy.ts). Served back
 * to Google at the OLD sitemap URLs (/sitemap/sitemap-N.xml — still submitted
 * in Search Console from the agency era) so Google recrawls the ~7.5k indexed
 * legacy URLs and discovers their redirects in weeks instead of months.
 *
 * City hub paths (/delhi/ …) are deliberately absent: those are live pages,
 * listed in the real sitemap. This file must only ever emit URLs that redirect
 * — lib/legacySitemaps.test.ts enforces it against proxy.ts itself.
 */
export function legacyPaths(): string[] {
  const paths: string[] = [];
  for (const root of Object.keys(OLD_EXACT_PATH_TO_NEW)) paths.push(`/${root}/`);
  for (const root of Object.keys(OLD_CATEGORY_ROOT_TO_ID)) paths.push(`/${root}/`);
  paths.push("/blog/");
  for (const slug of Object.keys(OLD_BLOG_SLUG_TO_NEW)) paths.push(`/blog/${slug}/`);
  for (const slug of Object.keys(OLD_PRODUCT_SLUG_TO_ID)) {
    paths.push(`/${slug}/`);
    for (const role of ROLE_PREFIXES) paths.push(`/${role}/${slug}/`);
    for (const city of LEGACY_CITY_SLUGS) paths.push(`/${city}/${slug}/`);
  }
  return [...new Set(paths)];
}

/** XML body for /sitemap/sitemap-{part}.xml (part is 1-based). */
export function buildLegacySitemap(part: number): string {
  const all = legacyPaths();
  const per = Math.ceil(all.length / LEGACY_SITEMAP_PARTS);
  const chunk = all.slice((part - 1) * per, part * per);
  const urls = chunk.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
