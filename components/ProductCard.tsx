"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Scale, Clock, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useQuote } from "@/context/QuoteContext";
import { useComparison } from "@/context/ComparisonContext";
import { getProductBadge } from "@/lib/productBadges";

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

  const badgeStyles: Record<string, string> = {
    "Best Seller": "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/20",
    Popular: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/20",
    New: "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative">

      {/* Badge (Top Left) */}
      {badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm ${badgeStyles[badge]}`}>
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
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${
          isComparing 
            ? "bg-blue-600 text-white shadow-blue-600/30" 
            : "bg-white/80 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-md"
        }`}
      >
        <Scale size={16} strokeWidth={isComparing ? 2.5 : 2} aria-hidden="true" />
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
        className="relative h-64 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 border-b border-slate-100/50 p-6"
      >
        <div className="relative w-full h-full mix-blend-multiply">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={`${product.name} — Samsung ${product.series} ${product.category}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-300 font-medium">
              Image unavailable
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <div className="mb-5">
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50/80 text-blue-600 uppercase tracking-widest">
              {product.series}
            </span>
          </div>
          <h3 className="text-[1.15rem] font-bold text-slate-900 mt-1 mb-2.5 leading-snug tracking-tight line-clamp-2">
            <Link href={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 transition-colors group-hover:bg-blue-50/30 group-hover:border-blue-100/50">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Brightness</span>
            <span className="text-sm font-semibold text-slate-700">{product.specs.brightness}</span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 transition-colors group-hover:bg-blue-50/30 group-hover:border-blue-100/50">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Resolution</span>
            <span className="text-sm font-semibold text-slate-700 truncate block">{product.specs.resolution}</span>
          </div>
        </div>

        {/* Operation Rating */}
        <div className="flex items-center gap-2 mb-6 text-[13px] text-slate-500 bg-blue-50/50 rounded-lg py-2.5 px-3.5 border border-blue-100/30">
          <Clock size={14} className="text-blue-500 shrink-0" strokeWidth={2.5} />
          <span className="truncate">
            Rated for <strong className="text-slate-700 font-bold">{product.specs.operationTime}</strong> continuous operation
          </span>
        </div>

        {/* Footer Buttons */}
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={handleQuoteAdd}
            disabled={added}
            aria-label={`Add ${product.name} to quote cart`}
            className={`w-[55%] flex items-center justify-center gap-1.5 font-semibold py-2.5 px-2 rounded-xl transition-all duration-300 text-[13px] whitespace-nowrap shadow-sm ${
              added
                ? "bg-emerald-500 text-white cursor-default shadow-emerald-500/20"
                : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20 hover:-translate-y-0.5"
            }`}
          >
            {added ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
            {added ? "Added!" : "Add to Quote"}
          </button>

          <Link
            href={`/products/${product.id}`}
            className="w-[45%] flex items-center justify-center gap-1.5 border border-slate-200 bg-white text-slate-700 font-semibold py-2.5 px-2 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 text-[13px] whitespace-nowrap"
          >
            Details
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}