import type { ChatMessage } from "./types";
import { sameDay, dayLabel } from "./time";

export type ThreadItem =
  | { type: "divider"; id: string; label: string }
  | { type: "message"; id: string; message: ChatMessage };

/**
 * Flatten an ordered message list into render items with a day divider before
 * the first message of each calendar day. An optimistic message whose
 * serverTimestamp has not resolved (createdAt === 0) is grouped with `now` so it
 * never spawns a stray "1 January 1970" divider.
 */
export function groupByDay(messages: ChatMessage[], now: number = Date.now()): ThreadItem[] {
  const items: ThreadItem[] = [];
  let prev: number | null = null;
  for (const m of messages) {
    const ts = m.createdAt || now;
    if (prev === null || !sameDay(prev, ts)) {
      items.push({ type: "divider", id: `d-${m.id}`, label: dayLabel(ts, now) });
    }
    items.push({ type: "message", id: m.id, message: m });
    prev = ts;
  }
  return items;
}
