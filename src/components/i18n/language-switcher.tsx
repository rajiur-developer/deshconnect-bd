"use client";
import { useLanguage } from "./language-provider";
export function LanguageSwitcher({ className = "" }: { className?: string }) {
const { locale, enabled, setLocale } = useLanguage();
if (!enabled) return null;
return (
<div
aria-label="Language"
data-no-translate
className={`flex items-center gap-1 rounded-lg border border-slate-200 p-1 text-xs font-semibold ${className}`}
>
<button
type="button"
lang="en"
aria-pressed={locale === "en"}
onClick={() => setLocale("en")}
className={`rounded-md px-2 py-1.5 ${locale === "en" ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
>
English
</button>
<button
type="button"
lang="bn"
aria-pressed={locale === "bn"}
onClick={() => setLocale("bn")}
className={`rounded-md px-2 py-1.5 ${locale === "bn" ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
>
Bengali
</button>
</div>
); }
