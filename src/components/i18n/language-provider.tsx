"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Locale = "en" | "bn";
type LanguageContextValue = {
  locale: Locale;
  enabled: boolean;
  setLocale: (locale: Locale) => void;
};
type AttributeRecord = { original: string; lastApplied: string };

const LanguageContext = createContext<LanguageContextValue | null>(null);
const TEXT_EXCLUDED = "SCRIPT,STYLE,NOSCRIPT,TEXTAREA,CODE,PRE,SVG,[translate='no'],[data-no-translate],[contenteditable='true']";
const ATTRIBUTE_EXCLUDED = "SCRIPT,STYLE,NOSCRIPT,SVG,[translate='no'],[data-no-translate],[contenteditable='true']";
const ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"] as const;
const translationCache = new Map<string, string>();

async function translateBatch(texts: string[], target: Locale): Promise<string[]> {
  const missing = [...new Set(texts)].filter((value) => !translationCache.has(`${target}:${value}`));
  for (let offset = 0; offset < missing.length; offset += 60) {
    const batch = missing.slice(offset, offset + 60);
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch, target }),
    });
    if (!response.ok) throw new Error("Google Translation is not configured or the request failed.");
    const payload = (await response.json()) as { translations?: string[] };
    if (!Array.isArray(payload.translations) || payload.translations.length !== batch.length) {
      throw new Error("Google Translation returned an invalid response.");
    }
    batch.forEach((value, index) => translationCache.set(`${target}:${value}`, payload.translations![index] ?? value));
  }
  return texts.map((value) => translationCache.get(`${target}:${value}`) ?? value);
}

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
  const attributeOriginals = useRef(new WeakMap<Element, Map<string, AttributeRecord>>());
  const titleOriginal = useRef<string | null>(null);
  const titleLastApplied = useRef<string | null>(null);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!enabled) return;
    document.cookie = `deshconnect_locale_v2=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setLocaleState(nextLocale);
  }, [enabled]);

  useEffect(() => {
    document.documentElement.lang = locale;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const pending = new Set<string>();

    const scanAndTranslate = async () => {
      if (!active) return;
      const textNodes: Array<{ node: Text; original: string }> = [];
      const attributeNodes: Array<{ element: Element; name: string; original: string }> = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();

      while (current) {
        const node = current as Text;
        if (!node.parentElement?.closest(TEXT_EXCLUDED)) {
          const lastApplied = textLastApplied.current.get(node);
          let original = textOriginals.current.get(node);
          if (original === undefined || (lastApplied !== undefined && node.data !== lastApplied)) {
            original = node.data;
            textOriginals.current.set(node, original);
          }
          if (locale === "en") {
            if (lastApplied !== undefined && node.data === lastApplied && node.data !== original) node.data = original;
            textLastApplied.current.delete(node);
          } else if (original.trim() && !/^[\s\d.,:;!?()[\]{}#%+\-/]+$/.test(original)) {
            if (lastApplied === undefined || node.data !== lastApplied) textNodes.push({ node, original });
          }
        }
        current = walker.nextNode();
      }

      for (const element of document.body.querySelectorAll("*")) {
        if (element.closest(ATTRIBUTE_EXCLUDED)) continue;
        for (const name of ATTRIBUTES) {
          const value = element.getAttribute(name);
          if (value === null) continue;
          let records = attributeOriginals.current.get(element);
          if (!records) {
            records = new Map<string, AttributeRecord>();
            attributeOriginals.current.set(element, records);
          }
          let record = records.get(name);
          if (!record || (record.lastApplied !== value && record.original !== value)) {
            record = { original: value, lastApplied: value };
            records.set(name, record);
          }
          if (locale === "en") {
            if (value === record.lastApplied && value !== record.original) element.setAttribute(name, record.original);
            record.lastApplied = record.original;
          } else if (record.original.trim() && value === record.original) {
            attributeNodes.push({ element, name, original: record.original });
          }
        }
      }

      if (titleOriginal.current === null) titleOriginal.current = document.title;
      else if (titleLastApplied.current !== null && document.title !== titleLastApplied.current) titleOriginal.current = document.title;
      if (locale === "en") {
        if (titleLastApplied.current !== null && document.title === titleLastApplied.current) document.title = titleOriginal.current;
        titleLastApplied.current = null;
        return;
      }

      const entries: Array<{ key: string; apply: (translated: string) => void }> = [
        ...textNodes.map((item) => ({ key: item.original, apply: (translated: string) => {
          if (item.node.isConnected && item.node.data === item.original) {
            item.node.data = translated;
            textLastApplied.current.set(item.node, translated);
          }
        } })),
        ...attributeNodes.map((item) => ({ key: item.original, apply: (translated: string) => {
          if (item.element.isConnected && item.element.getAttribute(item.name) === item.original) {
            item.element.setAttribute(item.name, translated);
            const record = attributeOriginals.current.get(item.element)?.get(item.name);
            if (record) record.lastApplied = translated;
          }
        } })),
      ];
      const titleText = titleOriginal.current;
      if (titleText && titleText.trim()) entries.push({ key: titleText, apply: (translated: string) => {
        if (document.title === titleText) {
          document.title = translated;
          titleLastApplied.current = translated;
        }
      } });

      const unique = [...new Set(entries.map((entry) => entry.key))].filter((value) => !pending.has(value));
      if (!unique.length) return;
      unique.forEach((value) => pending.add(value));
      try {
        const translations = await translateBatch(unique, locale);
        const lookup = new Map(unique.map((value, index) => [value, translations[index] ?? value]));
        entries.forEach((entry) => entry.apply(lookup.get(entry.key) ?? entry.key));
      } catch (error) {
        console.error("[DeshConnect] Google Translation failed:", error);
      } finally {
        unique.forEach((value) => pending.delete(value));
      }
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void scanAndTranslate(), 150);
    };

    void scanAndTranslate();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: [...ATTRIBUTES] });
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
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
