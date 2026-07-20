"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDeferredScroll } from "@/hooks/useDeferredScroll";

interface AutoSliderProps {
  children: React.ReactNode[];
  /** Width of each slide as a Tailwind class, e.g. "w-[80vw]" or "w-72" */
  slideWidth?: string;
  /** Max width cap for each slide */
  slideMaxWidth?: string;
  /** ms between auto-advances */
  interval?: number;
}

export default function AutoSlider({
  children,
  slideWidth = "w-[80vw]",
  slideMaxWidth = "max-w-xs",
  interval = 3500,
}: AutoSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  // Keep the rail a non-scroll-container until after load, so a font-reflow
  // scroll can't finalize LCP empty. See hooks/useDeferredScroll.
  const scrollReady = useDeferredScroll();

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const slideEl = el.firstElementChild as HTMLElement | null;
    const amount = slideEl ? slideEl.offsetWidth + 20 : el.clientWidth * 0.82;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (paused) return;
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0 });
      } else {
        scroll("right");
      }
    }, interval);
    return () => clearInterval(id);
  }, [paused, interval]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <button
        aria-label="Previous"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* No-JS fallback: useDeferredScroll never fires without JS. */}
      <noscript>
        <style>{`.as-rail{overflow-x:auto !important}`}</style>
      </noscript>
      <div
        ref={scrollRef}
        className={`as-rail flex gap-5 ${scrollReady ? "overflow-x-auto" : "overflow-x-clip"} snap-x snap-mandatory scroll-smooth no-scrollbar pb-1`}
      >
        {children.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${slideWidth} ${slideMaxWidth}`}>
            {child}
          </div>
        ))}
      </div>

      <button
        aria-label="Next"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
