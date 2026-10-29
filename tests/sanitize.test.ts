import { describe, expect, it } from "vitest";
import { sanitizeText } from "../src/lib/security/sanitize";

describe("sanitizeText", () => {
  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("collapses internal whitespace", () => {
    expect(sanitizeText("hello   world")).toBe("hello world");
  });

  it("removes control characters", () => {
    expect(sanitizeText("hello\u0000world")).toBe("helloworld");
  });
});