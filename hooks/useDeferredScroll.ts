"use client";

import { useEffect, useState } from "react";

/**
 * Returns `false` until the page finishes loading (or the user first interacts),
 * then `true`. Consumers gate `overflow-x: auto` on horizontal carousels behind
 * it — rendering the rail as `overflow-x: clip` (a non-scroll-container) until
 * then.
 *
 * Why this exists — a mobile-only `NO_LCP` bug:
 * A horizontally scrollable rail (`overflow-x: auto`) IS a scroll container.
 * While web fonts load, the flex track reflows and the browser nudges the
 * rail's scroll position by a few pixels. Chromium's paint-timing detector
 * treats ANY scroll (even this off-screen, sub-pixel, browser-initiated one) as
 * a user interaction and stops recording Largest Contentful Paint candidates.
 * On mobile the hero paints after that reflow scroll, so LCP was being
 * finalized empty → Lighthouse reported `NO_LCP` and no mobile Performance
 * score (desktop renders a static grid, no rail, so it was unaffected).
 *
 * Keeping the rail a non-scroll-container until `load` means it cannot fire the
 * spurious reflow scroll; by `load` the LCP element has painted and been
 * recorded. First interaction also enables it — that finalizes LCP itself, so
 * scrolling then is free, and it keeps an early swipe responsive.
 */
export function useDeferredScroll(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const enable = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    // Enable two frames after load, so the reflow has fully settled and the LCP
    // paint is recorded before the rail becomes a scroll container.
    const afterLoad = () =>
      requestAnimationFrame(() => requestAnimationFrame(enable));

    if (document.readyState === "complete") {
      afterLoad();
    } else {
      window.addEventListener("load", afterLoad, { once: true });
    }

    // A pre-load interaction finalizes LCP on its own, so enabling the rail then
    // costs nothing and lets an eager swipe scroll immediately.
    const opts = { once: true, passive: true };
    window.addEventListener("pointerdown", enable, opts);
    window.addEventListener("touchstart", enable, opts);
    window.addEventListener("keydown", enable, opts);

    return () => {
      window.removeEventListener("load", afterLoad);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  return ready;
}
