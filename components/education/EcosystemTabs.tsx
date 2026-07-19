"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ecosystemTabs } from "@/data/education";

/* Soft emerald glow shared by both frames (radial gradient, no blur filter). */
function FrameGlow() {
  return (
    <div
      aria-hidden="true"
      className="absolute -inset-10 bg-[radial-gradient(closest-side,rgba(16,185,129,0.16),transparent_72%)] pointer-events-none"
    />
  );
}

/* Phone bezel for the portrait student/parent screenshots. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-60">
      <FrameGlow />
      <div className="relative rounded-[2.4rem] bg-slate-900 p-2.5 shadow-2xl shadow-emerald-900/25">
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-[1]"
        />
        {children}
      </div>
    </div>
  );
}

/* Browser chrome for the landscape teacher/admin dashboard screenshots. */
function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <FrameGlow />
      <div className="relative rounded-2xl bg-white shadow-2xl shadow-emerald-900/15 ring-1 ring-gray-200 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <i className="w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden="true" />
          <i className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
          <i className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="ml-3 edu-mono text-[10px] text-gray-400 bg-white border border-gray-100 rounded-md px-2.5 py-0.5">
            Class Saathi · dashboard
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function EcosystemTabs() {
  const [activeId, setActiveId] = useState(ecosystemTabs[0].id);
  const active = ecosystemTabs.find((t) => t.id === activeId) ?? ecosystemTabs[0];
  // Phone screenshots (portrait) get the phone bezel; dashboards get browser chrome.
  const isPortrait = active.id === "student" || active.id === "parent";

  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="edu-eyebrow text-emerald-700 mb-3">One platform, four roles</p>
          <h2 className="edu-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
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
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12"
          >
            <div className="lg:col-span-6">
              <p className="edu-eyebrow text-emerald-700/80 mb-2">Class Saathi · {active.label}</p>
              <h3 className="edu-display text-2xl font-bold text-gray-900">{active.headline}</h3>
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
            <div className="lg:col-span-6 py-4">
              {isPortrait ? (
                <PhoneFrame>
                  <Image
                    src={active.image}
                    alt={active.imageAlt}
                    width={474}
                    height={975}
                    sizes="(max-width: 1024px) 60vw, 15rem"
                    className="w-full h-auto rounded-[1.9rem]"
                  />
                </PhoneFrame>
              ) : (
                <BrowserFrame>
                  <Image
                    src={active.image}
                    alt={active.imageAlt}
                    width={1200}
                    height={675}
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="w-full h-auto"
                  />
                </BrowserFrame>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
