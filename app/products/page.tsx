import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import ProductsCategoryNav from "@/components/ProductsCategoryNav";

const PRODUCTS_URL = "https://www.aplustechsol.com/products";

export const metadata: Metadata = {
  title: "Products | Aplus Technology Solutions",
  description:
    "Browse Samsung Smart Signage, Video Walls, Interactive Displays, Business TVs, and Hospitality TVs distributed by Aplus Technology Solutions.",
  alternates: { canonical: PRODUCTS_URL },
  openGraph: {
    type: "website",
    url: PRODUCTS_URL,
    title: "Samsung Commercial Display Portfolio | Aplus Technology Solutions",
    description:
      "Browse Samsung Smart Signage, Video Walls, Interactive Displays, Business TVs, and Hospitality TVs. Authorized distributor — Noida, India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Samsung Commercial Displays — Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samsung Commercial Display Portfolio | Aplus Technology Solutions",
    description:
      "Browse Samsung Smart Signage, Video Walls, Interactive Displays, Business TVs, and Hospitality TVs. Authorized distributor — Noida, India.",
    images: ["/og-default.png"],
  },
};

export default function ProductsListingPage() {
  const productsByCategory = productCategories.map((category) => ({
    category,
    items: products.filter((product) => product.category === category.name),
  }));

  const nonEmpty = productsByCategory.filter((g) => g.items.length > 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Authorized Samsung Distributor · Noida, India
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Samsung Commercial Display Portfolio
          </h1>
          
        </div>
      </div>

      <ProductsCategoryNav />

      {/* Products grouped by category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {nonEmpty.map(({ category, items }) => (
          <section key={category.id} id={category.id} className="scroll-mt-28">
            {/* Section header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{category.name}</h2>
                <p className="text-sm text-gray-500 mb-3">{category.subtitle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {category.useCases.map((uc) => (
                    <span
                      key={uc}
                      className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={`/categories/${category.id}`}
                className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-1"
              >
                View all →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
