"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ShoppingBag, Scale } from "lucide-react";
import { MonitorIcon } from "@/components/icons";
import { Product } from "@/data/products";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { categoriesWithProducts } from "@/lib/nonEmptyCategories";
import { useQuote } from "@/context/QuoteContext";
import { useComparison } from "@/context/ComparisonContext";
import { trackEvent } from "@/lib/analytics";
import MobileProductScroller from "@/components/MobileProductScroller";
import { declusterByImage } from "@/lib/declusterImages";
import { formatSizeRange } from "@/lib/formatSize";
import { byLatestThenPopularity } from "@/lib/productSort";

export default function ProductCatalogSection() {
  const [activeTab, setActiveTab] = useState(categoriesWithProducts[0].name);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useQuote();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();

  const filtered = declusterByImage(
    showcaseProducts
      .filter((p) => p.category === activeTab)
      .sort(byLatestThenPopularity)
  );

  const handleCompareToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleAddToQuote = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId((prev) => (prev === product.id ? null : prev)), 1800);
    trackEvent("add_to_quote", {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
    });
  };

  const sizeRange = formatSizeRange;

  return (
    <section className="pt-4 pb-12 md:pt-6 md:pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative text-center mb-6 md:mb-10">
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
        <div className="flex justify-start md:justify-center gap-2 overflow-x-auto pb-2.5 snap-x no-scrollbar">
          {categoriesWithProducts.map((cat) => (
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

        {/* Product grid — or a coming-soon placeholder when the active tab
            (e.g. LED Signage before Phase 2) has no products yet. */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
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
        ) : (
        <MobileProductScroller label="Featured products carousel" gridCols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" autoPlay={true} autoPlayInterval={3900} initialDelay={3300}>
          {filtered.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group flex flex-col h-full"
            >
              {/* Image — fixed inner height normalises display size across
                  sources with differing whitespace/aspect ratios. */}
              <div className="h-48 bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden flex items-center justify-center px-6 py-5">
                {product.images && product.images.length > 0 ? (
                  <div className="relative w-full h-[120px]">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <MonitorIcon
                    className="text-gray-300 absolute inset-0 m-auto"
                    accentClassName="text-gray-300"
                    size={56}
                  />
                )}

                {product.subCategory && (
                  <span className="absolute top-3 left-3 bg-gray-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">
                    {product.subCategory}
                  </span>
                )}

                {/* Compare Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleCompareToggle(e, product)}
                  aria-pressed={isInCompare(product.id)}
                  aria-label={isInCompare(product.id) ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
                  className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md ${
                    isInCompare(product.id)
                      ? "bg-blue-600 text-white shadow-blue-600/30"
                      : "bg-white/80 text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md"
                  }`}
                >
                  <Scale size={15} strokeWidth={isInCompare(product.id) ? 2.5 : 2} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-snug min-h-10">
                  <Link
                    href={`/products/${product.id}`}
                    className="before:absolute before:inset-0 before:content-[''] before:cursor-pointer focus:outline-none"
                  >
                    {product.name}
                  </Link>
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
                <div className="mt-auto flex items-center gap-2 relative z-10">
                  <button
                    type="button"
                    onClick={(e) => handleAddToQuote(e, product)}
                    disabled={addedId === product.id}
                    aria-label={`Add to Quote — ${product.name}`}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                      addedId === product.id
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <Check size={14} aria-hidden="true" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} aria-hidden="true" />
                        Add to Quote
                      </>
                    )}
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`View ${product.name}`}
                    className="flex items-center justify-center w-9 h-9 border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-400 rounded-lg transition-colors"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </MobileProductScroller>
        )}

        {/* Bottom CTA */}
        <div className="mt-6 md:mt-10 text-center">
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
