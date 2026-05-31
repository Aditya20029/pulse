interface Bucket {
  count: number;
  reset: number;
}

// In-memory sliding window. Per serverless instance, which is fine as a
// cheap guard against a single client hammering the AI routes. For
// cross-instance limits you'd swap in Upstash/Redis, but this stops the
// obvious abuse on a public showcase URL.
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: entry.reset - now };
  }

  entry.count += 1;
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.reset < now) buckets.delete(k);
    }
  }
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetMs: entry.reset - now,
  };
}

export function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}
