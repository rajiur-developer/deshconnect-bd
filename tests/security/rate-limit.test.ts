import { describe, expect, it } from "vitest";
import { clearRateLimits, rateLimit, rateLimitAsync } from "../../src/lib/security/rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-key-${Date.now()}`;
    expect(rateLimit(key, 3, 60000).ok).toBe(true);
    expect(rateLimit(key, 3, 60000).ok).toBe(true);
    expect(rateLimit(key, 3, 60000).ok).toBe(true);
  });

  it("blocks requests exceeding the limit", () => {
    const key = `test-key-2-${Date.now()}`;
    expect(rateLimit(key, 2, 60000).ok).toBe(true);
    expect(rateLimit(key, 2, 60000).ok).toBe(true);
    expect(rateLimit(key, 2, 60000).ok).toBe(false);
  });

  it("uses the local limiter when Upstash is not configured", async () => {
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    clearRateLimits();
    try {
      const key = `async-fallback-${Date.now()}`;
      expect((await rateLimitAsync(key, 1, 60_000)).ok).toBe(true);
      expect((await rateLimitAsync(key, 1, 60_000)).ok).toBe(false);
    } finally {
      if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
      else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
      if (originalToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
      else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
      clearRateLimits();
    }
  });
});