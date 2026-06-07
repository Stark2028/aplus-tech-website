"use client";

import { useRef, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  /** Extra classes for the wrapper (layout, sizing, etc.). */
  className?: string;
  /** Radius of the glow in px. */
  radius?: number;
  /** Glow colour (rgba recommended so opacity is baked in). */
  color?: string;
}

/**
 * Wraps a card and paints a cursor-tracking radial glow over it — the
 * Vercel/Linear "spotlight" effect. Pure CSS: a pointer handler writes the
 * cursor position into `--spot-x` / `--spot-y` custom properties and the glow
 * layer (defined in globals.css `.spotlight-card`) reads them. No animation
 * loop, no library.
 *
 * The glow layer is desktop-only (`lg:`) and `pointer-events-none`, so on
 * touch devices this renders as a plain `div` with zero overhead. The
 * `prefers-reduced-motion` guard in globals.css hides the glow entirely.
 */
export default function SpotlightCard({
  children,
  className = "",
  radius = 320,
  color = "rgba(37, 99, 235, 0.07)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`spotlight-card ${className}`}
      style={
        {
          "--spot-radius": `${radius}px`,
          "--spot-color": color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
