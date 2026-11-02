import { describe, expect, it } from "vitest";
import { translateToBengali, translateToEnglish, translateToLocale } from "../src/lib/i18n/bengali";

describe("manual bidirectional translation", () => {
  it("translates known English interface phrases to Bengali", () => {
    expect(translateToBengali("Blood Donation")).toBe("রক্তদান");
    expect(translateToBengali("Search")).toBe("খুঁজুন");
  });

  it("translates known Bengali interface phrases back to English", () => {
    expect(translateToEnglish("রক্তদান")).toBe("Blood Donation");
    expect(translateToEnglish("খুঁজুন")).toBe("Search");
  });

  it("leaves unknown words unchanged in either direction", () => {
    expect(translateToBengali("Uncatalogued custom label")).toBe("Uncatalogued custom label");
    expect(translateToEnglish("অজানা শব্দ")).toBe("অজানা শব্দ");
  });

  it("selects the translation direction from the requested locale", () => {
    expect(translateToLocale("রক্তদান", "en")).toBe("Blood Donation");
    expect(translateToLocale("Blood Donation", "bn")).toBe("রক্তদান");
  });
});
