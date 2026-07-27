import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Phone } from "lucide-react";
import type { ProductCategory } from "@/data/categories";
import type { EducationSegment } from "@/data/educationSegments";
import { subPageCrumbs } from "@/lib/subPageCrumbs";
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import "./education.css";

// Code-split, same as EducationLanding — keeps the segment page light and
// feeds the same lead pipeline (POST /api/contact, lead_source "Class Saathi").
const BlueprintLeadForm = dynamic(() => import("./BlueprintLeadForm"));

interface EducationSegmentPageProps {
  segment: EducationSegment;
  category: ProductCategory;
}

/**
 * Class Saathi audience-segment page — same route shape as the Logitech VC
 * sub-pages (breadcrumb, hero, intro, body, FAQ, CTA) but in the emerald
 * Class Saathi visual language, not the blue site chrome. Server component:
 * fonts-accent is next/font and must never be imported from a "use client"
 * file (Turbopack build bug already hit once in this repo), so the variables
 * ride the wrapper className exactly as in EducationLanding.tsx.
 */
export default function EducationSegmentPage({ segment, category }: EducationSegmentPageProps) {
  const crumbs = subPageCrumbs(category, segment);

  return (
    <div className={`${spaceGrotesk.variable} ${plexMono.variable} min-h-screen bg-white`}>
      {/* Hero banner — same shape as the VC sub-page hero, emerald not blue. */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-10">

          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 mb-4 md:mb-0 md:float-right md:pt-1">
            {crumbs.map((crumb, i) => (
              <span key={crumb.url} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-gray-600 font-medium">{crumb.name}</span>
                ) : (
                  <Link href={crumb.url} className="hover:text-emerald-600 transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="min-w-0">
            <p className="edu-eyebrow text-emerald-700 mb-2">Class Saathi by TagHive</p>

            <h1 className="edu-display text-3xl md:text-4xl font-bold text-gray-900">
              {segment.title}
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500 text-sm md:text-base leading-relaxed">
              {segment.subtitle}
            </p>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Intro — indexable landing-page copy, doubles as the meta description. */}
        <div className="mb-10 max-w-3xl">
          <p className="text-gray-600 text-[15px] leading-normal">
            {segment.intro}
          </p>
        </div>

        {/* Points — card grid, the segment's evidence-backed claims. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {segment.points.map((point) => (
            <div
              key={point.title}
              className="edu-card-grad rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {point.title}
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                {point.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lead capture — same pipeline as the Class Saathi landing page. */}
      <section id="lead-form" className="scroll-mt-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <BlueprintLeadForm />
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      {segment.faqs.length > 0 && (
        <section
          className="border-t border-gray-100"
          aria-labelledby="segment-faq-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2
              id="segment-faq-heading"
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center"
            >
              Frequently asked questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {segment.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm open:shadow-md transition-shadow"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[15px] font-semibold text-gray-900">
                    {faq.q}
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-emerald-600 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <div className="edu-faq-body px-6 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">
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
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-emerald-950 to-slate-900 p-10 md:p-14">
            <div className="edu-cta-dots" aria-hidden="true" />
            <div className="edu-cta-aur a" aria-hidden="true" />
            <div className="edu-cta-aur b" aria-hidden="true" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h2 className="edu-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                  {segment.ctaHeading}
                </h2>
                <p className="text-emerald-100/90 text-lg max-w-xl leading-relaxed">
                  {segment.ctaBody}
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col gap-3">
                <Link
                  href="#lead-form"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-4 rounded-lg hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-950/30"
                >
                  {segment.ctaLabel}
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
