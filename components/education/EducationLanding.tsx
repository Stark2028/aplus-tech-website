import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { breadcrumbLd, faqPageLd, jsonLdString, classSaathiProductLd, itemListLd } from "@/lib/jsonLd";
import { educationFaqs } from "@/data/education";
import { educationSegments } from "@/data/educationSegments";
import { spaceGrotesk, plexMono } from "@/app/fonts-accent";
import EducationHero from "./EducationHero";
import AwardsStrip from "./AwardsStrip";
import ParticipationComparison from "./ParticipationComparison";
import HowItWorks from "./HowItWorks";
import EcosystemTabs from "./EcosystemTabs";
import EducationFaq from "./EducationFaq";
import ClosingCta from "./ClosingCta";
import "./education.css";

// Code-split the interactive islands so the landing stays light.
const ClassroomSimulator = dynamic(() => import("./simulator/ClassroomSimulator"));
const BlueprintLeadForm = dynamic(() => import("./BlueprintLeadForm"));

export default function EducationLanding() {
  const jsonLd = [
    classSaathiProductLd(),
    itemListLd(
      "Class Saathi guides",
      educationSegments.map((s) => ({
        name: s.navLabel,
        url: `/categories/education/${s.slug}`,
      }))
    ),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Education", url: "/categories/education" },
    ]),
    faqPageLd(educationFaqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <main className={`${spaceGrotesk.variable} ${plexMono.variable} min-h-screen bg-white`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <EducationHero />
      <AwardsStrip />
      <ParticipationComparison />
      <HowItWorks />
      <EcosystemTabs />

      {/* The page's single dark band — the live classroom theater. */}
      <section
        id="simulator"
        className="edu-sim-band relative overflow-hidden scroll-mt-24 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950"
      >
        <div className="edu-sim-dots" aria-hidden="true" />
        <div className="edu-sim-aur edu-sim-aur-a" aria-hidden="true" />
        <div className="edu-sim-aur edu-sim-aur-b" aria-hidden="true" />
        <div className="edu-sim-noise" aria-hidden="true" />
        <div className="edu-sim-vignette" aria-hidden="true" />
        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="edu-eyebrow text-emerald-400 mb-3">Live simulator</p>
            <h2 className="edu-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Try the clicker yourself
            </h2>
            <p className="mt-3 text-slate-400 text-sm md:text-base">
              Press a key, submit your answer, and watch the class results come in — exactly the loop students
              experience.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 edu-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Simulation · sample class data
            </p>
          </div>
          <ClassroomSimulator />
        </div>
      </section>

      {/* Lead capture */}
      <section id="lead-form" className="scroll-mt-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <BlueprintLeadForm />
        </div>
      </section>

      <EducationFaq />

      {/* Segment strip — the crawl path from this ranking parent down to the
          three audience/comparison pages; without it those pages are orphaned. */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="edu-eyebrow text-emerald-700 mb-3">Explore by audience</p>
            <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Class Saathi for your classroom
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationSegments.map((segment) => (
              <Link
                key={segment.slug}
                href={`/categories/education/${segment.slug}`}
                className="group edu-card-grad rounded-2xl p-6 flex flex-col hover:-translate-y-0.5 transition-transform"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{segment.navLabel}</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{segment.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  Learn more
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ClosingCta />
    </main>
  );
}
