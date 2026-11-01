import Link from "next/link";
import { RecordImage } from "@/components/ui/record-image";
import type { Institution } from "@/types/content"; import { INSTITUTION_CATEGORIES } from "@/lib/constants"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons";
export function institutionCategoryLabel(category: string, categoryName?: string): string {
return categoryName ?? INSTITUTION_CATEGORIES.find((item) => item.value === category)?.label ?? category; }
export function InstitutionCard({ institution, locationLabel }: { institution: Institution; locationLabel?: string }) {
const href = institution.category === "hospital" || institution.category === "health-centre"
? `/hospitals/${institution.slug}`
: `/institutions/${institution.slug}`;
return (
<Card className="dc-content-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus-within:border-emerald-300 focus-within:shadow-lg">
<div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100">
{institution.image?.trim() ? <RecordImage
src={institution.image}
alt={institution.name}
fill
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
/> : <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-50 via-white to-slate-100"><div className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-slate-200">{institution.category === "hospital" || institution.category === "health-centre" ? "🏥" : "🎓"}</span><span className="mt-2 block text-xs font-semibold text-slate-500">{institution.category === "hospital" || institution.category === "health-centre" ? "Healthcare" : "Education"}</span></div></div>}
<div className="absolute left-3 top-3">
<Badge tone="info">{institutionCategoryLabel(institution.category, institution.categoryName)}</Badge>
</div>
</div>
<div className="flex flex-1 flex-col p-4">
<h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700">
<Link href={href}>{institution.name}</Link>
</h3>
{locationLabel && (
<p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
<Icon name="map-pin" className="h-3.5 w-3.5" />
{locationLabel}
</p>
)}
<p className="mt-2 line-clamp-2 text-sm text-slate-600">{institution.description}</p>
{institution.emergencyPhone && (
<p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent-600">
<Icon name="phone" className="h-3.5 w-3.5" />
Emergency: {institution.emergencyPhone}
</p>
)}
<div className="mt-auto pt-4">
<Link
href={href}
className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
>
View details
<Icon name="arrow-right" className="h-4 w-4" />
</Link>
</div>
</div>
</Card>
); }
