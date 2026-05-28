"use client";

import ErrorCard from "@/components/ErrorCard";

export default function CategoryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load category"
      message="There was a problem loading this category. Please try again or browse all products."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
