import type { Metadata } from "next"; import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { firstParam } from "@/lib/query"; import { ResetPasswordForm } from "@/components/auth/reset-password-form";
export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export default async function ResetPasswordPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const email = firstParam(params.email) ?? "";
return (
<>
<PageHeader title="Reset password" description="Choose a new password to secure your account." />
<div className="container-x flex min-h-[70vh] items-center justify-center py-12">
<div className="w-full max-w-md">
{email ? (
<ResetPasswordForm email={email} />
) : (
<div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
<h1 className="text-2xl font-bold text-slate-900">Reset code needed</h1>
<p className="mt-2 text-sm text-slate-600">Request a 6-digit reset code using your account email.</p>
<Link href="/forgot-password" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
Request code
</Link>
</div>
)}
</div>
</div>
 </>
); }
