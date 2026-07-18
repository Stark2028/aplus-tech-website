import { isVisitorOnline } from "./presence";

/**
 * Should an agent reply be emailed to the customer? (spec §6.3)
 *
 * Only when they cannot see it: if their tab is still heart-beating, the reply
 * is already on their screen and an email would be noise.
 *
 * The debounce matters more than it looks. A salesperson types the way people
 * type — "Hi Rahul", "just checking", "the QB65 is ₹X" — and without it that is
 * three emails in ninety seconds. One per two minutes per conversation.
 */

export const REPLY_EMAIL_DEBOUNCE_MS = 2 * 60_000;

interface ReplyEmailState {
  customerEmail: string;
  customerLastSeenAt: number | null;
  /** `emailedAt` of the most recent emailed message in this conversation. */
  lastEmailedAt: number | null;
  now: number;
}

export function shouldEmailReply({
  customerEmail,
  customerLastSeenAt,
  lastEmailedAt,
  now,
}: ReplyEmailState): boolean {
  if (!customerEmail.trim()) return false;
  if (isVisitorOnline(customerLastSeenAt, now)) return false;
  if (lastEmailedAt !== null && now - lastEmailedAt < REPLY_EMAIL_DEBOUNCE_MS) return false;
  return true;
}
