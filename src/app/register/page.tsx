// @ts-nocheck
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getDirectoryLocationOptions } from "@/services/locations"; import { RegisterForm } from "@/components/auth/register-form";
export const metadata: Metadata = { title: "Register", robots: { index: false, follow: false } };
export default async function RegisterPage() {
const options = await getDirectoryLocationOptions().catch(() => ({ divisions: [], districts: [], upazilas: [] }));
return (
<>
<PageHeader title="Create your account" description="Join DeshConnect and take part in your community." />
<div className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50"><div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" /><div className="container-x relative flex min-h-[70vh] items-center justify-center py-8 sm:py-12">
<div className="w-full max-w-3xl rounded-[2rem] border border-white bg-white/85 p-2 shadow-xl shadow-brand-900/10 ring-1 ring-brand-900/5 backdrop-blur sm:p-3">
<RegisterForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} />
</div>
</div>
</div>
 </>
); }
