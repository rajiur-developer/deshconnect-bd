import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
type Tone = "neutral" | "brand" | "accent" | "amber" | "success" | "info";
const TONES: Record<Tone, string> = {
neutral: "bg-slate-100 text-slate-700 ring-slate-200",
brand: "bg-brand-50 text-brand-700 ring-brand-200",
accent: "bg-accent-500/10 text-accent-600 ring-accent-500/30",
amber: "bg-amber-50 text-amber-700 ring-amber-200",
success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
info: "bg-sky-50 text-sky-700 ring-sky-200", };
export function Badge({
tone = "neutral",
className,
children, }: {
tone?: Tone;
className?: string;
children: ReactNode; }) {
return (
<span
className={cn(
"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
TONES[tone],
className
)}
>
{children}
</span>
); }
export function Card({ className, children }: { className?: string; children: ReactNode }) {
return (
<div
className={cn(
"rounded-2xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300",
className
)}
>
{children}
</div>
); }
export function Section({
title,
description,
action,
children,
className,
contained = true, }: {
title?: string;
description?: string;
action?: ReactNode;
children: ReactNode;
className?: string;
/** Set false when the caller already wraps the section in a container. */
contained?: boolean; }) {
return (
<section className={cn("py-10 sm:py-14", className)}>
<div className={contained ? "container-x" : undefined}>
{(title || description || action) && (
<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
<div>
{title && <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>}
{description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
</div>
{action}
</div>
)}
{children}
</div>
</section>
); }
