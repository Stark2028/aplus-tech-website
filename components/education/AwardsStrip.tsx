import { Award } from "lucide-react";
import { educationAwards, educationTrustLine } from "@/data/education";

export default function AwardsStrip() {
  return (
    <section className="bg-white border-b border-gray-100" aria-label="Class Saathi awards and recognition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Recognised across global education technology
        </p>
        <p className="text-center text-lg md:text-xl font-bold text-gray-900 mt-2 mb-8">
          {educationTrustLine}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {educationAwards.map((award) => (
            <div key={award.title} className="flex items-start gap-3">
              <Award size={16} className="mt-0.5 shrink-0 text-gray-300" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{award.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {award.issuer} · {award.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
