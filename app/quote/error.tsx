"use client";

import ErrorCard from "@/components/ErrorCard";

export default function QuoteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Quote page failed to load"
      message="There was a problem loading your quote. Please try again — your cart items are saved locally and won't be lost."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
