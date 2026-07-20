import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import ClassroomStage from "./hero/ClassroomStage";
import { educationHero } from "@/data/education";

export default function EducationHero() {
  const words = educationHero.headline.split(" ");
  const [eyebrowContext, eyebrowBrand] = educationHero.eyebrow.split(" · ");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/70 via-white to-white border-b border-gray-100">
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="edu-aur edu-aur-a" aria-hidden="true" />
      <div className="edu-aur edu-aur-b" aria-hidden="true" />
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6">
          <p
            className="edu-rise mb-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-emerald-600/20 shadow-sm shadow-emerald-600/10"
            style={{ animationDelay: "0.05s" }}
          >
            <i
              className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.45)]"
              aria-hidden="true"
            />
            <span className="edu-mono text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-600/90">
              {eyebrowContext}
            </span>
            {eyebrowBrand ? (
              <>
                <span className="w-px h-3 shrink-0 bg-emerald-600/25" aria-hidden="true" />
                <span className="edu-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-900">
                  {eyebrowBrand}
                </span>
              </>
            ) : null}
          </p>
          <h1 className="edu-display text-4xl md:text-5xl font-bold text-gray-900 leading-[1.05] tracking-tight">
            {words.map((word, i) => (
              <span key={word} className="hero-word" style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                {/* NBSP separator: trailing plain spaces get trimmed inside
                    inline-block spans, gluing the words together. */}
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
            <span
              className="hero-word edu-grad block!"
              style={{
                animationDelay: `${0.12 + words.length * 0.07}s`,
                // bg-clip-text + tight line-height clips descenders; add a
                // little vertical room and offset it (home-hero pattern).
                lineHeight: 1.18,
                paddingBottom: "0.08em",
                marginBottom: "-0.08em",
              }}
            >
              {educationHero.headlineAccent}
            </span>
          </h1>
          <p className="edu-rise mt-5 max-w-xl text-gray-600 text-base md:text-lg leading-relaxed" style={{ animationDelay: "0.4s" }}>
            {educationHero.sub}
          </p>
          <div className="edu-rise mt-6 flex flex-wrap gap-2" style={{ animationDelay: "0.5s" }}>
            {educationHero.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 ring-1 ring-emerald-600/15 shadow-sm text-emerald-900 text-xs font-semibold"
              >
                <i className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
          <div className="edu-rise mt-8 flex flex-col sm:flex-row gap-3" style={{ animationDelay: "0.6s" }}>
            <MagneticButton>
              <Link
                href="#simulator"
                className="edu-display inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-gray-900/10"
              >
                <Play size={16} aria-hidden="true" /> Try the live simulator
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#lead-form"
                className="edu-display inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-800 hover:text-emerald-700 px-7 py-3.5 rounded-xl font-semibold transition-colors group"
              >
                Request a school demo
                <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </div>
        <div className="lg:col-span-6">
          <ClassroomStage />
        </div>
      </div>
    </section>
  );
}
