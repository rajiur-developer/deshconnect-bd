import "server-only";
import { createHash } from "node:crypto";

/**
 * Local fixed-window limiter is retained as a development / outage fallback.
 * Production instances should use Upstash so limits are shared across regions
 * and serverless invocations.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  sweep(now);
  const existing = buckets.get(key);
  const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + windowMs;
  const count = existing && existing.resetAt > now ? existing.count + 1 : 1;
  buckets.set(key, { count, resetAt });
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    limit,
    retryAfterSeconds: Math.max(0, Math.ceil((resetAt - now) / 1000)),
  };
}

const INCREMENT_SCRIPT = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
  "return count",
].join("\n");

/** Shared atomic fixed-window limiter backed by Upstash Redis REST. */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return rateLimit(key, limit, windowMs, now);
  if (!Number.isFinite(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
    throw new Error("Rate limit and window must be positive numbers.");
  }

  const windowId = Math.floor(now / windowMs);
  const retryAfterSeconds = Math.max(0, Math.ceil(((windowId + 1) * windowMs - now) / 1000));
  const hashedKey = createHash("sha256").update(key).digest("hex");
  const redisKey = `deshconnect:rate:${hashedKey}:${windowId}`;
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000) + 1);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", INCREMENT_SCRIPT, 1, redisKey, ttlSeconds]),
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}.`);
    const payload = await response.json() as { result?: unknown; error?: string };
    if (payload.error) throw new Error(payload.error);
    const count = Number(payload.result);
    if (!Number.isSafeInteger(count) || count < 1) throw new Error("Upstash returned an invalid rate-limit count.");
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      limit,
      retryAfterSeconds,
    };
  } catch {
    // Keep abuse protection available if Redis has a transient outage.
    return rateLimit(key, limit, windowMs, now);
  }
}

export function clearRateLimits() {
  buckets.clear();
}
