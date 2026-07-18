/**
 * URL scheme guard for anything a message renders into an `href`/`src`.
 *
 * Message payloads are NOT trustworthy. A visitor holds an anonymous auth token
 * and their own conversation id, so they can write to their thread with the
 * Firebase SDK directly, bypassing our UI entirely. That message is then read
 * back by the SALES CONSOLE, where the salesperson is authenticated with
 * `agent: true` and can see every conversation — so a `javascript:` URI in a
 * link card is an account-takeover vector aimed at the agent, not a self-XSS.
 *
 * `target="_blank" rel="noopener noreferrer"` does not help: `javascript:` runs
 * on click regardless of target. The scheme itself is the control.
 *
 * firestore.rules also refuses `link` on customer-written messages; this is the
 * second layer, because the renderer is shared and must not assume its input
 * came from a writer we trust.
 */

/** Only these schemes may reach an href/src. Everything else is refused. */
const SAFE_SCHEMES = new Set(["http:", "https:"]);

export function isSafeHttpUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url.trim()) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Relative or malformed. Every URL we legitimately store is absolute
    // (link builders emit siteUrl()-prefixed links; Storage returns absolute
    // download URLs), so a non-absolute URL here is already anomalous.
    return false;
  }
  return SAFE_SCHEMES.has(parsed.protocol);
}

/** The URL if it is safe to render, otherwise undefined. */
export function safeHttpUrl(url: unknown): string | undefined {
  return isSafeHttpUrl(url) ? url : undefined;
}
