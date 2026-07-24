/**
 * Presentational time helpers for the console. Pure and deterministic (callers
 * pass `now` in tests). `formatLastSeen` in presence.ts stays the source of the
 * "Left N ago" presence string — these cover list rows and message bubbles.
 */

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Compact age for a conversation row: "now" | "5m" | "3h" | "2d" | "24 Jul". */
export function formatRelative(ts: number, now: number = Date.now()): string {
  if (!ts) return "";
  const diff = Math.max(0, now - ts);
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return new Date(ts).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/** Clock time under a message bubble: "9:15 pm". */
export function formatClock(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Same calendar day in local time. */
export function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Divider label between messages: "Today" | "Yesterday" | "12 July 2026". */
export function dayLabel(ts: number, now: number = Date.now()): string {
  if (sameDay(ts, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(ts, yesterday.getTime())) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
