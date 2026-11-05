"use client";

import { useLanguage } from "@/components/i18n/language-provider";

export function LanguagePreference() {
  const { language, setLanguage } = useLanguage();

  const buttonClass = (selected: boolean) =>
    [
      "min-h-11 flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
      selected
        ? "bg-emerald-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800",
    ].join(" ");

  return (
    <section
      aria-labelledby="language-preference-title"
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="language-preference-title"
          className="font-semibold text-slate-900"
        >
          Language / ভাষা
        </h2>
        <p className="text-sm text-slate-600">
          Choose the language used across DeshConnect.
        </p>
      </div>

      <div
        className="mt-4 flex w-full max-w-sm gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5"
        role="group"
        aria-label="Website language"
      >
        <button
          type="button"
          aria-pressed={language === "bn"}
          onClick={() => setLanguage("bn")}
          className={buttonClass(language === "bn")}
        >
          বাংলা
        </button>
        <button
          type="button"
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
          className={buttonClass(language === "en")}
        >
          English
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Current language: {language === "bn" ? "বাংলা" : "English"}
      </p>
    </section>
  );
}
