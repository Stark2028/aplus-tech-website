import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { getCategoryById, CategorySlug } from "@/data/categories";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: CategorySlug }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryById(slug);
  if (!category) return {};
  return {
    title: `${category.navLabel} — Aplus Technology Solutions`,
    description: category.description,
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

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero banner */}
      <div className="bg-[#0d1526] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={15} />
            All Products
          </Link>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full mb-4">
            {categoryProducts.length} Products
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {category.navLabel}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">{category.description}</p>
          {category.tagline && (
            <div className="flex items-center gap-2 mt-4">
              <Tag size={14} className="text-blue-400" />
              <span className="text-blue-300 text-sm">{category.tagline}</span>
            </div>
          )}
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
