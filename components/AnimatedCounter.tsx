"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
}

function parseValue(raw: string): { num: number; suffix: string } {
  const num = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = raw.replace(/[0-9,]/g, "");
  return { num, suffix };
}

export default function AnimatedCounter({ value }: Props) {
  const { num, suffix } = parseValue(value);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Native IntersectionObserver — equivalent to framer-motion's useInView
  // ({ once: true, margin: "-80px" }) but without pulling framer-motion into
  // the hero's initial bundle. Fires a single time when the element scrolls in.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    // Delay the start slightly to let the LCP element and hydration finish painting
    const delayTimer = setTimeout(() => {
      const duration = 1800;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * num));
        if (progress < 1) requestAnimationFrame(tick);
      };

      // Inner RAF is intentionally not captured for cleanup: the loop self-
      // terminates when progress reaches 1, and the outer setTimeout is the
      // unmount guard. A mid-flight frame after unmount is harmless here.
      requestAnimationFrame(tick);
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [isInView, num]);

  const formatted = count >= 1000 ? count.toLocaleString("en-IN") : String(count);

  return <span ref={ref}>{formatted}{suffix}</span>;
}
