"use client";

import ErrorCard from "@/components/ErrorCard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export default function ContactError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Contact page failed to load"
      message="There was a problem loading the contact page. You can still reach us directly."
      reset={reset}
      backHref={PHONE_TEL}
      backLabel={`Call ${PHONE_DISPLAY}`}
    />
  );
}
