"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Monitor } from "lucide-react";
import { products } from "@/data/products";
import { productCategories } from "@/data/categories";

export default function ProductCatalogSection() {
  const [activeTab, setActiveTab] = useState(productCategories[0].name);

  const filtered = products.filter((p) => p.category === activeTab);

  const sizeRange = (sizes: string[]) => {
    if (sizes.length === 1) return `${sizes[0]}″`;
    return `${sizes[0]}″ – ${sizes[sizes.length - 1]}″`;
  };

  return (
    <section className="pt-6 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">
            Browse Our Full Range
          </h2>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition group absolute right-0 top-1/2 -translate-y-1/2"
          >
            View Full Catalog{" "}
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={18}
            />
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 snap-x">
          {productCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.name)}
              className={`shrink-0 snap-start px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === cat.name
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {cat.navLabel}
            </button>
          ))}
        </div>

        <div className="mt-4 mb-8" />

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div className="h-48 bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Monitor className="text-gray-300" size={56} />
                  </div>
                )}
{product.subCategory && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-gray-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">
                      {product.subCategory}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-blue-600 font-medium mb-3">
                  {product.series} Series
                </p>

                {/* Spec pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {product.specs.brightness}
                  </span>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {sizeRange(product.specs.screenSizes)}
                  </span>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    {product.specs.operationTime}
                  </span>
                </div>

                {/* CTAs */}
                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href="/contact"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors"
                  >
                    Get Quote
                  </Link>
                  <span
                    className="flex items-center justify-center w-9 h-9 border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-400 rounded-lg transition-colors"
                  >
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
          >
            View Full Product Catalog <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
