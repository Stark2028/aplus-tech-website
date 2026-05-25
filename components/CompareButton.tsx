"use client";

import { Scale } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import type { Product } from "@/data/products";

interface CompareButtonProps {
  product: Product;
  className?: string;
  iconSize?: number;
}

export default function CompareButton({ product, className, iconSize = 15 }: CompareButtonProps) {
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();
  const isComparing = isInCompare(product.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCompareToggle}
      aria-pressed={isComparing}
      aria-label={isComparing ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
      className={`p-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md ${
        isComparing
          ? "bg-blue-600 text-white shadow-blue-600/30"
          : "bg-white/80 text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-md"
      } ${className || ""}`}
    >
      <Scale size={iconSize} strokeWidth={isComparing ? 2.5 : 2} />
    </button>
  );
}
