import { describe, expect, it } from "vitest";
import { translateToBengali } from "../src/lib/i18n/bengali";

describe("translateToBengali (runtime translator disabled)", () => {
  it("returns input unchanged - no runtime translation", () => {
    expect(translateToBengali("Blood Donation")).toBe("Blood Donation");
    expect(translateToBengali("Search places, services…")).toBe("Search places, services…");
  });

  it("trims surrounding whitespace", () => {
    expect(translateToBengali("  Home  ")).toBe("Home");
  });
});