import { MetadataRoute } from "next";

const BASE = "https://www.aplustechsol.com";

/**
 * AI crawlers we explicitly welcome.
 *
 * Policy: allow everything. Aplus is a distributor whose goal is discovery —
 * training exposure is how a model learns Aplus exists when nobody is browsing,
 * and retrieval bots are how it gets cited in a live answer.
 *
 * These are already permitted by the `*` rule below. Naming them makes the
 * policy deliberate and auditable, and keeps it intact if the wildcard is ever
 * tightened.
 */
export const AI_CRAWLERS = [
  // Retrieval / live citation
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-User",
  "Claude-SearchBot",
  "DuckAssistBot",
  // Training / index
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
  "YouBot",
  "Timpibot",
  "Diffbot",
] as const;

const DISALLOW = [
  "/api/",     // internal API routes
  "/compare",  // utility page — no SEO value
  "/quote",    // transactional page — no SEO value
  "/admin/",
  "/private/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
