import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header"; import { Prose } from "@/components/layout/prose"; import { Icon } from "@/components/ui/icons";
export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() {
return (
<>
<PageHeader
title="Get in Touch"
description="Write to us for corrections, partnerships, feedback, or help."
/>
<div className="container-x py-10">
<Prose>
<div className="grid gap-6 sm:grid-cols-2">
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<Icon name="mail" className="h-6 w-6 text-brand-600" />
<h3 className="mt-2 font-semibold text-slate-900">Email</h3>
<p className="text-sm">hello@deshconnect.example</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<Icon name="phone" className="h-6 w-6 text-brand-600" />
<h3 className="mt-2 font-semibold text-slate-900">Phone</h3>
<p className="text-sm">+880 2-0000-0000 (Sunday–Thursday, 9 AM–5 PM)</p>
</div>
</div>
<h2>Report Incorrect Information</h2>
<p>
If information about a place of interest, institution, business, or service is wrong or outdated, please
write the name of the entry and what needs to be corrected. Our editorial team reviews every request and
documents the outcome.
</p>
</Prose>
</div>
</>
); }
