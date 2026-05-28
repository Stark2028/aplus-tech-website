"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { productCategories } from "@/data/categories";

const NAV_OFFSET = 120;

function ProductsCategoryNavContent() {
  const [activeId, setActiveId] = useState<string>(productCategories[0]?.id ?? "");
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category");

  const onScroll = useCallback(() => {
    const sections = productCategories
      .map((cat) => ({
        id: cat.id,
        top: document.getElementById(cat.id)?.getBoundingClientRect().top ?? Infinity,
      }))
      .filter((s) => s.top <= NAV_OFFSET);

    if (sections.length > 0) {
      setActiveId(sections[sections.length - 1].id);
    } else {
      setActiveId(productCategories[0]?.id ?? "");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Handle URL category parameter changes (e.g. from homepage cards)
  useEffect(() => {
    if (categoryParam) {
      const matched = productCategories.find((cat) => cat.id === categoryParam);
      if (matched) {
        setActiveId(matched.id);
        
        // Wait slightly for DOM structure & cards to be ready
        const timer = setTimeout(() => {
          const el = document.getElementById(matched.id);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [categoryParam]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="sticky top-18 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar py-3">
          {productCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeId === cat.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat.navLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsCategoryNav() {
  return (
    <Suspense fallback={
      <div className="sticky top-18 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm h-[60px]" />
    }>
      <ProductsCategoryNavContent />
    </Suspense>
  );
}
