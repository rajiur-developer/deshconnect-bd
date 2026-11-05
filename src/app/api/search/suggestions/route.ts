import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/services/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const allowedScopes = new Set(["all", "places", "institutions", "hospitals", "businesses", "government-services", "news"]);
  const requestedScope = request.nextUrl.searchParams.get("scope") ?? "none";
  const scope = allowedScopes.has(requestedScope) ? requestedScope : "none";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = scope === "none" ? [] : await searchSuggestions(query, 8, scope);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("Search suggestions failed:", error);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
