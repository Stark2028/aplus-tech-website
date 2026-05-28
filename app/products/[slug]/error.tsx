"use client";

import ErrorCard from "@/components/ErrorCard";

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load product"
      message="There was a problem loading this product page. Please try again or browse the full catalog."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
