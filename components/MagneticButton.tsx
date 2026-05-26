"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  strength?: number;
}

/**
 * Magnetic hover effect using native pointer events + a small rAF spring,
 * replacing framer-motion's useMotionValue/useSpring. This keeps framer-motion
 * out of the hero's initial bundle (it was the largest unused chunk on the
 * homepage). The effect is mouse-driven, so it's inert on touch devices anyway.
 */
export default function MagneticButton({ children, strength = 0.28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Current and target offsets; a rAF loop eases current → target,
    // reproducing the springy follow of the original useSpring config.
    let curX = 0;
    let curY = 0;
    let tgtX = 0;
    let tgtY = 0;
    let raf = 0;

    const loop = () => {
      // Lerp factor ~0.18 gives a snappy-but-smooth spring feel.
      curX += (tgtX - curX) * 0.18;
      curY += (tgtY - curY) * 0.18;
      el.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
      if (Math.abs(tgtX - curX) > 0.1 || Math.abs(tgtY - curY) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tgtX = (e.clientX - rect.left - rect.width / 2) * strength;
      tgtY = (e.clientY - rect.top - rect.height / 2) * strength;
      start();
    };

    const onLeave = () => {
      tgtX = 0;
      tgtY = 0;
      start();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
