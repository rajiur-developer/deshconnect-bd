import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
export const runtime = "nodejs";
const MAX_TEXTS = 80; const MAX_TEXT_LENGTH = 1_500; const MAX_TOTAL_LENGTH = 30_000; const CONCURRENT_TRANSLATIONS = 4;
type TranslationResponse = { translatedText?: unknown };
async function translateText(baseUrl: string, apiKey: string | undefined, text: string): Promise<string> {
const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/translate`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
q: text,
source: "en",
target: "bn",
format: "text",
...(apiKey ? { api_key: apiKey } : {}),
}),
signal: AbortSignal.timeout(20_000),
});
if (!response.ok) throw new Error(`LibreTranslate returned ${response.status}.`);
const result = (await response.json()) as TranslationResponse;
if (typeof result.translatedText !== "string") {
throw new Error("LibreTranslate returned an invalid translation.");
}
return result.translatedText; }
export async function POST(request: Request) {
const url = process.env.LIBRETRANSLATE_URL;
if (!url) return NextResponse.json({ error: "Translation is not configured." }, { status: 503 });
let parsedUrl: URL;
try {
parsedUrl = new URL(url);
} catch {
return NextResponse.json({ error: "LIBRETRANSLATE_URL must be a valid HTTP(S) URL." }, { status: 500 });
}
if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
return NextResponse.json({ error: "LIBRETRANSLATE_URL must use HTTP or HTTPS." }, { status: 500 });
}
const clientIp =
request.headers.get("x-real-ip") ??
request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
"unknown";
const limit = rateLimit(`translate:${clientIp}`, 15, 60_000);
if (!limit.ok) {
return NextResponse.json(
{ error: "Translation rate limit exceeded." },
{ status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
);
}
let body: unknown;
try {
body = await request.json();
} catch {
return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
}
if (
!body ||
typeof body !== "object" ||
!("texts" in body) ||
!Array.isArray(body.texts) ||
body.texts.length === 0 ||
body.texts.length > MAX_TEXTS ||
!body.texts.every((text) => typeof text === "string" && text.length > 0 && text.length <= MAX_TEXT_LENGTH)
) {
return NextResponse.json({ error: "Provide 1 to 80 text values, each at most 1,500 characters." }, { status: 400 });
}
const texts = body.texts as string[];
if (texts.reduce((total, text) => total + text.length, 0) > MAX_TOTAL_LENGTH) {
return NextResponse.json({ error: "Total translation text exceeds 30,000 characters." }, { status: 413 });
}
const translations = new Array<string>(texts.length);
let nextIndex = 0;
try {
await Promise.all(
Array.from({ length: Math.min(CONCURRENT_TRANSLATIONS, texts.length) }, async () => {
while (nextIndex < texts.length) {
const index = nextIndex++;
translations[index] = await translateText(url, process.env.LIBRETRANSLATE_API_KEY, texts[index]);
}
})
);
} catch (error) {
console.error("LibreTranslate request failed:", error instanceof Error ? error.message : "Unknown provider error.");
return NextResponse.json({ error: "Translation service request failed." }, { status: 502 });
}
return NextResponse.json({ translations }); }
