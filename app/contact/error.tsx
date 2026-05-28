"use client";

import ErrorCard from "@/components/ErrorCard";

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
      backHref="tel:+919310509909"
      backLabel="Call +91 93105 09909"
    />
  );
}
