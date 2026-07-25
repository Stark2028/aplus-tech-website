"use client";

import { usePathname, useRouter } from "next/navigation";
import { X, ArrowRight, Scale, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useComparison } from "@/context/ComparisonContext";

export default function ComparisonFloatingBar() {
    const { selectedProducts, removeFromCompare, clearCompare, limitReached } = useComparison();
    const pathname = usePathname();
    const router = useRouter();

    const visible = selectedProducts.length > 0 && pathname !== "/compare";

    const handleCompare = () => {
        if (selectedProducts.length < 2) {
            toast.error("Add at least 2 products to compare.");
            return;
        }
        router.push("/compare");
    };

    return (
        <div
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 transition-all duration-300"
            // `inert` alone hides + de-focuses the closed bar; adding aria-hidden
            // would fire the focused-ancestor a11y error when the "remove" button
            // that emptied the comparison list still holds focus as the bar hides.
            inert={!visible}
            style={{
                transform: visible ? "translateY(0)" : "translateY(100px)",
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
            }}
        >
            <div
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200"
                style={{
                    opacity: limitReached ? 1 : 0,
                    transform: limitReached ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: limitReached ? "auto" : "none",
                }}
            >
                <AlertCircle size={13} />
                Maximum 3 products can be compared at once
            </div>

            <div className="bg-white border border-gray-200 shadow-2xl rounded-3xl md:rounded-full p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 max-w-2xl w-full mx-auto ring-1 ring-black/5">

                {/* Label */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Scale size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">
                            Compare Products
                        </p>
                        <p className="text-xs text-gray-500">
                            {selectedProducts.length} selected (Max 3)
                        </p>
                    </div>
                </div>

                {/* Product chips — hidden on mobile to save space */}
                <div className="hidden md:flex flex-1 gap-2 overflow-x-auto no-scrollbar">
                    {selectedProducts.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full pl-3 pr-2 py-1"
                        >
                            <span className="text-xs font-medium text-gray-700 truncate max-w-24">
                                {p.name}
                            </span>
                            <button
                                onClick={() => removeFromCompare(p.id)}
                                aria-label={`Remove ${p.name} from comparison`}
                                className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={12} aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-4">
                    <button
                        onClick={clearCompare}
                        className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        type="button"
                        onClick={handleCompare}
                        aria-disabled={selectedProducts.length < 2}
                        className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
                    >
                        Compare
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
