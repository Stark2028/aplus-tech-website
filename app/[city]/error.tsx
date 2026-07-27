"use client";

import ErrorCard from "@/components/ErrorCard";

export default function CityError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load this location"
      message="There was a problem loading this page. Please try again or browse the product catalog."
      reset={reset}
      backHref="/products"
      backLabel="Browse products"
    />
  );
}
