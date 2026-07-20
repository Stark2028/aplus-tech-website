import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import InView from "./InView";
import { participationComparison } from "@/data/education";

const SEATS = 20;
// Scattered "which seats participate" pattern for the before-card (8 of 20).
const BEFORE_LIT = new Set([0, 2, 5, 7, 10, 13, 16, 18]);

function SeatGrid({ litAll }: { litAll: boolean }) {
  return (
    <div className="mt-6 grid grid-cols-10 gap-1.5 max-w-55" aria-hidden="true">
      {Array.from({ length: SEATS }, (_, i) => (
        <i
          key={i}
          className={`edu-seat ${litAll || BEFORE_LIT.has(i) ? "" : "off"}`}
          style={{ "--i": String(i) } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default function ParticipationComparison() {
  const { before, after } = participationComparison;
  return (
    <section className="bg-gray-50 border-b border-gray-100 relative overflow-hidden">
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="edu-eyebrow text-emerald-700 mb-3">The participation gap</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            From a silent majority to a hundred-percent classroom
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <AnimatedSection className="h-full">
            <div className="h-full bg-white rounded-3xl border border-gray-200 p-8">
              <p className="edu-eyebrow text-gray-500">{before.title}</p>
              <p className="edu-display mt-4 text-5xl font-bold text-gray-300">
                <AnimatedCounter value={before.stat} />
              </p>
              <p className="text-sm text-gray-400 mt-1">{before.statLabel}</p>
              <InView>
                <SeatGrid litAll={false} />
              </InView>
              <ul className="mt-6 space-y-3">
                {before.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-gray-500">
                    <X size={16} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.12} className="h-full">
            <div className="edu-card-grad h-full rounded-3xl p-8">
              <p className="edu-eyebrow text-emerald-700">{after.title}</p>
              <p className="edu-display mt-4 text-5xl font-bold text-emerald-600">
                <AnimatedCounter value={after.stat} />
              </p>
              <p className="text-sm text-emerald-700/70 mt-1">{after.statLabel}</p>
              <InView>
                <SeatGrid litAll />
              </InView>
              <ul className="mt-6 space-y-3">
                {after.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
