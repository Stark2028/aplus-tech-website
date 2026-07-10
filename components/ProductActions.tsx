"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { useQuote } from "@/context/QuoteContext";
import { useComparison } from "@/context/ComparisonContext";
import { ShoppingBag, Scale, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function ProductActions({ product }: { product: Product }) {
    const { addItem } = useQuote();
    const { addToCompare, isInCompare, removeFromCompare } = useComparison();
    const [added, setAdded] = useState(false);

    const isComparing = isInCompare(product.id);

    const handleAddToCart = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        trackEvent("add_to_quote", {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
        });
    };

    const handleCompareToggle = () => {
        if (isComparing) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <div className="flex flex-col gap-3 mb-1">
            {/* Primary CTA — full width */}
            <button
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${added
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20 hover:-translate-y-0.5"
                    }`}
            >
                {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                {added ? "Added to Quote" : "Add to Quote List"}
            </button>

            {/* Compare — secondary, full width (matches the stack's sizing) */}
            <button
                onClick={handleCompareToggle}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 border transition-all duration-300 ${isComparing
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm"
                    }`}
            >
                <Scale size={16} strokeWidth={isComparing ? 2.5 : 2} />
                {isComparing ? "Added to Compare" : "Compare"}
            </button>
        </div>
    );
}
