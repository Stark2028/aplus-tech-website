import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { getCategoryById, CategorySlug } from "@/data/categories";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

const SITE = "https://www.aplustechsol.com";

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
    title: `${category.navLabel} — Aplus Technology Solutions`,
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${category.navLabel} | Aplus Technology Solutions`,
      description: category.description,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: category.navLabel }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.navLabel} | Aplus Technology Solutions`,
      description: category.description,
      images: ["/og-default.png"],
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
  );

  // Group by subCategory when present (e.g. Commercial TV → Hotel TV / Business TV)
  const subCategories = Array.from(
    new Set(categoryProducts.map((p) => p.subCategory).filter(Boolean))
  ) as string[];

  const hasSubCategories = subCategories.length > 1;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE}/products` },
      { "@type": "ListItem", position: 3, name: category.navLabel, item: `${SITE}/categories/${slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-gray-600 font-medium">{category.navLabel}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {/* Label */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                Samsung Authorized Distributor
              </p>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {category.navLabel}
              </h1>

              <p className="text-base text-gray-500 mb-2">{category.subtitle}</p>
              <p className="text-sm text-gray-400 mb-4 max-w-xl leading-relaxed">{category.description}</p>

              {/* Use-case chips */}
              <div className="flex flex-wrap gap-2">
                {category.useCases.map((uc) => (
                  <span
                    key={uc}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-gray-400 font-medium">
                {categoryProducts.length} products
              </span>
              <Link
                href="/quote"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                Request Quote
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      {subProducts.length} models
                    </span>
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
    </main>
  );
}
