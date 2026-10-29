import { beforeAll, describe, expect, it } from "vitest";
import { sessionCookieOptions, encodeSession, decodeSession } from "../src/lib/auth/session";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-only-secret-with-at-least-32-characters";
});

describe("session", () => {
  it("encodes and decodes session", () => {
    const session = { userId: "user-123", issuedAt: Date.now() };
    const token = encodeSession(session);
    const decoded = decodeSession(token);
    expect(decoded?.userId).toBe("user-123");
  });

  it("returns null for invalid token", () => {
    expect(decodeSession("invalid.token.here")).toBeNull();
  });

  it("session cookie options has required properties", () => {
    const opts = sessionCookieOptions();
    expect(opts.path).toBe("/");
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
  });
});