"use client";

import { useLanguage } from "@/components/i18n/language-provider";

export function LanguageSwitcher() {
  const { language, toggleLanguage, isAdminRoute } = useLanguage();
  if (isAdminRoute) return null;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === "bn" ? "Switch website language to English" : "ওয়েবসাইটের ভাষা বাংলায় পরিবর্তন করুন"}
      title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      {language === "bn" ? "English" : "বাংলা"}
    </button>
  );
}
