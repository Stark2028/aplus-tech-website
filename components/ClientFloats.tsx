"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded floating UI for the layout shell.
 *
 * Every component below is purely client-side (animations, scroll listeners,
 * mouse-follow effects) with no SEO value, so we defer them off the initial
 * JS bundle. With `ssr: false` they ship as separate chunks loaded after
 * hydration — keeping LCP and TBT lower on every route.
 */
const CursorSpotlight = dynamic(() => import("./CursorSpotlight"), { ssr: false });
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });
const ComparisonFloatingBar = dynamic(() => import("./ComparisonFloatingBar"), { ssr: false });
const QuoteLimitToast = dynamic(() => import("./QuoteLimitToast"), { ssr: false });
const FinderFloatButton = dynamic(() => import("./FinderFloatButton"), { ssr: false });
const BackToTop = dynamic(() => import("./BackToTop"), { ssr: false });
const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });
const MobileStickyCTA = dynamic(() => import("./MobileStickyCTA"), { ssr: false });

export default function ClientFloats() {
  return (
    <>
      <CursorSpotlight />
      <div className="print:hidden">
        <ChatWidget />
        <ComparisonFloatingBar />
        <QuoteLimitToast />
        <FinderFloatButton />
        <BackToTop />
        <CookieConsent />
        <MobileStickyCTA />
      </div>
    </>
  );
}
