"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ecosystemTabs } from "@/data/education";

export default function EcosystemTabs() {
  const [activeId, setActiveId] = useState(ecosystemTabs[0].id);
  const active = ecosystemTabs.find((t) => t.id === activeId) ?? ecosystemTabs[0];
  // Phone screenshots (portrait) need a narrower frame than dashboard shots.
  const isPortrait = active.id === "student" || active.id === "parent";

  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">
            One platform, four roles
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Built for everyone in the school
          </h2>
        </div>

        <div role="tablist" aria-label="Class Saathi stakeholders" className="flex flex-wrap justify-center gap-2 mb-10">
          {ecosystemTabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className="relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="eduTabPill"
                    className="absolute inset-0 bg-gray-900 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600 hover:text-gray-900"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12"
          >
            <div className="lg:col-span-6">
              <h3 className="text-2xl font-bold text-gray-900">{active.headline}</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{active.blurb}</p>
              <ul className="mt-6 space-y-4">
                {active.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                      <p className="text-sm text-gray-500">{feature.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:p-6 flex items-center justify-center">
                <Image
                  src={active.image}
                  alt={active.imageAlt}
                  width={isPortrait ? 474 : 1200}
                  height={isPortrait ? 975 : 675}
                  sizes="(max-width: 1024px) 92vw, 44vw"
                  className={`h-auto rounded-xl ${isPortrait ? "w-full max-w-60" : "w-full"}`}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
