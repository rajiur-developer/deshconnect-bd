import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/current-user";
import { insforgeSelectOne } from "@/lib/insforge";

export const dynamic = "force-dynamic";

function escapeOverpass(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser("/admin");
    if (!["admin", "moderator"].includes(user.role)) {
      return NextResponse.json({ error: "আপনার এই অনুসন্ধানের অনুমতি নেই।" }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const name = (params.get("name") ?? "").trim().slice(0, 100);
    const districtId = (params.get("districtId") ?? "").trim();
    if (name.length < 2 || !districtId) {
      return NextResponse.json({ error: "স্থানের নাম এবং জেলা নির্বাচন করুন।" }, { status: 400 });
    }

    const district = await insforgeSelectOne("districts", { id: `eq.${districtId}`, select: "id,name" });
    if (!district?.name) {
      return NextResponse.json({ error: "নির্বাচিত জেলাটি পাওয়া যায়নি।" }, { status: 404 });
    }

    const districtPattern = escapeOverpass(String(district.name));
    const namePattern = escapeOverpass(name);
    const query = `[out:json][timeout:20];
      area["boundary"="administrative"]["admin_level"="6"]["name"~".*${districtPattern}.*",i]->.district;
      (
        nwr["name"~".*${namePattern}.*",i](area.district);
        nwr["name:bn"~".*${namePattern}.*",i](area.district);
        nwr["name:en"~".*${namePattern}.*",i](area.district);
      );
      out center tags 30;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8", "user-agent": "DeshConnect/1.0 (district-scoped location search)" },
      body: query,
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "OpenStreetMap সার্ভার এখন সাড়া দিচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 502 });
    }

    const payload = await response.json() as { elements?: Array<Record<string, any>> };
    const results = new Map<string, {
      id: string; name: string; latitude: number; longitude: number; address: string;
      type: string; osmUrl: string;
    }>();

    for (const item of payload.elements ?? []) {
      const tags = item.tags ?? {};
      const latitude = typeof item.lat === "number" ? item.lat : item.center?.lat;
      const longitude = typeof item.lon === "number" ? item.lon : item.center?.lon;
      const resultName = String(tags.name ?? tags["name:bn"] ?? tags["name:en"] ?? "").trim();
      if (!resultName || typeof latitude !== "number" || typeof longitude !== "number") continue;
      if (latitude < 20.5 || latitude > 26.7 || longitude < 88 || longitude > 92.7) continue;
      const id = `${item.type}/${item.id}`;
      const address = [
        tags["addr:suburb"], tags["addr:street"], tags["addr:city"],
        tags["addr:district"], tags["addr:full"],
      ].filter(Boolean).join(", ");
      results.set(id, {
        id, name: resultName, latitude, longitude, address,
        type: String(item.type ?? "object"),
        osmUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
      });
    }

    return NextResponse.json({
      district: district.name,
      results: Array.from(results.values()).slice(0, 30),
      attribution: "© OpenStreetMap contributors",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("District-scoped OSM search failed", error);
    return NextResponse.json({ error: "লোকেশন খোঁজা যায়নি। আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
