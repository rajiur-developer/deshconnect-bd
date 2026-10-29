import Link from "next/link";
import type { PageMeta } from "@/lib/utils"; import { cn } from "@/lib/utils"; import { buttonClasses } from "./button";
function pageList(current: number, total: number): (number | "…")[] {
const pages = new Set<number>([1, total, current, current - 1, current + 1]);
const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
const out: (number | "…")[] = [];
let prev = 0;
for (const page of sorted) {
if (prev && page - prev > 1) out.push("…");
out.push(page);
prev = page;
}
return out; }
export function Pagination({ meta, hrefFor }: { meta: PageMeta; hrefFor: (page: number) => string }) {
if (meta.totalPages <= 1) return null;
return (
<nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
{meta.hasPrev ? (
<Link href={hrefFor(meta.page - 1)} className={buttonClasses({ variant: "outline", size: "sm" })}>
Previous
</Link>
) : (
<span className={cn(buttonClasses({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}>Previous</span>
)}
{pageList(meta.page, meta.totalPages).map((item, index) =>
item === "…" ? (
<span key={`gap-${index}`} className="px-1 text-slate-400">
…
</span>
) : (
<Link
key={item}
href={hrefFor(item)}
aria-current={item === meta.page ? "page" : undefined}
className={cn(
"inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium",
item === meta.page
? "border-brand-600 bg-brand-600 text-white"
: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
)}
>
{item}
</Link>
)
)}
{meta.hasNext ? (
<Link href={hrefFor(meta.page + 1)} className={buttonClasses({ variant: "outline", size: "sm" })}>
Next
</Link>
) : (
<span className={cn(buttonClasses({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}>Next</span>
)}
</nav>
); }
