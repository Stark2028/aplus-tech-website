"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function PageViewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const url = pathname + (searchParams.size > 0 ? `?${searchParams}` : "");
    window.gtag("config", gaId, { page_path: url });
  }, [pathname, searchParams, gaId]);

  return null;
}

/**
 * Initialise gtag without an inline <script>, so the CSP can drop
 * 'unsafe-inline' from script-src. Runs from an external bundle (this
 * component), which is allowed by script-src 'self'.
 */
function GtagInit({ gaId }: { gaId: string }) {
  useEffect(() => {
    type GtagWindow = Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    const w = window as GtagWindow;
    w.dataLayer = w.dataLayer || [];
    // Google's gtag pushes the live `arguments` object (not a copy), so the
    // dataLayer receives an array-like with the correct length/keys.
    function gtag(...args: unknown[]) {
      void args;
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    }
    w.gtag = gtag;
    gtag("js", new Date());
    gtag("config", gaId, { send_page_view: true });
  }, [gaId]);

  return null;
}

export default function Analytics({ gaId }: { gaId: string }) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("aplus_cookie_consent") === "accepted") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsented(true);
    }
    const handler = () => setConsented(true);
    window.addEventListener("aplus:consent_accepted", handler);
    return () => window.removeEventListener("aplus:consent_accepted", handler);
  }, []);

  if (!gaId || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <GtagInit gaId={gaId} />
      <Suspense fallback={null}>
        <PageViewTracker gaId={gaId} />
      </Suspense>
    </>
  );
}
