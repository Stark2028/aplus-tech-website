"use client";

import ErrorCard from "@/components/ErrorCard";

export default function BlogPostError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorCard
      title="Could not load article"
      message="There was a problem loading this article. Please try again or return to the blog."
      reset={reset}
      backHref="/blogs"
      backLabel="Back to blog"
    />
  );
}
