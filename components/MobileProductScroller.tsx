"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDeferredScroll } from "@/hooks/useDeferredScroll";

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
  /**
   * Breakpoint at which the carousel gives way to the grid. Defaults to `"sm"`
   * (carousel < 640px). Pass `"md"` to keep the carousel up to 768px — used by
   * CategoryGrid, whose bento grid only kicks in at `md`. When set, the caller
   * is responsible for supplying matching `gridCols` (e.g. `md:grid-cols-*`).
   */
  breakpoint?: "sm" | "md";
}

/**
 * On mobile (below `breakpoint`) renders children as a horizontally
 * snap-scrollable carousel. At `breakpoint`+ renders the normal grid
 * specified via `gridCols`.
 */
export default function MobileProductScroller({
  children,
  gridCols = "sm:grid-cols-2 lg:grid-cols-4",
  autoPlay = false,
  autoPlayInterval = 4000,
  initialDelay = 0,
  breakpoint = "sm",
}: MobileProductScrollerProps) {
  // Static class strings so Tailwind's JIT scanner sees complete literals
  // (it can't resolve `${breakpoint}:hidden` interpolations).
  const mobileHidden = breakpoint === "md" ? "md:hidden" : "sm:hidden";
  const gridShow = breakpoint === "md" ? "hidden md:grid" : "hidden sm:grid";
  const scrollRef = useRef<HTMLDivElement>(null);
  // Paused state lives in a ref (read at interval fire-time), NOT in the effect
  // deps — so hovering/touching the carousel suspends advancing without tearing
  // down and re-arming the `initialDelay` timer on every interaction.
  const pausedRef = useRef(false);
  // Defer making the rail a scroll container until after load / first input, so
  // a font-reflow scroll on this rail can't finalize LCP empty on mobile. See
  // hooks/useDeferredScroll for the full NO_LCP story.
  const scrollReady = useDeferredScroll();

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.78;
    // The last slide carries a trailing `mr-[28vw]` margin, so `scrollWidth`
    // overshoots the position the track actually snaps to at the end. Use the
    // last slide's own offset (where it snaps left-aligned) as the true end
    // instead — otherwise the wrap condition can never be reached.
    const lastSlide = el.lastElementChild as HTMLElement | null;
    const endScroll = lastSlide ? lastSlide.offsetLeft - el.offsetLeft : el.scrollWidth - el.clientWidth;
    // Loop the carousel: → at the last slide jumps back to the first, and ←
    // at the first slide jumps to the last. The 25px tolerance absorbs
    // sub-pixel rounding and snap settling so "near the edge" still wraps.
    if (dir === "right") {
      if (el.scrollLeft >= endScroll - 25) {
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
    } else if (el.scrollLeft <= 25) {
      el.scrollTo({ left: endScroll, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlay) return;

    // Honour the OS "reduce motion" setting — read live at each tick (like
    // pausedRef) so it reacts to changes the same way the CSS marquees do,
    // which stay frozen for these users via the global reduced-motion guard.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let interval: ReturnType<typeof setInterval>;

    const start = () => {
      interval = setInterval(() => {
        if (pausedRef.current || reduceMotion.matches) return;
        const el = scrollRef.current;
        if (!el || el.clientWidth === 0) return;
        // scroll() handles the end→start wrap itself, so auto-play just advances.
        scroll("right");
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
        className={`relative ${mobileHidden}`}
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

        {/* No-JS fallback: useDeferredScroll never fires without JS, so force the
            rail scrollable there (the arrows/auto-play need JS anyway). */}
        <noscript>
          <style>{`.mps-rail{overflow-x:auto !important}`}</style>
        </noscript>
        <div
          id="mobile-scroller-track"
          ref={scrollRef}
          role="region"
          aria-label="Product carousel"
          className={`mps-rail flex gap-5 ${scrollReady ? "overflow-x-auto" : "overflow-x-clip"} snap-x snap-mandatory scroll-smooth pb-4 px-1 no-scrollbar`}
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
          aria-controls="mobile-scroller-track"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      {/* ── DESKTOP: normal grid ──────────────────────────────────── */}
      <div className={`${gridShow} ${gridCols} gap-4`}>{children}</div>
    </>
  );
}

