/**
 * Format a blog post's date-only ISO string (e.g. "2026-05-20") for display.
 *
 * Pins formatting to UTC. The stored dates are date-only, which `new Date()`
 * parses as UTC midnight; without a fixed timeZone, the server (UTC on Vercel)
 * and a client west of UTC would format different calendar days, causing a
 * React hydration mismatch on server-rendered pages. Pinning to UTC makes the
 * output deterministic everywhere.
 */
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
