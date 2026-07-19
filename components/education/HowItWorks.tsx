import AnimatedSection from "@/components/AnimatedSection";
import { howItWorksSteps } from "@/data/education";

export default function HowItWorks() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">
            In the classroom
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            How Class Saathi works in class
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {howItWorksSteps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.08} className="h-full">
              <div className="h-full bg-gray-50 rounded-3xl border border-gray-100 p-6 pt-7 relative">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.detail}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
