"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    const url = pathname + (searchParams.size > 0 ? `?${searchParams}` : "");
    ph.capture("$pageview", { $current_url: window.location.origin + url });
  }, [pathname, searchParams, ph]);

  return null;
}

function PostHogInit() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("aplus_cookie_consent") === "accepted") {
      setConsented(true);
    }
    const handler = () => setConsented(true);
    window.addEventListener("aplus:consent_accepted", handler);
    return () => window.removeEventListener("aplus:consent_accepted", handler);
  }, []);

  useEffect(() => {
    if (!PH_KEY || !consented || posthog.__loaded) return;

    posthog.init(PH_KEY, {
      api_host: PH_HOST,
      capture_pageview: false, // manual via PostHogPageView
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,      // hides typed text (GDPR safe)
        maskTextSelector: "[data-ph-mask]", // opt-in masking for sensitive elements
      },
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, [consented]);

  if (!consented) return null;

  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!PH_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      {children}
    </PHProvider>
  );
}
