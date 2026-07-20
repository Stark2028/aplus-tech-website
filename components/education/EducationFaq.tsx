import { ChevronRight } from "lucide-react";
import { educationFaqs } from "@/data/education";

export default function EducationFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-gray-50 border-b border-gray-100 relative overflow-hidden"
      aria-labelledby="education-faq-heading"
    >
      <div className="edu-dots-light" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2
          id="education-faq-heading"
          className="edu-display text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center"
        >
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {educationFaqs.map((faq, i) => (
            <details
              key={faq.q}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-sm open:shadow-lg open:border-emerald-200 transition-shadow"
            >
              <summary className="flex items-center gap-4 cursor-pointer list-none px-6 py-5">
                <span className="edu-mono text-[11px] font-medium text-emerald-700/70 tracking-wider" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-semibold text-gray-900">{faq.q}</span>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-emerald-600 transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <div className="edu-faq-body px-6 pb-5 pl-[4.1rem] -mt-1 text-sm text-gray-600 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
