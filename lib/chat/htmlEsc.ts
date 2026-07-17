/**
 * Shared HTML-escaping utilities for email templates (spec §9).
 *
 * These were previously duplicated byte-for-byte across:
 *   app/api/chat/escalate/route.ts
 *   app/api/chat/reply-email/route.ts
 *   app/api/contact/route.ts
 *
 * A security-relevant escaper must have ONE canonical copy so tightening
 * the logic in one place covers all callers.
 */

/**
 * Escape user-supplied text before interpolating into an HTML email body.
 * NOT appropriate for plain-text headers — use `headerSafe` there.
 */
export function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Produce a single-line, length-capped string safe to place in an email
 * header (Subject, etc.). Strips CR/LF to prevent header injection;
 * does NOT HTML-escape — headers are plain text, not HTML.
 */
export function headerSafe(value: string, max = 200): string {
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, max);
}
