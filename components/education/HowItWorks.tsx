import { ClipboardList, Database, MousePointerClick, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import InView from "./InView";
import { howItWorksSteps } from "@/data/education";

// One Lucide glyph per brochure step (icons chrome per components/icons rules).
const STEP_ICONS = [ClipboardList, MousePointerClick, Database, Sparkles];

export default function HowItWorks() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="edu-eyebrow text-emerald-700 mb-3">In the classroom</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            How Class Saathi works in class
          </h2>
        </div>
        <InView className="relative max-w-6xl mx-auto">
          {/* Connecting draw-line through the 4 icon nodes; draws on scroll
              (edu-drawline transition). Desktop only — cards stack below lg. */}
          <svg
            className="hidden lg:block absolute top-0 left-[12.5%] w-3/4 h-14 pointer-events-none z-[1]"
            viewBox="0 0 900 56"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 28 C 120 28 180 8 300 8 S 480 48 600 48 S 780 28 900 28"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="100"
              className="edu-drawline"
            />
          </svg>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorksSteps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <AnimatedSection key={step.title} delay={i * 0.08} className="h-full">
                  <div className="h-full bg-gray-50 rounded-3xl border border-gray-100 p-6 pt-7">
                    <div className="relative z-[2] w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 ring-4 ring-white">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <p className="edu-mono text-[11px] uppercase tracking-[0.2em] text-emerald-700/70 mt-4">
                      Step 0{i + 1}
                    </p>
                    <h3 className="edu-display mt-1 text-base font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.detail}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </InView>
      </div>
    </section>
  );
}
