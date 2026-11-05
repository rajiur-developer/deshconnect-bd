"use client";

import { useLanguage } from "@/components/i18n/language-provider";

export function TranslatedText({ text }: { text: string }) {
  const { t } = useLanguage();
  return <>{t(text)}</>;
}
