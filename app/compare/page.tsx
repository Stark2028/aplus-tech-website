"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useComparison } from "@/context/ComparisonContext";
import { useQuote } from "@/context/QuoteContext";
import { products as allProducts } from "@/data/products";
import type { Product } from "@/data/products";
import {
  ArrowLeft, X, ShoppingBag, Printer, Share2, Check,
  Monitor, Plus,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SPEC_ROWS: { label: string; getValue: (p: Product) => string }[] = [
  { label: "Category", getValue: (p) => p.category },
  { label: "Series", getValue: (p) => p.series },
  { label: "Resolution", getValue: (p) => p.specs.resolution },
  { label: "Brightness", getValue: (p) => p.specs.brightness },
  { label: "Operation Hours", getValue: (p) => p.specs.operationTime },
  {
    label: "Available Sizes",
    getValue: (p) => p.specs.screenSizes.map((s) => `${s}"`).join(", "),
  },
  { label: "Sub-category", getValue: (p) => p.subCategory ?? "—" },
];

function EmptyState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
        <Plus size={36} className="text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">No products to compare</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Browse the catalog and click the scale icon on any product card to add it here.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
      >
        <ArrowLeft size={15} />
        Browse Products
      </Link>
    </div>
  );
}

function ComparePageInner() {
  const { selectedProducts, removeFromCompare, addToCompare } = useComparison();
  const { addItem } = useQuote();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Load from URL params on first render (enables link sharing)
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (!ids || selectedProducts.length > 0) return;
    ids.split(",").forEach((id) => {
      const product = allProducts.find((p) => p.id === id.trim());
      if (product) addToCompare(product);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL whenever comparison changes
  useEffect(() => {
    if (selectedProducts.length === 0) return;
    const ids = selectedProducts.map((p) => p.id).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("ids", ids);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [selectedProducts, router]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackEvent("compare_share", { product_count: selectedProducts.length });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    trackEvent("compare_print", { product_count: selectedProducts.length });
    window.print();
  };

  if (selectedProducts.length === 0) return <EmptyState />;

  const fillerCount = Math.max(0, 3 - selectedProducts.length);

  return (
    <>
      {/* Print styles injected via style tag */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-shadow { box-shadow: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={15} />
                Products
              </Link>
              <span className="text-gray-300">/</span>
              <h1 className="text-lg font-bold text-gray-900">
                Compare Products
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({selectedProducts.length} selected)
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                {copied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                <Printer size={14} />
                Print / PDF
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 table-fixed">

                {/* Product header row */}
                <thead>
                  <tr>
                    <th className="w-44 bg-gray-50 p-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-r border-gray-100 align-bottom">
                      Specification
                    </th>
                    {selectedProducts.map((product) => (
                      <th
                        key={product.id}
                        className="p-6 border-b border-r border-gray-100 relative group align-top"
                      >
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="no-print absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                          title="Remove from comparison"
                        >
                          <X size={12} />
                          Remove
                        </button>
                        <div className="flex flex-col items-center text-center">
                          <div className="relative w-28 h-28 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="112px"
                                className="object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Monitor size={28} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                            {product.series}
                          </span>
                          <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-bold text-gray-900 hover:text-blue-700 transition-colors leading-snug mb-4 line-clamp-3"
                          >
                            {product.name}
                          </Link>
                          <button
                            onClick={() => addItem(product)}
                            className="no-print inline-flex items-center gap-1.5 bg-gray-900 hover:bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-semibold transition-all"
                          >
                            <ShoppingBag size={12} />
                            Add to Quote
                          </button>
                        </div>
                      </th>
                    ))}

                    {/* Empty filler columns */}
                    {[...Array(fillerCount)].map((_, i) => (
                      <th
                        key={`empty-${i}`}
                        className="border-b border-r border-gray-100 bg-gray-50/30"
                      >
                        <Link
                          href="/products"
                          className="group h-full min-h-55 flex flex-col items-center justify-center gap-3 p-4"
                          title="Add a product to compare"
                        >
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50 flex items-center justify-center transition-all">
                            <Plus size={22} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                            Add product
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Spec rows */}
                <tbody>
                  {SPEC_ROWS.map((row, ri) => {
                    const values = selectedProducts.map((p) => row.getValue(p));
                    const allSame = values.every((v) => v === values[0]);
                    return (
                      <tr
                        key={row.label}
                        className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-gray-600 border-r border-gray-100">
                          {row.label}
                        </td>
                        {selectedProducts.map((p, pi) => (
                          <td
                            key={p.id}
                            className={`px-5 py-4 text-sm text-center border-r border-gray-100 ${
                              !allSame && values.length > 1
                                ? "text-gray-900 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {row.getValue(p)}
                          </td>
                        ))}
                        {[...Array(fillerCount)].map((_, i) => (
                          <td key={`ef-${i}`} className="bg-gray-50/30 border-r border-gray-100" />
                        ))}
                      </tr>
                    );
                  })}

                  {/* Key features row */}
                  <tr className="bg-white border-t-2 border-gray-100">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-600 border-r border-gray-100 align-top">
                      Key Features
                    </td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="px-5 py-4 border-r border-gray-100 align-top">
                        <ul className="space-y-1.5">
                          {p.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Check size={9} className="text-blue-600" strokeWidth={3} />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                    {[...Array(fillerCount)].map((_, i) => (
                      <td key={`ef-${i}`} className="bg-gray-50/30 border-r border-gray-100" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-400 no-print">
            Tip: Click &ldquo;Share&rdquo; to copy a link — procurement teams can open your exact comparison.
          </p>
        </div>
      </div>
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ComparePageInner />
    </Suspense>
  );
}
