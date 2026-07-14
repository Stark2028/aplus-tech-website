import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "./links";

/**
 * Signed resume links (spec §6.3).
 *
 * An agent replies; the customer has closed the tab. We email the reply with a
 * link back into the SAME thread — but they may open it in a browser that has no
 * anonymous session, and the rules would (correctly) refuse them. So the link
 * carries an HMAC over the conversation id, and /api/chat/resume trades a valid
 * token for a Firebase custom token scoped to that conversation's ownerUid.
 *
 * The MAC is over the conversation id alone, so a token minted for one thread
 * cannot open another. It does not expire: the alternative is emailing a dead
 * link to a customer who read the mail a week later, which is the failure mode
 * this whole feature exists to prevent. The secret (CHAT_RESUME_SECRET) is the
 * only thing standing between a guess and a thread, so it must be long random.
 *
 * Server-only: node:crypto. Never import from a client component.
 */

export function signResumeToken(conversationId: string, secret: string): string {
  return createHmac("sha256", secret).update(conversationId).digest("hex");
}

export function verifyResumeToken(conversationId: string, token: string, secret: string): boolean {
  // Shape-check before decoding: Buffer.from() silently drops invalid hex, which
  // would otherwise let a short/garbage token through to a length-mismatch path.
  if (!/^[a-f0-9]{64}$/.test(token)) return false;

  const expected = Buffer.from(signResumeToken(conversationId, secret), "hex");
  const given = Buffer.from(token, "hex");
  if (expected.length !== given.length) return false;

  // Constant-time — a fast-fail compare would leak the digest a byte at a time.
  return timingSafeEqual(expected, given);
}

export function buildResumeUrl(conversationId: string, secret: string): string {
  const token = signResumeToken(conversationId, secret);
  return `${siteUrl()}/api/chat/resume?c=${encodeURIComponent(conversationId)}&token=${token}`;
}
