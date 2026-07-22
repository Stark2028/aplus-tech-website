"use client";

import Link from "next/link";
import Image from "next/image";
import { Scale } from "lucide-react";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { useComparison } from "@/context/ComparisonContext";

export default function ProductMarquee() {
    const marqueeProducts = [...showcaseProducts, ...showcaseProducts];
    const { addToCompare, isInCompare, removeFromCompare } = useComparison();

    const handleCompareToggle = (e: React.MouseEvent, product: typeof showcaseProducts[0]) => {
      e.preventDefault();
      e.stopPropagation();
      if (isInCompare(product.id)) {
        removeFromCompare(product.id);
      } else {
        addToCompare(product);
      }
    };

    return (
        <section className="py-12 md:py-16 bg-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
                <h2 className="text-6xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Our Lineup
                </h2>
            </div>

            {/* Gradient masks for fading edges */}
            <div className="absolute top-0 left-0 w-32 h-full z-10 bg-linear-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-full z-10 bg-linear-to-l from-white to-transparent pointer-events-none" />

            <div className="flex relative overflow-hidden group">
                <div
                    className="flex gap-8 px-4 animate-marquee group-hover:[animation-play-state:paused]"
                    style={{ willChange: "transform" }}
                >
                    {marqueeProducts.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="relative shrink-0 w-64 md:w-80 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group/card block"
                        >
                            {/* Compare button */}
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
                            <div className="relative h-48 w-full bg-white p-6 flex items-center justify-center">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={200}
                                        height={200}
                                        className="object-contain w-full h-full transform transition-transform duration-300 group-hover/card:scale-105"
                                    />
                                ) : (
                                    <div className="text-gray-300 text-sm">No Image</div>
                                )}
                            </div>
                            <div className="p-4 bg-white border-t border-gray-100 relative z-10">
                                <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 min-h-12">
                                    <Link
                                      href={`/products/${product.id}`}
                                      className="before:absolute before:inset-0 before:z-0 focus:outline-none cursor-pointer"
                                    >
                                      {product.name}
                                    </Link>
                                </h3>
                                <p className="text-xs text-blue-600 font-medium mt-2 uppercase tracking-wide">
                                    {product.series}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
