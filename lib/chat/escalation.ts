/**
 * The no-reply safety net's trigger condition (spec §6).
 *
 * Evaluated by the *waiting customer's own browser*, which is what lets the
 * escalation fire even when no console is open anywhere — no cron job, no paid
 * plan. The browser only decides *when*; POST /api/chat/escalate re-verifies
 * ownership server-side and does the privileged work.
 */

export const UNANSWERED_TIMEOUT_MS = 3 * 60_000;

/**
 * How many failed POST /api/chat/escalate attempts the waiting browser makes
 * before giving up. The apology notice is already in the thread and the lead
 * was captured at chat start, so abandoning the email after a few tries loses a
 * convenience, not the lead. Without this cap the 20s timer retries forever
 * whenever escalation can't succeed (e.g. RESEND_API_KEY unset locally, or a
 * Resend outage), hammering the endpoint into its per-IP rate limit and turning
 * the console into an endless stream of 429s.
 */
export const MAX_ESCALATE_ATTEMPTS = 5;

/**
 * Decide whether the browser should stop retrying escalation, given how many
 * attempts have already failed and the latest response status. A 429 is
 * terminal on its own: the server is rate-limiting us, so retrying every 20s
 * only prolongs the storm — back off instead.
 */
export function shouldStopEscalating(
  failedAttempts: number,
  lastStatus: number | null
): boolean {
  if (lastStatus === 429) return true;
  return failedAttempts >= MAX_ESCALATE_ATTEMPTS;
}

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
