import { Check, X } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { participationComparison } from "@/data/education";

export default function ParticipationComparison() {
  const { before, after } = participationComparison;
  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">
            The participation gap
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            From a silent majority to a hundred-percent classroom
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <AnimatedSection className="h-full">
            <div className="h-full bg-white rounded-3xl border border-gray-200 p-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{before.title}</p>
              <p className="mt-4 text-5xl font-bold text-gray-300">{before.stat}</p>
              <p className="text-sm text-gray-400 mt-1">{before.statLabel}</p>
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
            <div className="h-full bg-white rounded-3xl border-2 border-emerald-200 ring-4 ring-emerald-50 p-8">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">{after.title}</p>
              <p className="mt-4 text-5xl font-bold text-emerald-600">{after.stat}</p>
              <p className="text-sm text-emerald-700/70 mt-1">{after.statLabel}</p>
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
