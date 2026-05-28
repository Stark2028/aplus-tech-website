"use client";

import ErrorCard from "@/components/ErrorCard";

export default function ProductFinderError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Product finder failed to load"
      message="There was a problem loading the product finder. You can browse the full catalog instead."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
