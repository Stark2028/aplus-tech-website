import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { educationHero } from "@/data/education";

export default function EducationHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white border-b border-gray-100">
      {/* Soft ambient wash behind the device card */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-emerald-100/50 blur-3xl pointer-events-none"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-4">
            {educationHero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.05] tracking-tight">
            {educationHero.headline}
            <span className="block text-emerald-700">{educationHero.headlineAccent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-gray-600 text-base md:text-lg leading-relaxed">
            {educationHero.sub}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {educationHero.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="#simulator"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-gray-900/10"
            >
              <Play size={16} aria-hidden="true" /> Try the live simulator
            </Link>
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-800 hover:text-emerald-700 px-7 py-3.5 rounded-xl font-semibold transition-colors group"
            >
              Request a school demo
              <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6">
          {/* The brochure render carries its own brand-green field — show it
              edge-to-edge in the card rather than padded on white. */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-900/10">
            <Image
              src="/education/class-saathi/clicker-duo.webp"
              alt="Class Saathi student clicker, teacher clicker and USB receiver"
              width={1230}
              height={1030}
              priority
              sizes="(max-width: 1024px) 92vw, 44vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
