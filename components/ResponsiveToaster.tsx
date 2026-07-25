"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Responsive wrapper around sonner's `<Toaster>`.
 *
 * On mobile (< md / 768px) toasts render at **top-center** so they never
 * collide with the MobileStickyCTA, ComparisonFloatingBar, BackToTop, or the
 * iOS home-indicator safe area — all of which crowd the bottom of the
 * viewport. On desktop (≥ 768px) they stay at the conventional bottom-right.
 *
 * We listen to a `matchMedia` change event so the position updates live if the
 * browser is resized across the breakpoint (e.g. DevTools toggling).
 */
export default function ResponsiveToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Toaster
      richColors
      position={isMobile ? "top-center" : "bottom-right"}
    />
  );
}
