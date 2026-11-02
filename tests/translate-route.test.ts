import { describe, expect, it } from "vitest";
import { translateToBengali, translateToEnglish, translateToLocale } from "../src/lib/i18n/bengali";

describe("manual bidirectional translation", () => {
  it("translates common interface phrases to Bengali", () => {
    expect(translateToBengali("Blood Donation")).toBe("রক্তদান");
    expect(translateToBengali("Search")).toBe("খুঁজুন");
    expect(translateToBengali("Admin workspace")).toBe("প্রশাসনিক কর্মক্ষেত্র");
    expect(translateToBengali("Search admin pages...")).toBe("প্রশাসনিক পৃষ্ঠা খুঁজুন...");
    expect(translateToBengali("Reset all")).toBe("সব নতুন করে সাজান");
    expect(translateToBengali("Welcome back")).toBe("আবারও স্বাগতম");
    expect(translateToBengali("No notifications yet")).toBe("এখনো কোনো বিজ্ঞপ্তি নেই");
  });

  it("translates known Bengali interface phrases back to English", () => {
    expect(translateToEnglish("রক্তদান")).toBe("Blood Donation");
    expect(translateToEnglish("খুঁজুন")).toBe("Search");
    expect(translateToEnglish("প্রশাসনিক কর্মক্ষেত্র")).toBe("Admin workspace");
    expect(translateToEnglish("সব নতুন করে সাজান")).toBe("Reset all");
    expect(translateToEnglish("আবারও স্বাগতম")).toBe("Welcome back");
    expect(translateToEnglish("এখনো কোনো বিজ্ঞপ্তি নেই")).toBe("No notifications yet");
  });

  it("leaves unknown words unchanged rather than guessing", () => {
    expect(translateToBengali("Uncatalogued custom label")).toBe("Uncatalogued custom label");
    expect(translateToEnglish("অজানা শব্দ")).toBe("অজানা শব্দ");
  });

  it("selects the translation direction from the requested locale", () => {
    expect(translateToLocale("রক্তদান", "en")).toBe("Blood Donation");
    expect(translateToLocale("Blood Donation", "bn")).toBe("রক্তদান");
  });
});
