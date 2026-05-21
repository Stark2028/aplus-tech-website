import type { Metadata } from "next";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";
import ProductsCategoryNav from "@/components/ProductsCategoryNav";
import ProductsClientShell from "@/components/ProductsClientShell";

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

      <ProductsClientShell products={products} productCategories={productCategories} />
    </div>
  );
}
