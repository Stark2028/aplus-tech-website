import { products } from "@/data/products";
import { blogPosts } from "@/data/blogs";
import { formatSizeRange } from "@/lib/formatSize";
import { modelCodesForProduct } from "@/lib/modelCodes";

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

  // Model-code matching: normalize to bare alphanumerics so "lh65 wafp" and
  // "LH65-WAFP" both hit "LH65WAFPLGCXXL". Require ≥4 chars so a stray size
  // number like "65" can't flood results with every same-size SKU.
  const codeQuery = query.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const matchCode = codeQuery.length >= 4;

  const productResults: SearchResult[] = products
    .flatMap((p) => {
      const textMatch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchedCode = matchCode
        ? modelCodesForProduct(p.id, p.specs.screenSizes).find((code) =>
            code.includes(codeQuery)
          )
        : undefined;

      if (!textMatch && !matchedCode) return [];
      return [{ p, matchedCode }];
    })
    .slice(0, 5)
    .map(({ p, matchedCode }) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      // Show the matched SKU when the hit came from a model-code search, so the
      // user sees exactly why this product surfaced.
      subtitle: matchedCode
        ? `Model ${matchedCode}`
        : `${p.category} · ${formatSizeRange(p.specs.screenSizes)}`,
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
