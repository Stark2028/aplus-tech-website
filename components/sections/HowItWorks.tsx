import Link from "next/link";
import { Phone } from "lucide-react";
import {
  MessageSquareIcon,
  PackageIcon,
  WrenchIcon,
  LifeBuoyIcon,
  IconTile,
} from "@/components/icons";
import AnimatedSection from "@/components/AnimatedSection";

const PROCESS_STEPS = [
  {
    icon: MessageSquareIcon,
    step: "01",
    title: "Consult",
    desc: "Tell us your space, use case, and budget. Our display specialists assess your exact requirements.",
  },
  {
    icon: PackageIcon,
    step: "02",
    title: "Select",
    desc: "We recommend the right products from our full Samsung catalog — no upsell, just the right fit.",
  },
  {
    icon: WrenchIcon,
    step: "03",
    title: "Install",
    desc: "Our certified technicians handle mounting, cabling, and software configuration at your location.",
  },
  {
    icon: LifeBuoyIcon,
    step: "04",
    title: "Support",
    desc: "Ongoing technical support, AMC contracts, and warranty management — we're with you long-term.",
  },
];

function StepCard({ step, i }: { step: typeof PROCESS_STEPS[0]; i: number }) {
  return (
    <div className="relative group h-full">
      {i < PROCESS_STEPS.length - 1 && (
        <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-linear-to-r from-blue-200 to-transparent z-10" />
      )}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-7 h-full group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <IconTile>
            <step.icon className="text-current" size={24} />
          </IconTile>
          <span className="text-4xl font-bold opacity-[0.15] text-gray-900 group-hover:text-blue-600 transition-colors" aria-hidden="true" role="presentation">
            {step.step}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-6 md:mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            From Inquiry to Installation in 4 Steps
          </h2>
        </AnimatedSection>

        {/* Mobile: continuous marquee (same speed as trusted brands) */}
        <div className="sm:hidden overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-8 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-8 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="animate-marquee-steps gap-4 py-1">
            {[...PROCESS_STEPS, ...PROCESS_STEPS].map((step, i) => (
              // Second copy exists only for the seamless marquee loop —
              // hide it from assistive tech so steps aren't announced twice.
              <div
                key={i}
                aria-hidden={i >= PROCESS_STEPS.length || undefined}
                className="shrink-0 w-[72vw] max-w-[260px]"
              >
                <StepCard step={step} i={i % PROCESS_STEPS.length} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: static grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((step, i) => (
            <StepCard key={i} step={step} i={i} />
          ))}
        </div>

        <div className="mt-6 md:mt-12 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          >
            <Phone size={18} />
            Talk to a Display Specialist
          </Link>
        </div>
      </div>
    </section>
  );
}
