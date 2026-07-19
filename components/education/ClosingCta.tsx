import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { educationClosing } from "@/data/education";

export default function ClosingCta() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="rounded-3xl bg-linear-to-br from-emerald-700 to-emerald-900 px-8 py-12 md:px-14 md:py-16 text-center relative overflow-hidden">
          <div className="edu-cta-dots" aria-hidden="true" />
          <div className="edu-cta-aur a" aria-hidden="true" />
          <div className="edu-cta-aur b" aria-hidden="true" />
          <h2 className="edu-display relative text-3xl md:text-4xl font-bold text-white leading-tight">
            {educationClosing.headline}
          </h2>
          <p className="relative mt-3 text-emerald-100/90 text-sm md:text-base max-w-xl mx-auto">
            {educationClosing.sub}
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <MagneticButton>
              <Link
                href="#simulator"
                className="edu-display inline-flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-7 py-3.5 rounded-xl font-semibold transition-colors"
              >
                <Play size={16} aria-hidden="true" /> Try the live simulator
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="#lead-form"
                className="edu-display inline-flex items-center justify-center gap-2 bg-emerald-600/40 border border-emerald-400/40 text-white hover:bg-emerald-600/60 px-7 py-3.5 rounded-xl font-semibold transition-colors group"
              >
                Request a school demo
                <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </MagneticButton>
          </div>
        </div>
        {/* Trademark attribution — end of page content, above the site footer. */}
        <p className="mt-8 text-center text-xs text-gray-400">{educationClosing.trademark}</p>
      </div>
    </section>
  );
}
