type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type RateLimitResult = {
  success: boolean;
  retryAfterSec?: number;
};

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/** Simple in-memory sliding window limiter (per server instance). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneBuckets(now);
    return { success: true };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { success: true };
}

/** Check limit without consuming a slot (for pre-auth checks). */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    return { success: true };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { success: true };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

function pruneBuckets(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export const RATE_LIMITS = {
  /** Failed attempts per email — successful logins are not counted. */
  loginFailed: { limit: 8, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
} as const;

export function isHoneypotFilled(value: FormDataEntryValue | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
