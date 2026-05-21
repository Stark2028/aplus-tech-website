"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Scale, Users, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useQuote } from "@/context/QuoteContext";
import { useComparison } from "@/context/ComparisonContext";
import { getProductBadge, getInquiryCount } from "@/lib/productBadges";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.[0];
  const router = useRouter();
  const { addItem } = useQuote();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();
  const [added, setAdded] = useState(false);

  const handleImageClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleQuoteAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isComparing = isInCompare(product.id);
  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const badge = getProductBadge(product.id);
  const inquiryCount = getInquiryCount(product.id);

  const badgeStyles: Record<string, string> = {
    "Best Seller": "bg-amber-500 text-white",
    Popular: "bg-blue-600 text-white",
    New: "bg-emerald-500 text-white",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group relative">

      {/* Badge (Top Left) */}
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${badgeStyles[badge]}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Compare Checkbox (Top Right) */}
      <button
        type="button"
        onClick={handleCompareToggle}
        aria-pressed={isComparing}
        aria-label={isComparing ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors shadow-sm ${isComparing ? "bg-blue-600 text-white" : "bg-white/80 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
          }`}
      >
        <Scale size={18} aria-hidden="true" />
      </button>

      {/* Product Image Area */}
      <div
        onClick={handleImageClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleImageClick();
          }
        }}
        aria-label={`View details for ${product.name}`}
        className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
      >
        <div className="relative w-full h-full">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${product.name} — Samsung ${product.series} ${product.category}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <div className="mb-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
            {product.series}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">
            <Link href={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div>
            <span className="block text-xs font-semibold text-gray-400">Brightness</span>
            {product.specs.brightness}
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400">Resolution</span>
            {product.specs.resolution}
          </div>
        </div>

        {/* Inquiry social proof */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-400">
          <Users size={12} className="text-blue-400" />
          <span>
            <span className="font-semibold text-gray-600">{inquiryCount}</span> businesses inquired this week
          </span>
        </div>

        {/* Footer Buttons */}
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={handleQuoteAdd}
            disabled={added}
            aria-label={`Add ${product.name} to quote cart`}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition-colors text-sm ${
              added
                ? "bg-green-600 text-white cursor-default"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {added ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
            {added ? "Added!" : "Add to Quote"}
          </button>

          <Link
            href={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-sm"
          >
            Details
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}