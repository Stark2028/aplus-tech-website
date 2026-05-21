import { products } from "@/data/products";
import { blogPosts } from "@/data/blogs";

export interface SearchResult {
  type: "product" | "blog";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function computeSearchResults(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const productResults: SearchResult[] = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((p) => ({
      type: "product",
      id: p.id,
      title: p.name,
      subtitle: `${p.category} · ${p.specs.screenSizes.join(", ")}"`,
      href: `/products/${p.id}`,
    }));

  const blogResults: SearchResult[] = blogPosts
    .filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 3)
    .map((b) => ({
      type: "blog",
      id: b.slug,
      title: b.title,
      subtitle: b.excerpt.slice(0, 90) + "…",
      href: `/blogs/${b.slug}`,
    }));

  return [...productResults, ...blogResults];
}
