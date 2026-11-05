import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/services/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = await searchSuggestions(query, 5);
    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("Search suggestions failed:", error);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
