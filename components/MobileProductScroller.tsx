"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileProductScrollerProps {
  children: React.ReactNode;
  /** Extra Tailwind classes for the desktop grid, e.g. "sm:grid-cols-4" */
  gridCols?: string;
  /** Whether the carousel should automatically scroll on mobile */
  autoPlay?: boolean;
  /** Time in ms between transitions */
  autoPlayInterval?: number;
  /** Initial delay in ms before the first auto-scroll fires */
  initialDelay?: number;
}

/**
 * On mobile (< sm) renders children as a horizontally snap-scrollable carousel.
 * On sm+ renders the normal grid specified via `gridCols`.
 */
export default function MobileProductScroller({
  children,
  gridCols = "sm:grid-cols-2 lg:grid-cols-4",
  autoPlay = false,
  autoPlayInterval = 4000,
  initialDelay = 0,
}: MobileProductScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Paused state lives in a ref (read at interval fire-time), NOT in the effect
  // deps — so hovering/touching the carousel suspends advancing without tearing
  // down and re-arming the `initialDelay` timer on every interaction.
  const pausedRef = useRef(false);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.78;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlay) return;

    let interval: ReturnType<typeof setInterval>;

    const start = () => {
      interval = setInterval(() => {
        if (pausedRef.current) return;
        const el = scrollRef.current;
        if (!el || el.clientWidth === 0) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 25) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scroll("right");
        }
      }, autoPlayInterval);
    };

    const timeout = setTimeout(start, initialDelay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [autoPlay, autoPlayInterval, initialDelay]);

  return (
    <>
      {/* ── MOBILE: horizontal snap carousel ─────────────────────── */}
      <div 
        className={`relative sm:hidden`}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { pausedRef.current = false; }}
      >
        {/* Prev arrow */}
        <button
          aria-label="Scroll left"
          aria-controls="mobile-scroller-track"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        <div
          id="mobile-scroller-track"
          ref={scrollRef}
          role="region"
          aria-label="Product carousel"
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-1 no-scrollbar"
          style={{ scrollPaddingLeft: "0px" }}
        >
          {/* Wrap each direct child in a snap-aligned slide */}
          {Array.isArray(children)
            ? (children as React.ReactNode[]).map((child, i, arr) => (
                <div
                  key={i}
                  className={`snap-start shrink-0 w-[72vw] max-w-[260px]${i === arr.length - 1 ? " mr-[28vw]" : ""}`}
                >
                  {child}
                </div>
              ))
            : <div className="snap-start shrink-0 w-[72vw] max-w-[260px]">{children}</div>}
        </div>

        {/* Next arrow */}
        <button
          aria-label="Scroll right"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── DESKTOP: normal grid ──────────────────────────────────── */}
      <div className={`hidden sm:grid ${gridCols} gap-4`}>{children}</div>
    </>
  );
}

