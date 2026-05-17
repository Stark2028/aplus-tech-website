"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Hotel,
  Building2,
  GraduationCap,
  Store,
  ArrowRight,
} from "lucide-react";
import { solutions } from "@/data/solutions";

const SOLUTION_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  hospitality: Hotel,
  corporate: Building2,
  education: GraduationCap,
  retail: Store,
};

export default function CategoryGrid() {
  return (
    <section id="categories" className="py-20 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay for text readability - Increased opacity to replace blur */}
        <div className="absolute inset-0 bg-[#0f172a]/90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Industry Solutions
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Tailored display technologies designed to meet the unique challenges of your sector.
          </p>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => {
            const Icon = SOLUTION_ICONS[solution.id];
            return (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/solutions/${solution.slug}`}
                  className="block group h-full"
                >
                  <div
                    className="bg-slate-900/80 rounded-xl border border-slate-700 p-8 h-full flex flex-col hover:bg-slate-800 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 transform group-hover:-translate-y-1 will-change-transform"
                  >
                    {/* Icon Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-blue-900/50 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        {Icon && <Icon size={28} />}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {solution.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 mb-6 flex-grow leading-relaxed group-hover:text-slate-200 text-sm">
                      {solution.subtitle}
                    </p>

                    {/* "Learn More" Link Style */}
                    <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight size={18} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}