import { ChevronRight } from "lucide-react";
import { educationFaqs } from "@/data/education";

export default function EducationFaq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-gray-50 border-b border-gray-100" aria-labelledby="education-faq-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 id="education-faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {educationFaqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm open:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-[15px] font-semibold text-gray-900">
                {faq.q}
                <ChevronRight
                  size={18}
                  className="shrink-0 text-emerald-600 transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-6 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
