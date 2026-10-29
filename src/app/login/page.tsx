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
<div className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50"><div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" /><div className="container-x relative flex min-h-[70vh] items-center justify-center py-8 sm:py-12">
<div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-2xl shadow-brand-900/10 ring-1 ring-brand-900/5 backdrop-blur lg:grid-cols-2">
<section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
<div aria-hidden="true" className="pointer-events-none absolute -right-16 top-12 h-56 w-56 rounded-full border border-white/10 bg-white/5 blur-sm" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
<div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-300" /> WELCOME TO DESHCONNECT</span><h2 className="mt-8 max-w-sm text-3xl font-bold leading-tight xl:text-4xl">Good to have you <span className="text-emerald-200">back.</span></h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Log in to reconnect with your community, revisit saved places, and stay up to date with what is happening around you.</p></div>
<div className="relative mt-12 space-y-4 text-sm text-white/90"><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-emerald-200">✓</span> Pick up where you left off</p><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-emerald-200">✓</span> Keep your saved places close</p><p className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-emerald-200">✓</span> Stay connected with your community</p><p className="pt-4 text-xs text-white/50">Your community, connected.</p></div>
</section>
<div className="min-w-0 p-2 sm:p-4 lg:p-5 xl:p-7"><LoginForm next={next} oauthError={oauthError} /></div>
</div></div>
</div>
 </>
); }
