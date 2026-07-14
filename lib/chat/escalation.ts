/**
 * The no-reply safety net's trigger condition (spec §6).
 *
 * Evaluated by the *waiting customer's own browser*, which is what lets the
 * escalation fire even when no console is open anywhere — no cron job, no paid
 * plan. The browser only decides *when*; POST /api/chat/escalate re-verifies
 * ownership server-side and does the privileged work.
 */

export const UNANSWERED_TIMEOUT_MS = 3 * 60_000;

interface EscalationState {
  lastCustomerMessageAt: number | null;
  lastAgentMessageAt: number | null;
  /** Already flagged — escalating again would re-spam the inbox. */
  needsFollowUp: boolean;
  now: number;
}

export function shouldEscalate({
  lastCustomerMessageAt,
  lastAgentMessageAt,
  needsFollowUp,
  now,
}: EscalationState): boolean {
  if (needsFollowUp) return false;
  if (!lastCustomerMessageAt) return false;
  // An agent reply *after* the customer's last message means they are answered.
  if (lastAgentMessageAt !== null && lastAgentMessageAt > lastCustomerMessageAt) return false;
  return now - lastCustomerMessageAt >= UNANSWERED_TIMEOUT_MS;
}
