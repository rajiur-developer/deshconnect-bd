import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Google Cloud Translation is not configured." }, { status: 503 });
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
    const result = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: texts, target, format: "text" }),
        cache: "no-store",
      },
    );
    const payload = await result.json();
    if (!result.ok) {
      console.error("Google Cloud Translation request failed:", payload?.error?.message ?? result.status);
      return NextResponse.json({ error: "Google Translation request failed." }, { status: 502 });
    }
    const rows = payload?.data?.translations;
    if (!Array.isArray(rows) || rows.length !== texts.length) {
      return NextResponse.json({ error: "Invalid Google Translation response." }, { status: 502 });
    }
    return NextResponse.json({
      translations: rows.map((row: { translatedText?: unknown }, index: number) =>
        typeof row?.translatedText === "string" ? row.translatedText : texts[index],
      ),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach Google Translation." }, { status: 502 });
  }
}
