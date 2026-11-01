import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";
export function PageHeader({
title,
description,
action,
children,
variant = "default", }: {
title: string;
description?: string;
action?: ReactNode;
children?: ReactNode;
variant?: "default" | "messages"; }) {
return (
<section className={variant === "messages" ? "relative isolate overflow-hidden border-b border-brand-900/10 bg-gradient-to-r from-brand-50 via-white to-emerald-50" : "border-b border-slate-200 bg-white"}>
{variant === "messages" && <><div className="absolute -right-16 -top-28 -z-0 h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" /><div className="absolute -bottom-28 left-[48%] -z-0 h-56 w-56 rounded-full bg-emerald-200/25 blur-3xl" /></>}
<div className="container-x py-8 sm:py-10">
<div className="flex flex-wrap items-start justify-between gap-4">
{variant === "messages" ? <div className="relative z-10 flex max-w-3xl items-center gap-4">
<span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-800 text-white shadow-md shadow-brand-900/15"><Icon name="message" className="h-6 w-6" /></span>
<div><p className="mb-1 text-xs font-bold uppercase tracking-[0.10em] text-brand-700">Direct messages</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-slate-600">{description}</p>}</div>
</div> : <div className="max-w-3xl"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>{description && <p className="mt-2 text-slate-600">{description}</p>}</div>}
{action && <div className="shrink-0">{action}</div>}
</div>
{children && <div className="mt-4">{children}</div>}
</div>
</section>
); }
