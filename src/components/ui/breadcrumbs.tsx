import Link from "next/link";
export type Crumb = { label: string; href?: string };
export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
return (
<nav aria-label="Breadcrumb" className="mb-4">
<ol className={`flex flex-wrap items-center gap-1.5 text-sm ${dark ? "text-white/70" : "text-slate-500"}`}>
{items.map((item, index) => {
const last = index === items.length - 1;
return (
<li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
{index > 0 && (
<span aria-hidden="true" className={dark ? "text-white/40" : "text-slate-300"}>
/
</span>
)}
{item.href && !last ? (
<Link href={item.href} className={dark ? "hover:text-white" : "hover:text-brand-700"}>
{item.label}
</Link>
) : (
<span
aria-current={last ? "page" : undefined}
className={last ? `font-medium ${dark ? "text-white" : "text-slate-700"}` : undefined}
>
{item.label}
</span>
)}
</li>
);
})}
</ol>
</nav>
); }
