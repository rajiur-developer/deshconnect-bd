"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { translateMessage } from "@/i18n/messages";

export type Language = "bn" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (value: string) => string;
  isAdminRoute: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    document.cookie = `dc_language=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLanguage;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "bn" ? "en" : "bn");
  }, [language, setLanguage]);

  const t = useCallback(
    (value: string) => (isAdminRoute ? value : translateMessage(value, language)),
    [isAdminRoute, language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, isAdminRoute }),
    [language, setLanguage, toggleLanguage, t, isAdminRoute],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
