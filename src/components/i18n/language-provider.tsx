"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { translateToBengali } from "@/lib/i18n/bengali";

type Locale = "en" | "bn";
type LanguageContextValue = {
  locale: Locale;
  enabled: boolean;
  setLocale: (locale: Locale) => void;
};

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
  const attributeOriginals = useRef(new WeakMap<Element, Map<string, string>>());
  const titleOriginal = useRef<string | null>(null);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!enabled) return;
    document.cookie = `deshconnect_locale_v2=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setLocaleState(nextLocale);
  }, [enabled]);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (locale === "en") {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const original = textOriginals.current.get(node as Text);
        if (original !== undefined) (node as Text).data = original;
        node = walker.nextNode();
      }
      for (const element of document.body.querySelectorAll("*")) {
        const originals = attributeOriginals.current.get(element);
        originals?.forEach((value, name) => element.setAttribute(name, value));
      }
      if (titleOriginal.current !== null) document.title = titleOriginal.current;
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const translatePage = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        const text = current as Text;
        if (!text.parentElement?.closest(EXCLUDED)) {
          let original = textOriginals.current.get(text);
          if (original === undefined) {
            original = text.data;
            textOriginals.current.set(text, original);
          } else if (text.data !== translateToBengali(original) && text.data !== original) {
            original = text.data;
            textOriginals.current.set(text, original);
          }
          if (original.trim() && /[A-Za-z]/.test(original)) {
            text.data = translateToBengali(original);
          }
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
            originals = new Map();
            attributeOriginals.current.set(element, originals);
          }
          let original = originals.get(name);
          if (original === undefined) {
            original = value;
            originals.set(name, original);
          } else if (value !== translateToBengali(original) && value !== original) {
            original = value;
            originals.set(name, original);
          }
          if (original.trim() && /[A-Za-z]/.test(original)) {
            element.setAttribute(name, translateToBengali(original));
          }
        }
      }

      if (titleOriginal.current === null) titleOriginal.current = document.title;
      document.title = translateToBengali(titleOriginal.current);
    };

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
