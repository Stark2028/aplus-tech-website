import Link from "next/link";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { VcRoomGuide } from "@/data/vcRoomGuides";
import { vcRoomGuides } from "@/data/vcRoomGuides";
import { showcaseProducts } from "@/lib/showcaseProducts";
import { subPageCrumbs } from "@/lib/subPageCrumbs";
import ProductCard from "@/components/ProductCard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

interface VcRoomGuideViewProps {
  guide: VcRoomGuide;
  category: ProductCategory;
}

const byId = new Map(showcaseProducts.map((p) => [p.id, p]));

export default function VcRoomGuideView({ guide, category }: VcRoomGuideViewProps) {
  const guideProducts = guide.productIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  const crumbs = subPageCrumbs(category, guide);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner — same shape as the category hero, one level deeper. */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10">

          {/* Breadcrumb — own line on mobile (wraps), floats right on md+ */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4 md:mb-0 md:float-right md:pt-1">
            {crumbs.map((crumb, i) => (
              <span key={crumb.url} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-gray-600 font-medium">{crumb.name}</span>
                ) : (
                  <Link href={crumb.url} className="hover:text-blue-600 transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">
              Logitech {category.navLabel}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {guide.title}
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 text-sm md:text-base leading-relaxed">
              {guide.subtitle}
            </p>

            {/* Room-band chips — same treatment as the category hero's "Best
                for" group. Platform guides have no roomBands, so this is
                room-guide only. */}
            {guide.kind === "room" && guide.roomBands && (
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Room sizes covered
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {guide.roomBands.map((band) => (
                    <span
                      key={band}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      {band}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Intro — indexable landing-page copy, doubles as the meta description. */}
        <div className="mb-10 max-w-3xl">
          <p className="text-gray-600 text-[15px] leading-normal">
            {guide.intro}
          </p>
        </div>

        {/* Product grid */}
        {guideProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {guideProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Sections — hand-written buying-guide copy, one H2 per topic. */}
        <div className="max-w-3xl space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {section.heading}
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* Sibling platform cross-link — only the two platform guides carry
            it, so each points at the other. */}
        {guide.kind === "platform" && (() => {
          const sibling = vcRoomGuides.find(
            (g) => g.kind === "platform" && g.slug !== guide.slug
          );
          if (!sibling) return null;
          return (
            <p className="mt-10 max-w-3xl text-sm text-gray-600">
              Deploying {sibling.navLabel} instead?{" "}
              <Link
                href={`/categories/video-conferencing/${sibling.slug}`}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                See the {sibling.navLabel} hardware guide
              </Link>
              .
            </p>
          );
        })()}
      </div>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      {guide.faqs.length > 0 && (
        <section
          className="border-t border-gray-100"
          aria-labelledby="guide-faq-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2
              id="guide-faq-heading"
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center"
            >
              Frequently asked questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {guide.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm open:shadow-md transition-shadow"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[15px] font-semibold text-gray-900">
                    {faq.q}
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-blue-600 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <div className="px-6 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-gray-900 p-10 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.3),transparent_50%)]" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                  {guide.ctaHeading}
                </h2>
                <p className="text-blue-100/90 text-lg max-w-xl leading-relaxed">
                  {guide.kind === "room"
                    ? "Share your room dimensions and we will recommend the right Logitech hardware, supply it, and install it across India."
                    : `Tell us how many rooms you are rolling out on ${guide.navLabel} and we will spec the hardware, supply it, and install it across India.`}
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col gap-3">
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/30"
                >
                  Request a Quote <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-6 py-4 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
