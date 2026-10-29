import { describe, expect, it } from "vitest";
import { rateLimit } from "../../src/lib/security/rate-limit";

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
});