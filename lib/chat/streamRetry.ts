/**
 * Re-attach policy for the customer widget's Firestore snapshot listeners.
 *
 * `onSnapshot`'s error callback is TERMINAL: once it fires, the SDK has detached
 * that listener and will never deliver another snapshot for it. The SDK retries
 * *recoverable* network trouble internally without telling us, so an error that
 * reaches our callback has already killed the stream for good.
 *
 * Treating a listener as permanent is therefore wrong by construction. Before
 * this policy existed, one such failure left the customer's thread frozen and
 * EMPTY for the rest of the page's life — their own messages and the agent's
 * replies kept landing in Firestore (the sales console saw everything) while the
 * widget showed nothing, and only a full page reload brought the thread back.
 * Re-attaching is exactly what that reload did, minus the reload.
 *
 * The cap matters as much as the retry: a genuinely broken stream (revoked
 * rules, a missing index) would otherwise re-subscribe forever, so we stop and
 * let the widget surface a real error with a route to WhatsApp/phone.
 */

/** Re-attach attempts before we stop and show the customer an error. */
export const MAX_STREAM_RETRIES = 5;

/** Delay before the first re-attach; doubles per failure from there. */
export const STREAM_RETRY_BASE_MS = 1_000;

/** Ceiling on the backoff — the last retry must still be worth waiting for. */
export const STREAM_RETRY_MAX_MS = 15_000;

/** Should we re-attach, given how many consecutive attach failures we've had? */
export function shouldRetryStream(failedAttempts: number): boolean {
  return failedAttempts < MAX_STREAM_RETRIES;
}

/**
 * Backoff before retry number `failedAttempts` (1-based): 1s, 2s, 4s, 8s… capped.
 * The first retry is deliberately quick — the customer is watching an empty
 * thread and most failures here clear immediately.
 */
export function streamRetryDelayMs(failedAttempts: number): number {
  const delay = STREAM_RETRY_BASE_MS * 2 ** (failedAttempts - 1);
  return Math.min(delay, STREAM_RETRY_MAX_MS);
}
