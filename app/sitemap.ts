import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import { solutions } from "@/data/solutions";
import { blogPosts } from "@/data/blogs";
import { useCaseCombos } from "@/data/useCaseCombos";
import { vcRoomGuides } from "@/data/vcRoomGuides";
import { educationSegments } from "@/data/educationSegments";
import { cities } from "@/data/cities";
import { SITE } from "@/lib/jsonLd";

// Bump this date whenever you add or update products, categories, or solutions.
const CATALOG_LAST_UPDATED = new Date("2026-07-26");

export default function sitemap(): MetadataRoute.Sitemap {
  // NOTE: /quote and /compare are intentionally omitted — they are transactional
  // utility pages and are disallowed in robots.ts. Keeping them out of the sitemap
  // keeps the two files consistent for crawlers.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}`,                lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/products`,        lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/product-finder`,  lastModified: CATALOG_LAST_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/about`,           lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/contact`,         lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blogs`,           lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE}/samsung-india-model-codes`, lastModified: CATALOG_LAST_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/locations`,       lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/privacy`,         lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,           lastModified: CATALOG_LAST_UPDATED,  changeFrequency: "yearly",  priority: 0.3 },
  ];

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/products/${p.id}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryUrls: MetadataRoute.Sitemap = productCategories.map((cat) => ({
    url: `${SITE}/categories/${cat.id}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const solutionUrls: MetadataRoute.Sitemap = solutions.map((sol) => ({
    url: `${SITE}/solutions/${sol.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  // Programmatic landing pages — industry × category combos.
  const comboUrls: MetadataRoute.Sitemap = useCaseCombos.map((combo) => ({
    url: `${SITE}/solutions/${combo.industry}/${combo.category}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Logitech VC room/platform guides and Class Saathi segment pages —
  // nested under /categories/{video-conferencing,education}/{slug}.
  const vcGuideUrls: MetadataRoute.Sitemap = vcRoomGuides.map((g) => ({
    url: `${SITE}/categories/video-conferencing/${g.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const educationSegmentUrls: MetadataRoute.Sitemap = educationSegments.map((s) => ({
    url: `${SITE}/categories/education/${s.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE}/${c.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...solutionUrls,
    ...comboUrls,
    ...blogUrls,
    ...vcGuideUrls,
    ...educationSegmentUrls,
    ...cityUrls,
  ];
}
