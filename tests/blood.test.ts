import { describe, expect, it } from "vitest";
import { bloodGroupTone } from "../src/lib/utils";

describe("bloodGroupTone", () => {
  it("returns correct tone for each blood group", () => {
    expect(bloodGroupTone("O+")).toContain("text-white");
    expect(bloodGroupTone("A+")).toContain("text-white");
    expect(bloodGroupTone("B+")).toContain("text-white");
    expect(bloodGroupTone("AB+")).toContain("text-white");
    expect(bloodGroupTone("O-")).toContain("text-white");
    expect(bloodGroupTone("A-")).toContain("text-white");
    expect(bloodGroupTone("B-")).toContain("text-white");
    expect(bloodGroupTone("AB-")).toContain("text-white");
  });

  it("returns default tone for unknown group", () => {
    expect(bloodGroupTone("INVALID")).toContain("text-slate-800");
  });
});