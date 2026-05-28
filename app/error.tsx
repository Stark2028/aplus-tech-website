"use client";

import ErrorCard from "@/components/ErrorCard";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorCard
          title="Something went wrong"
          message="An unexpected error occurred. Please try refreshing the page."
          reset={reset}
          backHref="/"
          backLabel="Go home"
        />
      </body>
    </html>
  );
}
