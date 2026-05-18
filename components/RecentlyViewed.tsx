"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Monitor, Clock } from "lucide-react";
import { products } from "@/data/products";

const STORAGE_KEY = "aplus_recently_viewed";
const MAX_STORED = 8;

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<typeof products>([]);

  useEffect(() => {
    let stored: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {}

    // Prepend current, dedupe, cap
    const updated = [currentProductId, ...stored.filter((id) => id !== currentProductId)].slice(
      0,
      MAX_STORED
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Show others (not current), up to 4
    const otherIds = updated.filter((id) => id !== currentProductId).slice(0, 4);
    const resolved = otherIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is (typeof products)[0] => p !== undefined);
    setRecentProducts(resolved);
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-gray-400" />
        <h2 className="text-lg font-bold text-gray-900">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="h-28 bg-gray-50 relative overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Monitor size={28} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                {product.series}
              </p>
              <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
