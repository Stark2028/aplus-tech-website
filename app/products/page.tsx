import type { Metadata } from "next";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { categoriesWithProducts } from "@/lib/nonEmptyCategories";
import ProductsCategoryNav from "@/components/ProductsCategoryNav";
import ProductsClientShell from "@/components/ProductsClientShell";
import { allProductsCollectionLd, breadcrumbLd, jsonLdString } from "@/lib/jsonLd";

export const revalidate = 3600;

const PRODUCTS_URL = "https://www.aplustechsol.com/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Samsung Smart Signage, Video Walls, Interactive Displays, LED Signage, Hospitality & Business TVs and cloud software, plus Logitech video conferencing systems — supplied, installed and supported across India by Aplus Technology Solutions.",
  alternates: { canonical: PRODUCTS_URL },
  openGraph: {
    type: "website",
    url: PRODUCTS_URL,
    title: "Commercial Displays & Video Conferencing | Aplus Technology Solutions",
    description:
      "Browse Samsung Smart Signage, Video Walls, Interactive Displays, LED Signage, Hospitality & Business TVs and cloud software, plus Logitech video conferencing systems — supplied, installed and supported across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Samsung Commercial Displays — Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Displays & Video Conferencing | Aplus Technology Solutions",
    description:
      "Browse Samsung Smart Signage, Video Walls, Interactive Displays, LED Signage, Hospitality & Business TVs and cloud software, plus Logitech video conferencing systems — supplied, installed and supported across India.",
    images: ["/og-default.png"],
  },
};

export default function ProductsListingPage() {
  // ItemList mirrors the grid below, so it is built from showcaseProducts —
  // the same list ProductsClientShell renders — not from every product in data/.
  const jsonLd = [
    allProductsCollectionLd(showcaseProducts),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
    ]),
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* Hero header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Authorized Samsung Distributor · Logitech Video Conferencing · India
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commercial Displays & Video Conferencing
          </h1>
        </div>
      </div>

      <ProductsCategoryNav />

      <ProductsClientShell
        products={showcaseProducts}
        productCategories={categoriesWithProducts}
      />
    </div>
  );
}
