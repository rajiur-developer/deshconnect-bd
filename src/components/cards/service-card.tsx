import Link from "next/link";
import type { GovernmentService } from "@/types/content"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons";
const SERVICE_LABELS: Record<string, string> = {
identity: "Identity",
land: "Land",
health: "Health",
education: "Education",
transport: "Transport",
tax: "Tax",
other: "Other", };
/** English labels — kept for the admin directory table. */ export function serviceCategoryLabel(category: string): string {
return SERVICE_LABELS[category] ?? category; }
/** Bengali labels for public-facing cards and filters. */ export function serviceCategoryLabelBn(category: string): string {
return SERVICE_LABELS[category] ?? category; }
export function ServiceCard({ service, locationLabel }: { service: GovernmentService; locationLabel?: string }) {
return (
<Card className="group flex h-full flex-col overflow-hidden p-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl">
<div className="flex items-start gap-3">
<span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
<Icon name="landmark" className="h-6 w-6" />
</span>
<div className="min-w-0">
<h3 className="font-semibold text-slate-900 group-hover:text-brand-700">
<Link href={`/government-services/${service.slug}`}>{service.name}</Link>
</h3>
<Badge tone="info" className="mt-1">{serviceCategoryLabelBn(service.category)}</Badge>
</div>
</div>
{locationLabel && (
<p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
<Icon name="map-pin" className="h-3.5 w-3.5" />
{locationLabel}
</p>
)}
<p className="mt-2 line-clamp-2 text-sm text-slate-600">{service.description}</p>
<div className="mt-auto pt-4">
<Link
href={`/government-services/${service.slug}`}
className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
>
View service
<Icon name="arrow-right" className="h-4 w-4" />
</Link>
</div>
</Card>
); }
