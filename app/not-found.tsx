"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Phone, ArrowRight, Monitor } from "lucide-react";
import { products } from "@/data/products";

const POPULAR = products.slice(0, 4);

const CATEGORIES = [
  { label: "Digital Signage", href: "/categories/digital-signage" },
  { label: "Video Walls", href: "/categories/video-walls" },
  { label: "Interactive Displays", href: "/categories/interactive" },
  { label: "Hospitality TV", href: "/categories/commercial-tv" },
];

export default function NotFound() {
  const openSearch = () =>
    window.dispatchEvent(new CustomEvent("aplus:search:open"));

  return (
    <main className="min-h-[90vh] bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* 404 graphic */}
          <div className="mb-8">
            <span className="text-[9rem] font-black text-gray-100 leading-none select-none">
              404
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>

          {/* Search trigger */}
          <button
            onClick={openSearch}
            className="inline-flex items-center gap-3 w-full max-w-sm mx-auto px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-400 transition-colors mb-6 group"
          >
            <Search size={16} className="shrink-0" />
            <span className="flex-1 text-left">Search products, guides…</span>
            <kbd className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400">
              ⌘K
            </kbd>
          </button>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>
            <a
              href="tel:+919310509909"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-7 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Phone size={15} />
              Call Sales
            </a>
          </div>
        </div>
      </div>

      {/* Popular products */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Popular Products</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POPULAR.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="h-32 bg-gray-50 relative overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
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
      </div>
    </main>
  );
}
