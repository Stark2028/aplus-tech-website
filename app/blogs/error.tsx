"use client";

import ErrorCard from "@/components/ErrorCard";

export default function BlogsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load blog"
      message="There was a problem loading the blog. Please try again."
      reset={reset}
      backHref="/"
      backLabel="Go home"
    />
  );
}
