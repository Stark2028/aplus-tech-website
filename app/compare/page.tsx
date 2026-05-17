"use client";

import Link from "next/link";
import Image from "next/image";
import { useComparison } from "@/context/ComparisonContext";
import { ArrowLeft, X, ShoppingBag } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";

export default function ComparePage() {
    const { selectedProducts, removeFromCompare } = useComparison();
    const { addItem } = useQuote();

    if (selectedProducts.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">No Items to Compare</h1>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                    Go back to the product catalog and select items using the scale icon to see them here.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
                <Link href="/" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Catalog
                </Link>
            </div>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full min-w-[800px] table-fixed">
                    {/* Header Row: Images & Names */}
                    <thead>
                        <tr>
                            <th className="w-48 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">
                                Specification
                            </th>
                            {selectedProducts.map((product) => (
                                <th key={product.id} className="w-64 p-6 border-b border-r border-gray-200 relative group">
                                    <button
                                        onClick={() => removeFromCompare(product.id)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        <X size={18} />
                                    </button>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative w-32 h-32 mb-4">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                                            )}
                                        </div>
                                        <Link href={`/products/${product.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-4">{product.series}</p>

                                        <button
                                            onClick={() => addItem(product)}
                                            className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                                        >
                                            <ShoppingBag size={14} /> Add to Quote
                                        </button>
                                    </div>
                                </th>
                            ))}
                            {/* Fill empty columns if less than 3 */}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => (
                                <th key={`empty-${i}`} className="w-64 bg-gray-50/50 border-b border-gray-100">
                                    <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
                                        Select product
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {/* Dynamic Spec Rows - Assuming standard structure, but robustly mapping */}
                        {/* Basic Info */}
                        <tr>
                            <td className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">Category</td>
                            {selectedProducts.map(p => (
                                <td key={p.id} className="p-4 text-center text-gray-600 border-r border-gray-200">{p.category}</td>
                            ))}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => <td key={`e-${i}`} className="bg-gray-50/50"></td>)}
                        </tr>

                        {/* Specs */}
                        <tr>
                            <td className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">Resolution</td>
                            {selectedProducts.map(p => (
                                <td key={p.id} className="p-4 text-center text-gray-600 border-r border-gray-200">{p.specs.resolution}</td>
                            ))}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => <td key={`e-${i}`} className="bg-gray-50/50"></td>)}
                        </tr>
                        <tr>
                            <td className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">Brightness</td>
                            {selectedProducts.map(p => (
                                <td key={p.id} className="p-4 text-center text-gray-600 border-r border-gray-200">{p.specs.brightness}</td>
                            ))}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => <td key={`e-${i}`} className="bg-gray-50/50"></td>)}
                        </tr>
                        <tr>
                            <td className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">Operation Time</td>
                            {selectedProducts.map(p => (
                                <td key={p.id} className="p-4 text-center text-gray-600 border-r border-gray-200">{p.specs.operationTime}</td>
                            ))}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => <td key={`e-${i}`} className="bg-gray-50/50"></td>)}
                        </tr>
                        <tr>
                            <td className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">Screen Sizes</td>
                            {selectedProducts.map(p => (
                                <td key={p.id} className="p-4 text-center text-gray-600 border-r border-gray-200">
                                    {p.specs.screenSizes.join(", ")}
                                </td>
                            ))}
                            {[...Array(3 - selectedProducts.length)].map((_, i) => <td key={`e-${i}`} className="bg-gray-50/50"></td>)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
