import type { Metadata } from "next"; import { cookies } from "next/headers"; import { redirect } from "next/navigation";
import { firstParam } from "@/lib/query"; import { SESSION_COOKIE } from "@/lib/constants"; import { decodeSession, sessionCookieOptions } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Auth callback", robots: { index: false, follow: false } };
/**
* Handles an external auth provider callback. In local mode the callback simply
* resolves a session token and establishes the cookie.
*/ export default async function AuthCallbackPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const token = firstParam(params.token) ?? "";
if (token) {
const session = decodeSession(token);
if (session) {
const cookieStore = await cookies();
cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
redirect("/dashboard");
}
}
redirect("/login"); }
