import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { getCategoryById, productCategories, CategorySlug } from "@/data/categories";
import { byLatestThenPopularity } from "@/lib/productSort";
import { solutions } from "@/data/solutions";
import { useCaseCombos } from "@/data/useCaseCombos";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { SITE, breadcrumbLd, categoryCollectionLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { buildCategoryFaqs, categorySizeRange } from "@/lib/categoryFaq";

export const revalidate = 3600;

// Category slugs are a fixed, fully-enumerated set (generateStaticParams below),
// so any other slug must 404 at the routing layer. Without this, unknown slugs
// stream through loading.tsx + ISR and notFound() returns a soft 200 instead of
// a real 404 (vercel/next.js#63478, #76501).
export const dynamicParams = false;

export async function generateStaticParams() {
  return productCategories.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: CategorySlug }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryById(slug);
  if (!category) return {};
  const url = `${SITE}/categories/${slug}`;
  return {
    title: `Samsung ${category.navLabel} — Price, Models & Specs`,
    description: `${category.description} Authorized Samsung distributor in India — B2B pricing, certified installation & AMC.`,
    keywords: [
      `Samsung ${category.navLabel}`,
      `${category.navLabel} price India`,
      `${category.navLabel} dealer`,
      "Samsung B2B",
      "Aplus Technology Solutions",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${category.navLabel} | Aplus Technology Solutions`,
      description: category.description,
      images: [{ url: `/categories/${slug}/opengraph-image`, width: 1200, height: 630, alt: category.navLabel }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.navLabel} | Aplus Technology Solutions`,
      description: category.description,
      images: [`/categories/${slug}/opengraph-image`],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: CategorySlug }>;
}) {
  const { slug } = await params;
  const category = getCategoryById(slug);

  if (!category) return notFound();

  const categoryProducts = products.filter(
    (p) => p.category === category.name
  ).sort(byLatestThenPopularity);

  // Group by subCategory when present (e.g. Commercial TV → Hotel TV / Business TV)
  const subCategories = Array.from(
    new Set(categoryProducts.map((p) => p.subCategory).filter(Boolean))
  ) as string[];

  const hasSubCategories = subCategories.length > 1;

  const sizeRange = categorySizeRange(categoryProducts);
  const faqs = buildCategoryFaqs(category, categoryProducts);

  const jsonLd = [
    categoryCollectionLd(category, categoryProducts),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: category.navLabel, url: `/categories/${slug}` },
    ]),
    faqPageLd(faqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* Hero banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10">

          {/* Breadcrumb — own line on mobile (wraps), floats right on md+ */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4 md:mb-0 md:float-right md:pt-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <span className="text-gray-600 font-medium">{category.navLabel}</span>
          </nav>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
              Samsung Authorized Distributor
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Samsung {category.navLabel}
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 text-sm md:text-base leading-relaxed">
              {category.subtitle}
            </p>

            {/* Quick facts + use cases (indexable, keyword-rich) */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                {categoryProducts.length} Samsung series
              </span>
              {sizeRange && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  Sizes {sizeRange}
                </span>
              )}
              {category.useCases.slice(0, 4).map((uc) => (
                <span
                  key={uc}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-medium"
                >
                  {uc}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview — indexable landing-page copy */}
        <div className="max-w-3xl mb-10">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            {category.overview}
          </p>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-lg font-medium text-gray-500">
              Products coming soon — contact us for availability.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact Sales
            </Link>
          </div>
        ) : hasSubCategories ? (
          /* Grouped layout for Commercial TV etc. */
          <div className="space-y-14">
            {subCategories.map((sub) => {
              const subProducts = categoryProducts.filter(
                (p) => p.subCategory === sub
              );
              return (
                <section key={sub}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    {sub}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
            {/* Products without a subCategory */}
            {categoryProducts.filter((p) => !p.subCategory).length > 0 && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts
                    .filter((p) => !p.subCategory)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Flat grid layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ── INDUSTRIES USING THIS CATEGORY ─────────────────────────────── */}
      {(() => {
        const combosForCategory = useCaseCombos.filter((c) => c.category === slug);
        if (combosForCategory.length === 0) return null;
        return (
          <section className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-3xl mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                  Industries we serve
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {category.navLabel} for your industry
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {combosForCategory.map((combo) => {
                  const sol = solutions.find((s) => s.slug === combo.industry);
                  if (!sol) return null;
                  return (
                    <Link
                      key={combo.industry}
                      href={`/solutions/${combo.industry}/${combo.category}`}
                      className="group bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                        {sol.title}
                      </p>
                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                        {combo.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-3">{combo.subtitle}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4 group-hover:gap-2 transition-all">
                        Explore <ArrowRight size={12} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section
          className="border-t border-gray-100"
          aria-labelledby="category-faq-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2
              id="category-faq-heading"
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-8"
            >
              Frequently asked questions
            </h2>
            <div className="max-w-3xl space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm open:shadow-md transition-shadow"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[15px] font-semibold text-gray-900">
                    {faq.q}
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-blue-600 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <div className="px-6 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
