import { describe, expect, it } from "vitest";
import { banglishToBengali, expandSearchTerms } from "../src/lib/search-transliteration";

describe("Bengali and Banglish search expansion", () => {
  it("converts the example Banglish spelling into Bengali", () => {
    expect(banglishToBengali("oprajeyo")).toBe("অপরাজেয়");
  });

  it("recognizes common English transliteration variants too", () => {\n    expect(expandSearchTerms("Aparajeyo")).toContain("অপরাজেয়");\n  });\n\n  it("keeps the original query and adds a Bengali alternative", () => {
    expect(expandSearchTerms("oprajeyo")).toContain("অপরাজেয়");
  });

  it("adds a Latin alternative for Bengali input", () => {
    expect(expandSearchTerms("অপরাজেয়")).toContain("aparajeyo");
  });

  it("does not expand an empty query", () => {
    expect(expandSearchTerms("   ")).toEqual([]);
  });
});
