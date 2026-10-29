import { describe, expect, it } from "vitest";
import { formatZodError, placeSchema } from "../src/lib/validation/schemas";

const validPlace = {
  name: "Sajek Valley",
  category: "hill",
  summary: "A scenic place",
  description: "A place to visit.",
  address: "Rangamati",
};

describe("formatZodError", () => {
  it("returns formatted error messages", () => {
    const result = formatZodError({ issues: [{ message: "Required" }] });
    expect(result).toContain("Required");
  });

  describe("placeSchema summary", () => {
    it("accepts summaries up to 200 words", () => {
      const summary = Array.from({ length: 200 }, (_, index) => `word${index}`).join(" ");
      expect(placeSchema.safeParse({ ...validPlace, summary }).success).toBe(true);
    });

    it("rejects summaries longer than 200 words", () => {
      const summary = Array.from({ length: 201 }, (_, index) => `word${index}`).join(" ");
      expect(placeSchema.safeParse({ ...validPlace, summary }).success).toBe(false);
    });
  });

  it("returns empty string for empty errors", () => {
    const result = formatZodError({ issues: [] });
    expect(result).toBe("");
  });
});