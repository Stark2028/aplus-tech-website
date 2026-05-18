"use client";

import { useEffect, useRef } from "react";

export default function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -600, y: -600 });
  const current = useRef({ x: -600, y: -600 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf: number;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.09;
      current.current.y += (target.current.y - current.current.y) * 0.09;
      if (spotRef.current) {
        spotRef.current.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 hidden lg:block"
      style={{
        width: 600,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(37,99,235,0.07) 0%, rgba(37,99,235,0.025) 45%, transparent 70%)",
        zIndex: 9999,
        willChange: "transform",
      }}
    />
  );
}
