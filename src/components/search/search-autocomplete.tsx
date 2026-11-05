"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { useLanguage } from "@/components/i18n/language-provider";

type Suggestion = { label: string; category: string };

type SearchAutocompleteProps = {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  wrapperClassName?: string;
};

export function SearchAutocomplete({
  name = "q",
  value,
  onValueChange,
  placeholder = "Search places, hospitals, businesses and services…",
  ariaLabel = "Search DeshConnect",
  className = "",
  wrapperClassName = "relative min-w-0",
}: SearchAutocompleteProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const scope = pathname === "/" ? "all" :
    pathname.startsWith("/places") || pathname.startsWith("/tourism") ? "places" :
    pathname.startsWith("/institutions") ? "institutions" :
    pathname.startsWith("/hospitals") ? "hospitals" :
    pathname.startsWith("/businesses") ? "businesses" :
    pathname.startsWith("/government-services") ? "government-services" :
    pathname.startsWith("/news") ? "news" : "none";
  const [internalValue, setInternalValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const currentValue = value ?? internalValue;

  function updateValue(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  useEffect(() => {
    const query = currentValue.trim();
    if (query.length < 2) {
      requestRef.current?.abort();
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&scope=${scope}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Could not load search suggestions");
        const data = await response.json();
        if (!controller.signal.aborted) {
          setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
          setOpen(true);
          setActiveIndex(-1);
        }
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [currentValue, scope]);

  function chooseSuggestion(suggestion: Suggestion) {
    updateValue(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
    const form = inputRef.current?.form;
    if (form) window.requestAnimationFrame(() => form.requestSubmit());
  }

  function handleKeyDown(event: { key: string; preventDefault: () => void }) {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div className={wrapperClassName}>
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-3.5 sm:h-[18px] sm:w-[18px]" />
      <input
        ref={inputRef}
        name={name}
        value={currentValue}
        onChange={(event) => updateValue(event.target.value)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        onKeyDown={handleKeyDown}
        placeholder={t(placeholder)}
        aria-label={t(ariaLabel)}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="deshconnect-search-suggestions"
        aria-activedescendant={activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined}
        autoComplete="off"
        className={className}
      />
      {open && (suggestions.length > 0 || loading) && (
        <div
          id="deshconnect-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[10000] mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl shadow-slate-950/20"
        >
          {loading && suggestions.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-slate-500">{t("Searching suggestions…")}</p>
          ) : suggestions.map((suggestion, index) => (
            <button
              id={`search-suggestion-${index}`}
              key={`${suggestion.category}-${suggestion.label}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseSuggestion(suggestion)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${activeIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"}`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon name="search" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-slate-800">{suggestion.label}</span>
              </span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{suggestion.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
