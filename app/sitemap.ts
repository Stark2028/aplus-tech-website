import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import { solutions } from "@/data/solutions";
import { blogPosts } from "@/data/blogs";

const BASE = "https://www.aplustechsol.com";

// Bump this date whenever you add or update products, categories, or solutions.
const CATALOG_LAST_UPDATED = new Date("2025-05-18");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,   lastModified: new Date("2025-01-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date("2025-01-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blogs`,   lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/quote`,   lastModified: new Date("2025-01-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,   lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryUrls: MetadataRoute.Sitemap = productCategories.map((cat) => ({
    url: `${BASE}/categories/${cat.id}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const solutionUrls: MetadataRoute.Sitemap = solutions.map((sol) => ({
    url: `${BASE}/solutions/${sol.slug}`,
    lastModified: CATALOG_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blogs/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productUrls, ...categoryUrls, ...solutionUrls, ...blogUrls];
}
