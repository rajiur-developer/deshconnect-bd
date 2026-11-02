import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Locale = "en" | "bn";

function getTranslationEndpoint(): URL | null {
  const configuredUrl = process.env.LIBRETRANSLATE_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) return null;
    url.pathname = `${url.pathname.replace(/\\/+$/, "")}/translate`.replace(/^\\/\\/translate$/, "/translate");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

async function translateTexts(texts: string[], target: Locale, endpoint: URL): Promise<string[]> {
  const source = target === "bn" ? "en" : "bn";
  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source,
      target,
      format: "text",
      ...(apiKey ? { api_key: apiKey } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });

  if (response.status === 429) {
    throw new Error("LibreTranslate rate limit reached.");
  }
  if (!response.ok) {
    throw new Error(`LibreTranslate request failed with status ${response.status}.`);
  }

  const payload = await response.json() as { translatedText?: unknown };
  const translated = payload?.translatedText;
  if (Array.isArray(translated) && translated.length === texts.length && translated.every((item) => typeof item === "string")) {
    return translated;
  }
  if (texts.length === 1 && typeof translated === "string") return [translated];
  throw new Error("LibreTranslate returned an invalid response.");
}

export async function POST(request: Request) {
  const endpoint = getTranslationEndpoint();
  if (!endpoint) {
    return NextResponse.json(
      { error: "LibreTranslate is not configured. Set LIBRETRANSLATE_URL to your self-hosted instance." },
      { status: 503 },
    );
  }

  let input: { texts?: unknown; target?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { texts, target } = input;
  if (
    !Array.isArray(texts) || texts.length === 0 || texts.length > 60 ||
    !texts.every((text) => typeof text === "string" && text.length <= 5000) ||
    (target !== "bn" && target !== "en")
  ) {
    return NextResponse.json({ error: "Invalid translation payload." }, { status: 400 });
  }
  if (texts.reduce((sum, text) => sum + text.length, 0) > 30000) {
    return NextResponse.json({ error: "Translation batch too large." }, { status: 413 });
  }

  try {
    const translations = await translateTexts(texts as string[], target as Locale, endpoint);
    return NextResponse.json({ translations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown translation error.";
    console.error("[DeshConnect] LibreTranslate request failed:", message);
    return NextResponse.json(
      { error: "LibreTranslate request failed. Please try again later." },
      { status: message.includes("rate limit") ? 429 : 502 },
    );
  }
}
