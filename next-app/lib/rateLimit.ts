/**
 * Tiny in-memory fixed-window rate limiter (Phase 5H, zero dependencies).
 *
 * Goal: blunt brute-force / accidental hammering of the auth endpoints without
 * adding Redis or any external infrastructure. It is intentionally simple:
 *
 *  - State lives in a module-level Map, so it is PER SERVER INSTANCE. On a
 *    multi-instance / serverless deployment (e.g. Vercel) limits are enforced
 *    per lambda, not globally. That is acceptable as a first line of defence;
 *    a shared store (Redis) is the documented upgrade path.
 *  - Fixed window: each key gets `limit` hits per `windowMs`, then resets.
 *  - A lazy sweep evicts expired buckets so the Map cannot grow unbounded.
 *
 * Not a security boundary on its own — auth still verifies credentials and
 * sessions server-side.
 */

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the window rolls over
}

const buckets = new Map<string, Bucket>();

// Evict expired buckets occasionally so memory stays bounded under churn.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  /** true if this request is allowed (under the limit). */
  allowed: boolean;
  /** Requests remaining in the current window after this call. */
  remaining: number;
  /** Epoch ms when the window resets. */
  resetAt: number;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /** Max requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/**
 * Record one hit against `key` and report whether it is allowed.
 *
 * `key` should namespace the action and the client, e.g. `login:1.2.3.4`.
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const allowed = existing.count <= options.limit;
  const remaining = Math.max(0, options.limit - existing.count);
  const retryAfterSeconds = allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000);

  return { allowed, remaining, resetAt: existing.resetAt, retryAfterSeconds };
}

/**
 * Best-effort client IP from standard proxy headers. Falls back to a constant
 * bucket so the limiter still functions (globally) when no IP is available.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Test-only: clear all buckets. */
export function __resetRateLimitStore(): void {
  buckets.clear();
  lastSweep = 0;
}
