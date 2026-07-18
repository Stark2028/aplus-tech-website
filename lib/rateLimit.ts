/**
 * Minimal in-memory per-key rate limiter (no external dependencies).
 *
 * Suitable for a single serverless/Node instance. Each key (typically the
 * caller's IP) gets a fixed budget of requests per rolling window. State is
 * held in a module-level Map, so it resets on cold start and is NOT shared
 * across instances — adequate for abuse/spam throttling on a contact form,
 * but not a substitute for a durable store (Redis) at high scale.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the Map can't grow unbounded across many IPs.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (only meaningful when ok === false). */
  retryAfter: number;
}

/**
 * Record a hit for `key` and report whether it's within budget.
 * @param limit  max requests allowed per window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP from standard proxy headers.
 * Falls back to a constant so the limiter still functions if no IP is found
 * (all anonymous callers then share one bucket — fail-safe, not fail-open).
 */
export function clientIp(req: Request): string {
  // Cloudflare's cf-connecting-ip is unforgeable ONLY when a Cloudflare proxy
  // terminates the request and rewrites it. This app deploys on Vercel, which
  // does NOT set that header — so an inbound cf-connecting-ip is an arbitrary,
  // client-supplied value. Trusting it let an attacker randomize the header to
  // mint a fresh bucket per request and defeat the limiter entirely. Only honor
  // it when a Cloudflare proxy is explicitly declared to sit in front.
  if (process.env.TRUST_CF_CONNECTING_IP === "1") {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf.trim();
  }

  // On Vercel, x-forwarded-for carries the real client IP appended as its LAST
  // (rightmost) entry: the platform adds it after any client-supplied values,
  // so the rightmost is the one our nearest trusted proxy set and cannot be
  // forged. The client-appendable leftmost entries are deliberately ignored (a
  // forged leftmost IP would otherwise mint a fresh bucket per request). Do not
  // "fix" this to parts[0].
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  // Fallback for non-Vercel / local contexts that only set x-real-ip. Reached
  // only when x-forwarded-for is absent (it is always present on Vercel).
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
