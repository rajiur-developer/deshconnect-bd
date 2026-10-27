// @ts-nocheck
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { firstParam } from "@/lib/query"; import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "Login", robots: { index: false, follow: false } };
export default async function LoginPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const next = firstParam(params.next) ?? "/dashboard";
const user = await getCurrentUser();
if (user) redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
const oauthError = firstParam(params.error);
return (
<>
<PageHeader title="Welcome back" description="Log in to your DeshConnect account." />
<div className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50"><div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" /><div className="container-x relative flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
<div className="w-full max-w-md rounded-[2rem] border border-white bg-white/80 p-2 shadow-xl shadow-brand-900/10 ring-1 ring-brand-900/5 backdrop-blur sm:p-3">
<LoginForm next={next} oauthError={oauthError} />
</div>
</div>
</div>
 </>
); }
