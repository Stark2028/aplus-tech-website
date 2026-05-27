"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AutoSlider from "@/components/AutoSlider";

interface Combo {
  industry: string;
  category: string;
  title: string;
  subtitle: string;
}

interface Solution {
  slug: string;
  title: string;
}

interface Props {
  combos: Combo[];
  solutions: Solution[];
  heading: string;
}

export default function IndustriesSlider({ combos, solutions, heading }: Props) {
  const cards = combos.map((combo) => {
    const sol = solutions.find((s) => s.slug === combo.industry);
    if (!sol) return null;
    return (
      <Link
        key={combo.industry}
        href={`/solutions/${combo.industry}/${combo.category}`}
        className="group bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
          {sol.title}
        </p>
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
          {combo.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{combo.subtitle}</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-4 group-hover:gap-2 transition-all">
          Explore <ArrowRight size={12} />
        </span>
      </Link>
    );
  }).filter(Boolean) as React.ReactNode[];

  if (cards.length === 0) return null;

  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
            Industries we serve
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {heading}
          </h2>
        </div>
        <AutoSlider slideWidth="w-[78vw]" slideMaxWidth="max-w-[300px]" interval={3500}>
          {cards}
        </AutoSlider>
      </div>
    </section>
  );
}
