import { MetadataRoute } from "next";

const BASE = "https://www.aplustechsol.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",      // internal API routes
          "/compare",   // utility page — no SEO value
          "/quote",     // transactional page — no SEO value
          "/admin/",
          "/private/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
