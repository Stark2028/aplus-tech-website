"use client";

import Link from "next/link";
import { X, ArrowRight, Scale } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ComparisonFloatingBar() {
    const { selectedProducts, removeFromCompare, clearCompare } = useComparison();

    if (selectedProducts.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div className="bg-white border border-gray-200 shadow-2xl rounded-full p-4 flex items-center gap-6 max-w-2xl w-full mx-auto ring-1 ring-black/5">

                    <div className="flex items-center gap-3">
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

                    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
                        {selectedProducts.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full pl-3 pr-2 py-1"
                            >
                                <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                                    {p.name}
                                </span>
                                <button
                                    onClick={() => removeFromCompare(p.id)}
                                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
                        <button
                            onClick={clearCompare}
                            className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                        >
                            Clear
                        </button>
                        <Link
                            href="/compare"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-2 transition"
                        >
                            Compare
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
