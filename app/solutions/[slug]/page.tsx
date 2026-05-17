"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { solutions } from "@/data/solutions";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { use } from "react";

export default function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const solution = solutions.find((s) => s.slug === slug);

    if (!solution) {
        notFound();
    }

    const recommendedProducts = products.filter((p) =>
        solution.recommendedSeries.some((series) => p.series.includes(series))
    );

    const gradients: Record<string, string> = {
        hospitality: "bg-linear-to-r from-teal-900 to-blue-900",
        corporate: "bg-linear-to-r from-slate-900 to-gray-800",
        education: "bg-linear-to-r from-indigo-900 to-blue-800",
        retail: "bg-linear-to-r from-purple-900 to-pink-900",
    };

    const bgGradient = gradients[slug] || "bg-linear-to-r from-blue-900 to-slate-900";

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className={`relative h-[50vh] min-h-[400px] w-full overflow-hidden ${bgGradient} flex items-center`}>
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                <div className="relative z-10 w-full px-6 max-w-7xl mx-auto flex flex-col justify-center h-full">
                    <Link
                        href="/"
                        className="text-blue-200 hover:text-white mb-6 flex items-center gap-2 font-medium w-fit transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {solution.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl font-light">
                        {solution.subtitle}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Overview & Benefits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Tailored Visual Solutions
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                            {solution.description}
                        </p>
                        <div className="space-y-6">
                            {solution.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <benefit.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Removed placeholder image block */}
                </div>

                {/* Recommended Products */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                        Recommended For {solution.title}
                    </h2>

                    {recommendedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {recommendedProducts.map(product => (
                                <div key={product.id} className="h-full">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No specific products currently highlighted for this sector. Please view our full catalog.</p>
                    )}
                </div>

                {/* Call to Action */}
                <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Get a custom quote tailored to your project requirements. Our experts are here to help you choose the right display solution.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        Contact Sales Team
                    </Link>
                </div>

            </div>
        </div>
    );
}
