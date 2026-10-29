import Link from "next/link";
import { RecordImage } from "@/components/ui/record-image";
import type { Business } from "@/types/content"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons";
const BUSINESS_LABELS: Record<string, string> = {
hotel: "Hotel",
restaurant: "Restaurant",
transport: "Transport",
shop: "Shop",
service: "Service",
other: "Other", };
/** English labels — kept for the admin directory table. */ export function businessCategoryLabel(category: string): string {
return BUSINESS_LABELS[category] ?? category; }
/** Bengali labels for public-facing cards and filters. */ export function businessCategoryLabelBn(category: string): string {
return BUSINESS_LABELS[category] ?? category; }
export function BusinessCard({ business, locationLabel }: { business: Business; locationLabel?: string }) {
return (
<Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl">
<div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
<RecordImage
src={business.image}
alt={business.name}
fill
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
/>
<div className="absolute left-3 top-3">
<Badge tone="neutral">{businessCategoryLabelBn(business.category)}</Badge>
</div>
</div>
<div className="flex flex-1 flex-col p-4">
<h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
<Link href={`/businesses/${business.slug}`}>{business.name}</Link>
</h3>
{locationLabel && (
<p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
<Icon name="map-pin" className="h-3.5 w-3.5" />
{locationLabel}
</p>
)}
<p className="mt-2 line-clamp-2 text-sm text-slate-600">{business.description}</p>
<div className="mt-auto pt-4">
<Link
href={`/businesses/${business.slug}`}
className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
>
View business
<Icon name="arrow-right" className="h-4 w-4" />
</Link>
</div>
</div>
</Card>
); }
