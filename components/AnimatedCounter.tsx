"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;

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

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, num]);

  const formatted = count >= 1000 ? count.toLocaleString("en-IN") : String(count);

  return <span ref={ref}>{formatted}{suffix}</span>;
}
