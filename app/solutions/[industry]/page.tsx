import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";
import { solutions } from "@/data/solutions";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { getCategoryById } from "@/data/categories";
import { byLatestThenPopularity } from "@/lib/productSort";
import { useCaseCombos } from "@/data/useCaseCombos";
import ProductCard from "@/components/ProductCard";
import MobileProductScroller from "@/components/MobileProductScroller";
import type { Metadata } from "next";
import { SITE, breadcrumbLd, solutionServiceLd, jsonLdString } from "@/lib/jsonLd";

export const revalidate = 3600;

// Industry slugs are a fixed, fully-enumerated set (generateStaticParams below),
// so any other slug must 404 at the routing layer. Without this, unknown slugs
// stream through loading.tsx + ISR and notFound() returns a soft 200 instead of
// a real 404 (vercel/next.js#63478, #76501).
export const dynamicParams = false;

export async function generateStaticParams() {
    return solutions.map((s) => ({ industry: s.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ industry: string }>;
}): Promise<Metadata> {
    const { industry } = await params;
    const solution = solutions.find((s) => s.slug === industry);
    if (!solution) return { title: "Solution Not Found | Aplus Tech" };

    const url = `${SITE}/solutions/${industry}`;
    const description = `Samsung B2B display solutions for ${solution.title.toLowerCase()} — recommended hardware, sizing, and deployment guidance from Aplus Technology Solutions.`;
    return {
        title: `${solution.title} | Aplus Technology Solutions`,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
            title: `${solution.title} — Samsung B2B Display Solutions`,
            description,
            images: [{ url: `/solutions/${industry}/opengraph-image`, width: 1200, height: 630, alt: solution.title }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${solution.title} — Samsung B2B Display Solutions`,
            description,
            images: [`/solutions/${industry}/opengraph-image`],
        },
    };
}

const GRADIENTS: Record<string, string> = {
    hospitality: "from-teal-900 via-cyan-900 to-blue-950",
    corporate: "from-slate-900 via-blue-950 to-gray-900",
    education: "from-indigo-900 via-blue-900 to-violet-950",
    retail: "from-purple-900 via-fuchsia-900 to-rose-950",
};

const STATS = [
    { value: "5+", label: "Years Experience" },
    { value: "500+", label: "Deployments" },
    { value: "Pan-India", label: "Service Coverage" },
    { value: "Samsung", label: "Authorized Partner" },
];

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
    const { industry } = await params;
    const solution = solutions.find((s) => s.slug === industry);

    if (!solution) {
        notFound();
    }

    const recommendedProducts = showcaseProducts.filter((p) =>
        solution.recommendedSeries.some((series) => p.series.includes(series))
    ).sort(byLatestThenPopularity);

    const combosForIndustry = useCaseCombos.filter((c) => c.industry === industry);

    const accentGradient = GRADIENTS[industry] || "from-blue-900 via-blue-950 to-slate-900";

    const jsonLd = [
        solutionServiceLd(solution),
        breadcrumbLd([
            { name: "Home", url: "/" },
            { name: "Solutions", url: "/#solutions" },
            { name: solution.title, url: `/solutions/${solution.slug}` },
        ]),
    ];

    return (
        <div className="bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
            />
            <section className={`relative overflow-hidden bg-linear-to-br ${accentGradient}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
                    <nav className="flex items-center justify-end gap-1.5 text-xs text-blue-100/70 mb-12" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight size={12} aria-hidden="true" />
                        <span className="text-white/90 font-medium">{solution.title}</span>
                    </nav>

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
                        Samsung B2B Industry Solution
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-12">
                        {solution.title}
                    </h1>
                </div>

                {/* Stats bar — inside the hero, 1x4 format */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-t border-white/10 flex">
                        {STATS.map((s, i) => (
                            <div
                                key={s.label}
                                className={`py-6 md:py-7 text-center flex-1 ${i < STATS.length - 1 ? "border-r border-white/10" : ""}`}
                            >
                                <p className="text-xl md:text-3xl font-black text-white leading-none tracking-tight">{s.value}</p>
                                <p className="text-[9px] sm:text-[11px] md:text-xs font-medium text-blue-200/70 uppercase tracking-wider mt-2 px-1 sm:px-2 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {recommendedProducts.length > 0 && (
                <section className="py-12 md:py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                                Featured products
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Top recommendations for {solution.title.toLowerCase()}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {combosForIndustry.length > 0 && (
                <section className="py-12 md:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mb-12">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                                Display categories
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                Samsung displays used in {solution.title.toLowerCase()}
                            </h2>
                        </div>
                        <MobileProductScroller label="Recommended displays carousel" gridCols="md:grid-cols-2 lg:grid-cols-4" autoPlay={true} autoPlayInterval={3800} initialDelay={900}>
                            {combosForIndustry.map((combo) => {
                                const cat = getCategoryById(combo.category);
                                if (!cat) return null;
                                return (
                                    <Link
                                        key={combo.category}
                                        href={`/solutions/${combo.industry}/${combo.category}`}
                                        className="group bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                                            {cat.navLabel}
                                        </p>
                                        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                                            {combo.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-3">{combo.subtitle}</p>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-auto pt-4 group-hover:gap-2 transition-all">
                                            Explore <ArrowRight size={12} />
                                        </span>
                                    </Link>
                                );
                            })}
                        </MobileProductScroller>
                    </div>
                </section>
            )}

            <section className="py-12 md:py-16 bg-gray-50">
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
                                    Request a Quote <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-6 py-4 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                                >
                                    <Phone size={16} aria-hidden="true" /> Talk to a Specialist
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
