import { createHmac, timingSafeEqual } from "node:crypto"; import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "@/lib/constants"; import type { Session } from "@/types/auth";
type CookiePayload = Session & { exp: number };
const DEVELOPMENT_SECRET = "dev-insecure-secret-change-me"; const PLACEHOLDER_SECRET = "replace-me-with-a-long-random-secret";
function secret(): string {
const configured = process.env.AUTH_SECRET;
if (
configured &&
configured === configured.trim() &&
configured.length >= 32 &&
configured !== DEVELOPMENT_SECRET &&
configured !== PLACEHOLDER_SECRET
) {
return configured;
}
if (process.env.NODE_ENV === "development") return DEVELOPMENT_SECRET;
throw new Error("AUTH_SECRET must be configured with at least 32 characters."); }
function sign(value: string): string {
return createHmac("sha256", secret()).update(value).digest("base64url"); }
/** Build a signed cookie value for a session. */ export function encodeSession(session: Session): string {
const payload: CookiePayload = {
...session,
exp: Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
};
const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
return `${body}.${sign(body)}`; }
/** Verify and decode a cookie value. Returns null when invalid or expired. */ export function decodeSession(token: string): Session | null {
const [body, signature] = token.split(".");
if (!body || !signature) return null;
const expected = sign(body);
const a = Buffer.from(signature);
const b = Buffer.from(expected);
if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
try {
const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CookiePayload;
if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
return { userId: payload.userId, issuedAt: payload.issuedAt };
} catch {
return null;
} }
/** Read the current session token from the request cookies. */ export async function readSessionToken(): Promise<string | null> {
const store = await cookies();
return store.get(SESSION_COOKIE)?.value ?? null; }
/** Create a session cookie value string for the Set-Cookie header. */ export function sessionCookieValue(session: Session): string {
return encodeSession(session); }
export const SESSION_COOKIE_ATTRIBUTES = [
"Path=/",
"HttpOnly",
"SameSite=Lax",
`Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`,
process.env.NODE_ENV === "production" ? "Secure" : "", ].filter(Boolean);
export type CookieOptions = {
httpOnly: boolean;
sameSite: "lax";
path: string;
maxAge: number;
secure: boolean; };
/** Options for cookies().set() when creating a session. */ export function sessionCookieOptions(): CookieOptions {
return {
httpOnly: true,
sameSite: "lax",
path: "/",
maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
secure: process.env.NODE_ENV === "production",
}; }
