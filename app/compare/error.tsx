"use client";

import ErrorCard from "@/components/ErrorCard";

export default function CompareError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Comparison failed to load"
      message="There was a problem loading the comparison page. Please try again."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
