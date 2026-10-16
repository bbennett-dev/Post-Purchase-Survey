/**
 * In-process fixed-window rate limiter (per Node instance).
 * For multi-instance production, use edge/WAF or Redis-backed limits.
 */

type Bucket = {
  count: number;
  windowStartMs: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitConfig = {
  /** Max requests allowed per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * @param key Stable identifier (shop domain, client IP, etc.).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const normalizedKey = key.trim().toLowerCase();
  if (!normalizedKey) {
    return { allowed: true };
  }

  let bucket = buckets.get(normalizedKey);
  if (!bucket || now - bucket.windowStartMs >= config.windowMs) {
    bucket = { count: 0, windowStartMs: now };
    buckets.set(normalizedKey, bucket);
  }

  bucket.count += 1;
  if (bucket.count > config.max) {
    const elapsed = now - bucket.windowStartMs;
    const retryAfterMs = Math.max(config.windowMs - elapsed, 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  return { allowed: true };
}

/** Best-effort client IP for abuse limiting on unauthenticated routes. */
export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}
