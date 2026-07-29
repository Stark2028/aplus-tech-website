import { buildLegacySitemap } from "@/lib/legacySitemaps";

// Migration aid, not a permanent surface: the OLD WordPress sitemap URLs are
// still submitted in Google Search Console, so serving the legacy URL
// inventory here makes Google recrawl those URLs and discover their 301s
// fast. DELETE this route and its two siblings once the redirect wave is done
// (exit criterion: Phase B of docs/superpowers/plans/
// 2026-07-29-post-migration-seo-acceleration.md).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLegacySitemap(3), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
