/**
 * Pure helper for RecentlyViewed's localStorage parsing, extracted so the
 * corrupt-data handling is unit-testable.
 *
 * Returns the recently-viewed id list with `currentId` prepended, de-duplicated,
 * and capped at `max`. Guards against corrupt/non-array stored values: a value
 * that parses to anything other than an array of strings is treated as empty,
 * so a tampered/legacy localStorage entry can't throw and crash the page.
 */
export function readRecentIds(
  raw: string | null,
  currentId: string,
  max: number
): string[] {
  let stored: string[] = [];
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      stored = parsed.filter((id): id is string => typeof id === "string");
    }
  } catch {}
  return [currentId, ...stored.filter((id) => id !== currentId)].slice(0, max);
}
