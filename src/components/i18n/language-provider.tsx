"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"; import { translateToBengali } from "@/lib/i18n/bengali";
type Locale = "en" | "bn"; type LanguageContextValue = {
locale: Locale;
enabled: boolean;
setLocale: (locale: Locale) => void; }; type TextTarget = { node: Text; original: string }; type AttributeTarget = { element: Element; name: string; original: string };
const LanguageContext = createContext<LanguageContextValue | null>(null); const TEXT_NODE_FILTER = [
"SCRIPT",
"STYLE",
"NOSCRIPT",
"TEXTAREA",
"CODE",
"PRE",
"SVG", ].join(","); const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title", "alt"]; const MAX_TRANSLATION_TEXT_LENGTH = 1_500; const MAX_TRANSLATION_ITEMS = 80; const MAX_TRANSLATION_CHARS = 30_000;
function isStringArray(value: unknown): value is string[] {
return Array.isArray(value) && value.every((item) => typeof item === "string"); }
function shouldTranslate(value: string): boolean {
const text = value.trim();
return (
text.length > 0 &&
text.length <= MAX_TRANSLATION_TEXT_LENGTH &&
/[A-Za-z]/.test(text) &&
!/^(?:https?:\/\/|www\.)/i.test(text)
); }
function isExcluded(element: Element | null): boolean {
return Boolean(
element?.closest(
`${TEXT_NODE_FILTER},[translate="no"],[data-no-translate], [contenteditable="true"]`
)
); }
export function LanguageProvider({
children,
initialLocale,
enabled,
translationConfigured, }: {
children: React.ReactNode;
initialLocale: Locale;
enabled: boolean;
translationConfigured: boolean; }) {
const [locale, setLocaleState] = useState<Locale>(enabled ? initialLocale : "en");
const [translationError, setTranslationError] = useState(false);
const [retryVersion, setRetryVersion] = useState(0);
const textOriginals = useRef(new WeakMap<Text, string>());
const textLastTranslations = useRef(new WeakMap<Text, string>());
const attributeOriginals = useRef(new WeakMap<Element, Map<string, string>>());
const attributeLastTranslations = useRef(new WeakMap<Element, Map<string, string>>());
const translationCache = useRef(new Map<string, string>());
const originalTitle = useRef<string | null>(null);
const lastTitleTranslation = useRef<string | null>(null);
const setLocale = useCallback(
(nextLocale: Locale) => {
if (!enabled) return;
document.cookie = `deshconnect_locale_v2=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
setTranslationError(false);
setLocaleState(nextLocale);
},
[enabled]
);
useEffect(() => {
document.documentElement.lang = locale;
if (locale === "en") {
setTranslationError(false);
return;
}
let disposed = false;
let busy = false;
let rerun = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let observer: MutationObserver;
const collectTargets = () => {
const textTargets: TextTarget[] = [];
const attributeTargets: AttributeTarget[] = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let current = walker.nextNode();
while (current) {
const node = current as Text;
if (!isExcluded(node.parentElement)) {
const previousTranslation = textLastTranslations.current.get(node);
let original = textOriginals.current.get(node);
if (original === undefined || (previousTranslation !== undefined && node.data !== previousTranslation)) {
original = node.data;
textOriginals.current.set(node, original);
}
if (shouldTranslate(original)) textTargets.push({ node, original });
}
current = walker.nextNode();
}
for (const element of document.body.querySelectorAll("*")) {
if (isExcluded(element)) continue;
for (const name of TRANSLATABLE_ATTRIBUTES) {
const currentValue = element.getAttribute(name);
if (currentValue === null) continue;
const lastTranslations = attributeLastTranslations.current.get(element);
const previousTranslation = lastTranslations?.get(name);
let originals = attributeOriginals.current.get(element);
if (!originals) {
originals = new Map();
attributeOriginals.current.set(element, originals);
}
let original = originals.get(name);
if (original === undefined || (previousTranslation !== undefined && currentValue !== previousTranslation)) {
original = currentValue;
originals.set(name, original);
}
if (shouldTranslate(original)) attributeTargets.push({ element, name, original });
}
}
return { textTargets, attributeTargets };
};
const restoreEnglish = () => {
observer?.disconnect();
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let current = walker.nextNode();
while (current) {
const node = current as Text;
const original = textOriginals.current.get(node);
if (original !== undefined) node.data = original;
current = walker.nextNode();
}
for (const element of document.body.querySelectorAll("*")) {
const originals = attributeOriginals.current.get(element);
if (!originals) continue;
for (const [name, original] of originals) element.setAttribute(name, original);
}
if (originalTitle.current !== null) document.title = originalTitle.current;
originalTitle.current = null;
lastTitleTranslation.current = null;
};
const translatePage = async () => {
if (disposed) return;
if (busy) {
rerun = true;
return;
}
busy = true;
do {
rerun = false;
const { textTargets, attributeTargets } = collectTargets();
const originals = Array.from(
new Set([...textTargets.map((target) => target.original), ...attributeTargets.map((target) => target.original)])
);
const missing = originals.filter((original) => !translationCache.current.has(original));
try {
const batches: string[][] = [];
let batch: string[] = [];
let batchLength = 0;
for (const text of missing) {
if (
batch.length === MAX_TRANSLATION_ITEMS ||
batchLength + text.length > MAX_TRANSLATION_CHARS
) {
batches.push(batch);
batch = [];
batchLength = 0;
}
batch.push(text);
batchLength += text.length;
}
if (batch.length > 0) batches.push(batch);
if (!translationConfigured) {
for (const text of missing) translationCache.current.set(text, translateToBengali(text));
} else {
for (const texts of batches) {
const response = await fetch("/api/translate", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ texts }),
});
if (!response.ok) throw new Error(`Translation service returned ${response.status}.`);
const result: { translations?: unknown } = await response.json();
const translations = result.translations;
if (!isStringArray(translations) || translations.length !== texts.length) {
throw new Error("Translation service returned an invalid response.");
}
texts.forEach((text, index) => translationCache.current.set(text, translations[index]));
}
}
if (disposed) return;
observer.disconnect();
for (const { node, original } of textTargets) {
if (textOriginals.current.get(node) !== original) continue;
const translated = translationCache.current.get(original);
if (translated === undefined) continue;
node.data = translated;
textLastTranslations.current.set(node, translated);
}
for (const { element, name, original } of attributeTargets) {
if (attributeOriginals.current.get(element)?.get(name) !== original) continue;
const translated = translationCache.current.get(original);
if (translated === undefined) continue;
element.setAttribute(name, translated);
let lastTranslations = attributeLastTranslations.current.get(element);
if (!lastTranslations) {
lastTranslations = new Map();
attributeLastTranslations.current.set(element, lastTranslations);
}
lastTranslations.set(name, translated);
}
const currentTitle = document.title;
if (
originalTitle.current === null ||
(lastTitleTranslation.current !== null && currentTitle !== lastTitleTranslation.current)
) {
originalTitle.current = currentTitle;
}
const translatedTitle = translateToBengali(originalTitle.current);
document.title = translatedTitle;
lastTitleTranslation.current = translatedTitle;
setTranslationError(false);
observer.observe(document.body, { childList: true, characterData: true, subtree: true });
observer.observe(document.head, { childList: true, characterData: true, subtree: true });
} catch {
if (!disposed) setTranslationError(true);
observer.observe(document.body, { childList: true, characterData: true, subtree: true });
observer.observe(document.head, { childList: true, characterData: true, subtree: true });
break;
}
} while (rerun && !disposed);
busy = false;
};
observer = new MutationObserver(() => {
clearTimeout(timer);
timer = setTimeout(() => void translatePage(), 150);
});
observer.observe(document.body, { childList: true, characterData: true, subtree: true });
observer.observe(document.head, { childList: true, characterData: true, subtree: true });
void translatePage();
return () => {
disposed = true;
clearTimeout(timer);
observer.disconnect();
restoreEnglish();
};
}, [locale, retryVersion, translationConfigured]);
const value: LanguageContextValue = { locale, enabled, setLocale };
return (
<LanguageContext.Provider value={value}>
{children}
{enabled && locale === "bn" && translationError && (
<div
role="status"
data-no-translate
className="fixed bottom-4 left-4 z-[100] max-w-sm rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 shadow-lg"
>
<p>
{translationConfigured
? "Bangla translation is not available. Please check LibreTranslate configuration and try again."
: "Bangla translation is not enabled. Please set LIBRETRANSLATE_URL in .env file and try again."}
</p>
<button
type="button"
onClick={() => {
setTranslationError(false);
setRetryVersion((version) => version + 1);
}}
className="mt-2 font-semibold underline"
>
Try again
</button>
</div>
)}
</LanguageContext.Provider>
); }
export function useLanguage(): LanguageContextValue {
const context = useContext(LanguageContext);
if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
return context; }
