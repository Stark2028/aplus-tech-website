import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import { solutions } from "@/data/solutions";
import { blogPosts } from "@/data/blogs";

const BASE = "https://www.aplustechsol.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/about`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blogs`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/quote`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryUrls: MetadataRoute.Sitemap = productCategories.map((cat) => ({
    url: `${BASE}/categories/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const solutionUrls: MetadataRoute.Sitemap = solutions.map((sol) => ({
    url: `${BASE}/solutions/${sol.slug}`,
    lastModified: new Date(),
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
