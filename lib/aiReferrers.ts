/**
 * Hosts that indicate a visit originated from an AI answer engine.
 *
 * Used to segment Vercel Analytics referrer data. GA4 is consent-gated
 * (components/Analytics.tsx) and undercounts, so it is not the instrument here.
 */
export const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "you.com",
] as const;

/** True when `url`'s host is, or is a subdomain of, a known AI answer engine. */
export function isAiReferrer(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  // Suffix match must be dot-anchored so "notchatgpt.com" cannot match.
  return AI_REFERRER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
