"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";
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
        hospitality: "from-teal-900 via-cyan-900 to-blue-950",
        corporate: "from-slate-900 via-blue-950 to-gray-900",
        education: "from-indigo-900 via-blue-900 to-violet-950",
        retail: "from-purple-900 via-fuchsia-900 to-rose-950",
    };

    const accentGradient = gradients[slug] || "from-blue-900 via-blue-950 to-slate-900";

    const stats = [
        { value: "15+", label: "Years Experience" },
        { value: "500+", label: "Deployments" },
        { value: "Pan-India", label: "Service Coverage" },
        { value: "Samsung", label: "Authorized Partner" },
    ];

    return (
        <main className="bg-white">
            {/* ───────────────── Hero ───────────────── */}
            <section className={`relative overflow-hidden bg-linear-to-br ${accentGradient}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-blue-100/70 mb-12">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <span className="text-white/90 font-medium">{solution.title}</span>
                    </nav>

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
                        Samsung B2B Industry Solution
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                        {solution.title}
                    </h1>
                </div>
            </section>

            {/* ───────────────── Trust Strip ───────────────── */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((s, i) => (
                            <div
                                key={s.label}
                                className={`px-2 md:px-6 ${i > 0 ? "md:border-l md:border-gray-100" : ""}`}
                            >
                                <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1.5 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────── Recommended Products ───────────────── */}
            {recommendedProducts.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ───────────────── CTA ───────────────── */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${accentGradient} p-10 md:p-14`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.3),transparent_50%)]" />
                        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7">
                                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                                    Planning a {solution.title.toLowerCase()} project?
                                </h2>
                                <p className="text-blue-100/90 text-lg max-w-xl leading-relaxed">
                                    Share your requirements and our solution architects will recommend the right Samsung hardware, sizing, and deployment plan.
                                </p>
                            </div>
                            <div className="lg:col-span-5 flex flex-col gap-3">
                                <Link
                                    href="/quote"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/30"
                                >
                                    Request a Quote <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-6 py-4 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                                >
                                    <Phone size={16} /> Talk to a Specialist
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
