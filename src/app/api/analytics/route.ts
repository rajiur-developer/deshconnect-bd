import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { insforgeInsert } from "@/lib/insforge";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "dc_visitor";
const SESSION_COOKIE = "dc_analytics_session";
const COOKIE_YEAR = 60 * 60 * 24 * 365;
const COOKIE_SESSION = 60 * 30;

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeReferrerHost(value: unknown, currentHost: string): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    return host && host !== currentHost.toLowerCase() ? host.slice(0, 255) : null;
  } catch {
    return null;
  }
}

function deviceType(userAgent: string): "mobile" | "tablet" | "desktop" | "unknown" {
  if (/bot|crawler|spider|slurp|headless|preview/i.test(userAgent)) return "unknown";
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/i.test(userAgent)) return "mobile";
  return userAgent ? "desktop" : "unknown";
}

export async function POST(request: NextRequest) {
  const forwardedIp =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const ipKey = hash(forwardedIp);
  const limit = rateLimit(`analytics:${ipKey}`, 90, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  let payload: { path?: unknown; referrer?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    typeof payload.path !== "string" ||
    !payload.path.startsWith("/") ||
    payload.path.startsWith("//") ||
    payload.path.length > 300 ||
    payload.path.startsWith("/api/") ||
    payload.path.startsWith("/_next/")
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|slurp|headless|preview/i.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const visitorToken = request.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value ?? randomUUID();
  const visitorKey = hash(visitorToken);
  const sessionKey = hash(sessionToken);
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  const referrerHost = safeReferrerHost(payload.referrer, request.nextUrl.host);

  const response = new NextResponse(null, { status: 204 });
  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  if (!request.cookies.has(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, visitorToken, { ...cookieBase, maxAge: COOKIE_YEAR });
  }
  response.cookies.set(SESSION_COOKIE, sessionToken, { ...cookieBase, maxAge: COOKIE_SESSION });

  try {
    await insforgeInsert("visitor_events", {
      visitor_key: visitorKey,
      session_key: sessionKey,
      path: payload.path.split("?")[0].split("#")[0],
      referrer_host: referrerHost,
      device_type: deviceType(userAgent),
      country_code: country && /^[A-Z]{2}$/.test(country) ? country : null,
      region: region ? region.slice(0, 100) : null,
    });
  } catch (error) {
    // A repeated visit to the same route within one minute is deduplicated by
    // the database. Other analytics failures must not affect the visitor.
    const message = error instanceof Error ? error.message : String(error);
    if (!/23505|duplicate key|unique constraint/i.test(message)) {
      console.error("Anonymous analytics event could not be stored:", message);
      return NextResponse.json({ ok: false }, { status: 503 });
    }
  }

  return response;
}
