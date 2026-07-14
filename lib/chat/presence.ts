/**
 * Measured presence, both directions (spec §5).
 *
 * Business hours cannot know about lunch, holidays, or a sick day, so presence
 * is *measured*, never scheduled:
 *
 *   team    → online iff a console is open and heart-beating (status/team.onlineUntil)
 *   visitor → online iff their tab heart-beat within the last 90s (visitors/{id}.lastSeenAt)
 *
 * Both heartbeats write every 45s into a 90s window, so exactly one beat can be
 * lost (a flaky network, a throttled background tab) before presence flips. And
 * because the window *lapses* rather than being cleared on unload, a crashed tab
 * correctly decays to "away" instead of showing online forever.
 */

export const PRESENCE_WINDOW_MS = 90_000;
export const HEARTBEAT_INTERVAL_MS = 45_000;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Is a sales console open right now? Reads status/team.onlineUntil. */
export function isTeamOnline(onlineUntil: number | null | undefined, now: number = Date.now()): boolean {
  if (!onlineUntil) return false;
  return onlineUntil > now;
}

/** Is the customer still on the site? Reads visitors/{id}.lastSeenAt. */
export function isVisitorOnline(lastSeenAt: number | null | undefined, now: number = Date.now()): boolean {
  if (!lastSeenAt) return false;
  // A future timestamp means the server clock ran ahead of ours, not that they
  // left — treat it as present rather than flapping the agent's UI to "away".
  return now - lastSeenAt < PRESENCE_WINDOW_MS;
}

/** "Left 6 minutes ago" — shown to the agent when the customer has gone (spec §4). */
export function formatLastSeen(lastSeenAt: number | null | undefined, now: number = Date.now()): string {
  if (!lastSeenAt) return "Not seen yet";

  const elapsed = Math.max(0, now - lastSeenAt);
  if (elapsed < MINUTE_MS) return "Left just now";

  const plural = (n: number, unit: string) => `Left ${n} ${unit}${n === 1 ? "" : "s"} ago`;

  if (elapsed < HOUR_MS) return plural(Math.floor(elapsed / MINUTE_MS), "minute");
  if (elapsed < DAY_MS) return plural(Math.floor(elapsed / HOUR_MS), "hour");
  return plural(Math.floor(elapsed / DAY_MS), "day");
}
