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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Add to Quote Cart Button */}
            <button
                onClick={handleAddToCart}
                disabled={added}
                className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${added
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                    }`}
            >
                {added ? <Check size={20} /> : <ShoppingBag size={20} />}
                {added ? "Added to Quote" : "Add to Quote List"}
            </button>

            {/* Compare Button */}
            <button
                onClick={handleCompareToggle}
                className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 border-2 transition-all ${isComparing
                        ? "bg-blue-50 border-blue-600 text-blue-600"
                        : "border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                    }`}
            >
                <Scale size={20} />
                {isComparing ? "Comparing" : "Compare"}
            </button>
        </div>
    );
}
