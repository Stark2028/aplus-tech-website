"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Adds `.edu-anim` on mount and `.edu-inview` once scrolled into view, so
 *  scoped CSS can stagger child transitions (seat dots, timeline draw-line).
 *  Without JS neither class lands and the finished state shows — the same
 *  no-JS behavior as AnimatedSection. Fires once. */
export default function InView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("edu-anim");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("edu-inview");
          observer.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
