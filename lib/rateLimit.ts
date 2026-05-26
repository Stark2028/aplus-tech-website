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
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
