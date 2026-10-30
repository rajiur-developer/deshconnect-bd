import Link from "next/link";
import type { NavItem } from "@/config/site"; import { Icon, type IconName } from "@/components/ui/icons";
export function CategoryCard({ item }: { item: NavItem & { icon: string; blurb: string } }) {
const isBloodDonation = item.href === "/blood-donation";
return (
<Link
href={item.href}
className={`dc-category-card group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${         isBloodDonation           ? "blood-category-card border-accent-300 ring-2 ring-accent-200 hover:border-accent-500 hover:ring-accent-400"           : "border-slate-200 hover:border-brand-400"       }`}
>
{isBloodDonation && (
<span className="absolute right-3 top-3 rounded-full bg-accent-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
Highlight
</span>
)}
<span
className={`grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-white ${           isBloodDonation             ? "bg-accent-50 text-accent-600 group-hover:bg-accent-600"             : "bg-brand-50 text-brand-700 group-hover:bg-brand-600"         }`}
>
<Icon name={item.icon as IconName} className="h-6 w-6" />
</span>
<h3
className={`mt-4 font-semibold transition-colors duration-200 ${           isBloodDonation ? "text-accent-700" : "text-slate-900 group-hover:text-brand-700"         }`}
>
{item.label}
</h3>
<p className="mt-1 text-sm text-slate-600">{item.blurb}</p>
</Link>
); }
