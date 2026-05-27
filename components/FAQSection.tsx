import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/faqs";

/**
 * Server-rendered FAQ accordion using native <details>/<summary>.
 *
 * No client JS, no framer-motion. The chevron rotation is a pure CSS
 * transition driven by the `group-open` Tailwind variant. Multiple panels
 * can be open simultaneously, which is the friendlier default for buyers
 * comparing answers across questions.
 */
export default function FAQSection() {
  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              open={i === 0}
              className="group transition-colors duration-200 open:bg-slate-50/40"
            >
              <summary className="flex items-center justify-between w-full px-5 py-4 sm:px-6 sm:py-5 text-left gap-4 cursor-pointer list-none focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{faq.q}</span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-blue-600 transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <div className="px-5 pb-4 sm:px-6 sm:pb-5 text-gray-600 leading-relaxed text-xs sm:text-sm pt-2">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
