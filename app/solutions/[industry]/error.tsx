"use client";

import ErrorCard from "@/components/ErrorCard";

export default function SolutionIndustryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load solution"
      message="There was a problem loading this solution page. Please try again or browse all products."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
