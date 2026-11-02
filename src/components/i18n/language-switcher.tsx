"use client";

import { useLanguage } from "./language-provider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, enabled, setLocale } = useLanguage();

  if (!enabled) return null;

  return (
    <div
      role="group"
      aria-label="Choose language"
      data-no-translate
      className={`inline-flex h-10 items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-1 shadow-inner shadow-slate-900/[0.04] ${className}`}
    >
      <span className="sr-only" aria-live="polite">
        {locale === "bn" ? "বর্তমান ভাষা বাংলা" : "Current language English"}
      </span>
      <button
        type="button"
        lang="en"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        className={`relative z-10 inline-flex h-8 min-w-[4.25rem] items-center justify-center rounded-full px-3 text-xs font-bold tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
          locale === "en"
            ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200/80"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        lang="bn"
        aria-pressed={locale === "bn"}
        onClick={() => setLocale("bn")}
        className={`relative z-10 inline-flex h-8 min-w-[4.25rem] items-center justify-center rounded-full px-3 text-xs font-bold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
          locale === "bn"
            ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/15"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
