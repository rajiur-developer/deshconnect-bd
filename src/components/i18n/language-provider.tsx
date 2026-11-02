"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { translateToLocale } from "@/lib/i18n/bengali";

type Locale = "en" | "bn";
type LanguageContextValue = {
  locale: Locale;
  enabled: boolean;
  setLocale: (locale: Locale) => void;
};
type OriginalAttribute = { original: string; lastApplied: string };

const LanguageContext = createContext<LanguageContextValue | null>(null);
const EXCLUDED = "SCRIPT,STYLE,NOSCRIPT,TEXTAREA,CODE,PRE,SVG,[translate='no'],[data-no-translate],[contenteditable='true']";
const ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"] as const;

export function LanguageProvider({
  children,
  initialLocale,
  enabled,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  enabled: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(enabled ? initialLocale : "en");
  const textOriginals = useRef(new WeakMap<Text, string>());
  const textLastApplied = useRef(new WeakMap<Text, string>());
  const attributeOriginals = useRef(new WeakMap<Element, Map<string, OriginalAttribute>>());
  const titleOriginal = useRef<string | null>(null);
  const titleLastApplied = useRef<string | null>(null);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!enabled) return;
    document.cookie = `deshconnect_locale_v2=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setLocaleState(nextLocale);
  }, [enabled]);

  useEffect(() => {
    document.documentElement.lang = locale;

    const translatePage = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        const text = current as Text;
        if (!text.parentElement?.closest(EXCLUDED)) {
          let original = textOriginals.current.get(text);
          const lastApplied = textLastApplied.current.get(text);
          if (original === undefined) {
            original = text.data;
            textOriginals.current.set(text, original);
          } else if (lastApplied !== undefined && text.data !== lastApplied) {
            original = text.data;
            textOriginals.current.set(text, original);
          }

          const translated = translateToLocale(original, locale);
          if (text.data !== translated) text.data = translated;
          textLastApplied.current.set(text, translated);
        }
        current = walker.nextNode();
      }

      for (const element of document.body.querySelectorAll("*")) {
        if (element.closest(EXCLUDED)) continue;
        for (const name of ATTRIBUTES) {
          const value = element.getAttribute(name);
          if (value === null) continue;
          let originals = attributeOriginals.current.get(element);
          if (!originals) {
            originals = new Map<string, OriginalAttribute>();
            attributeOriginals.current.set(element, originals);
          }
          let record = originals.get(name);
          if (!record) {
            record = { original: value, lastApplied: value };
            originals.set(name, record);
          } else if (value !== record.lastApplied) {
            record = { original: value, lastApplied: value };
            originals.set(name, record);
          }
          const translated = translateToLocale(record.original, locale);
          if (value !== translated) element.setAttribute(name, translated);
          record.lastApplied = translated;
        }
      }

      if (titleOriginal.current === null) titleOriginal.current = document.title;
      else if (titleLastApplied.current !== null && document.title !== titleLastApplied.current) {
        titleOriginal.current = document.title;
      }
      const translatedTitle = translateToLocale(titleOriginal.current, locale);
      if (document.title !== translatedTitle) document.title = translatedTitle;
      titleLastApplied.current = translatedTitle;
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(translatePage, 100);
    });
    translatePage();
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, enabled, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
  return context;
}
