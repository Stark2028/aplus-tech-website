"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Monitor, Clock, Scale } from "lucide-react";
import { products } from "@/data/products";
import { useComparison } from "@/context/ComparisonContext";
import MobileProductScroller from "@/components/MobileProductScroller";
import { readRecentIds } from "@/components/recentViewed";

const STORAGE_KEY = "aplus_recently_viewed";
const MAX_STORED = 8;

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<typeof products>([]);
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();

  const handleCompareToggle = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {}

    // Prepend current, dedupe, cap — tolerant of corrupt/non-array stored data.
    const updated = readRecentIds(raw, currentProductId, MAX_STORED);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Show others (not current), up to 4
    const otherIds = updated.filter((id) => id !== currentProductId).slice(0, 4);
    const resolved = otherIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is (typeof products)[0] => p !== undefined);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentProducts(resolved);
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-gray-400" />
        <h2 className="text-lg font-bold text-gray-900">Recently Viewed</h2>
      </div>
      <MobileProductScroller gridCols="sm:grid-cols-4">
        {recentProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all relative block h-full"
          >
            {/* Compare Checkbox */}
            <button
              type="button"
              onClick={(e) => handleCompareToggle(e, product)}
              aria-pressed={isInCompare(product.id)}
              aria-label={isInCompare(product.id) ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
              className={`absolute top-2 right-2 z-20 p-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md ${
                isInCompare(product.id)
                  ? "bg-blue-600 text-white shadow-blue-600/30"
                  : "bg-white/80 text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <Scale size={14} strokeWidth={isInCompare(product.id) ? 2.5 : 2} />
            </button>

            <div className="h-28 bg-gray-50 relative overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 72vw, 25vw"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Monitor size={28} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-3 relative z-10">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                {product.series}
              </p>
              <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                <Link
                  href={`/products/${product.id}`}
                  className="before:absolute before:inset-0 before:z-0 focus:outline-none cursor-pointer"
                >
                  {product.name}
                </Link>
              </h3>
            </div>
          </div>
        ))}
      </MobileProductScroller>
    </section>
  );
}
