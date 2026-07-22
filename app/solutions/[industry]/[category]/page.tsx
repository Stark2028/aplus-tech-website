import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone, Check } from "lucide-react";
import type { Metadata } from "next";
import { solutions } from "@/data/solutions";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import { byLatestThenPopularity } from "@/lib/productSort";
import { useCaseCombos, getCombo } from "@/data/useCaseCombos";
import ProductCard from "@/components/ProductCard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import {
  SITE,
  breadcrumbLd,
  industryCategoryServiceLd,
  faqPageLd,
  jsonLdString,
} from "@/lib/jsonLd";

export const revalidate = 3600;

// Valid industry+category pairs are the fixed set of useCaseCombos enumerated in
// generateStaticParams below. Any other pair (unknown industry, unknown category,
// or a valid-but-uncombined pair) must 404 at the routing layer. Without this,
// unknown pairs stream through loading.tsx + ISR and notFound() returns a soft
// 200 instead of a real 404 (vercel/next.js#63478, #76501).
export const dynamicParams = false;

interface PageParams {
  industry: string;
  category: CategorySlug;
}

export async function generateStaticParams() {
  return useCaseCombos.map((combo) => ({
    industry: combo.industry,
    category: combo.category,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { industry, category } = await params;
  const combo = getCombo(industry, category);
  if (!combo) return { title: "Solution Not Found | Aplus Tech" };

  const url = `${SITE}/solutions/${industry}/${category}`;
  return {
    title: combo.title,
    description: combo.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: combo.title,
      description: combo.intro,
      images: [{ url: `/solutions/${industry}/${category}/opengraph-image`, width: 1200, height: 630, alt: combo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: combo.title,
      description: combo.intro,
      images: [`/solutions/${industry}/${category}/opengraph-image`],
    },
  };
}

const GRADIENTS: Record<string, string> = {
  hospitality: "from-teal-900 via-cyan-900 to-blue-950",
  corporate: "from-slate-900 via-blue-950 to-gray-900",
  education: "from-indigo-900 via-blue-900 to-violet-950",
  retail: "from-purple-900 via-fuchsia-900 to-rose-950",
};

export default async function IndustryCategoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { industry, category } = await params;

  const combo = getCombo(industry, category);
  const solution = solutions.find((s) => s.slug === industry);
  const categoryObj = getCategoryById(category);

  if (!combo || !solution || !categoryObj) {
    notFound();
  }

  // Products matching BOTH this category AND one of the solution's recommended series.
  const matchingProducts = showcaseProducts.filter(
    (p) =>
      p.category === categoryObj.name &&
      solution.recommendedSeries.some((series) => p.series.includes(series))
  ).sort(byLatestThenPopularity);

  // Fallback: if the combo has no recommended-series matches, show top products in the category.
  const featuredProducts =
    matchingProducts.length > 0
      ? matchingProducts.slice(0, 8)
      : showcaseProducts.filter((p) => p.category === categoryObj.name).sort(byLatestThenPopularity).slice(0, 4);

  const showingFallback = matchingProducts.length === 0;
  const accentGradient = GRADIENTS[industry] || "from-blue-900 via-blue-950 to-slate-900";

  const jsonLd = [
    industryCategoryServiceLd(combo, solution, categoryObj, featuredProducts),
    faqPageLd(combo.faqs.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Solutions", url: "/#solutions" },
      { name: solution.title, url: `/solutions/${industry}` },
      { name: categoryObj.navLabel, url: `/solutions/${industry}/${category}` },
    ]),
  ];

  // Related combos in this industry (other categories under same industry).
  const relatedInIndustry = useCaseCombos.filter(
    (c) => c.industry === industry && c.category !== category
  );

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden bg-linear-to-br ${accentGradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <nav className="flex items-center justify-end gap-1.5 text-xs text-blue-100/70 mb-10 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href={`/solutions/${industry}`} className="hover:text-white transition-colors">
              {solution.title}
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/90 font-medium">{categoryObj.navLabel}</span>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
            {solution.title} · {categoryObj.navLabel}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            {combo.title}
          </h1>
          <p className="text-lg md:text-xl text-blue-100/90 mt-5 max-w-3xl leading-relaxed">
            {combo.subtitle}
          </p>
          <p className="text-sm md:text-base text-blue-100/80 mt-4 max-w-3xl leading-relaxed">
            {combo.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/30"
            >
              Request a Quote <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              Where it&apos;s used
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {categoryObj.navLabel} use cases for {solution.title.toLowerCase()}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {combo.useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Check size={18} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED PRODUCTS ─────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                  {showingFallback ? "From this category" : "Recommended for you"}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Samsung {categoryObj.navLabel.toLowerCase()} for {solution.title.toLowerCase()}
                </h2>
              </div>
              <Link
                href={`/categories/${category}`}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
              >
                View all {categoryObj.navLabel.toLowerCase()}
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {combo.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-gray-50 border border-gray-200 rounded-2xl p-6 open:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-base list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight
                    size={20}
                    className="shrink-0 text-blue-600 transition-transform duration-300 group-open:rotate-90"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED COMBOS IN SAME INDUSTRY ──────────────────────────────── */}
      {relatedInIndustry.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                Also for {solution.title.toLowerCase()}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Other display categories used in {solution.title.toLowerCase()}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedInIndustry.map((rc) => {
                const rcCategory = getCategoryById(rc.category);
                if (!rcCategory) return null;
                return (
                  <Link
                    key={rc.category}
                    href={`/solutions/${rc.industry}/${rc.category}`}
                    className="block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all group"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                      {rcCategory.navLabel}
                    </p>
                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {rc.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{rc.subtitle}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4 group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={12} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${accentGradient} p-10 md:p-14`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.3),transparent_50%)]" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                  {combo.ctaHeading}
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
