import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getGovernmentServiceBySlug } from "@/services/government-services"; import { formatLocation } from "@/services/locations"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { serviceCategoryLabelBn } from "@/components/cards/service-card";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const service = await getGovernmentServiceBySlug(slug);
if (!service) return { title: "Service not found" };
return { title: service.name, description: service.description, alternates: { canonical: `/government-services/${service.slug}` } }; }
export default async function GovernmentServiceDetailPage({ params }: Props) {
const { slug } = await params;
const service = await getGovernmentServiceBySlug(slug);
if (!service) return <EmptyRecordPage title="Government services" description="Find practical guides to public services and required documents." media="/images/banner/Gram_place.webp" backHref="/government-services" backLabel="Browse services" />;
const locationLabel = await formatLocation(service);
return (
<div className="container-x py-8">
<div className="grid gap-8 lg:grid-cols-3">
<div className="lg:col-span-2">
<Badge tone="info">{service.category}</Badge>
<h1 className="mt-3 text-3xl font-bold text-slate-900">{service.name}</h1>
{locationLabel && (
<p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel}
</p>
)}
<div className="prose-body mt-4 text-slate-700">
{service.description.split("\n").map((paragraph, index) => (
<p key={index}>{paragraph}</p>
))}
</div>
</div>
<aside className="space-y-6">
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Office details</h2>
<dl className="mt-4 space-y-4 text-sm">
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Address</dt>
<dd className="mt-1 text-slate-900">{service.officeAddress}</dd>
</div>
{service.hours && (
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Hours</dt>
<dd className="mt-1 text-slate-900">{service.hours}</dd>
</div>
)}
{service.phone && (
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Phone</dt>
<dd className="mt-1">
<a href={`tel:${service.phone}`} className="font-medium text-brand-700">{service.phone}</a>
</dd>
</div>
)}
{service.website && (
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Website</dt>
<dd className="mt-1">
<a href={service.website} target="_blank" rel="noreferrer" className="break-all font-medium text-brand-700">
{service.website}
</a>
</dd>
</div>
)}
</dl>
</div>
{service.requiredDocuments && service.requiredDocuments.length > 0 && (
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Required documents</h2>
<ul className="mt-3 space-y-2">
{service.requiredDocuments.map((document) => (
<li key={document} className="flex items-start gap-2 text-sm text-slate-700">
<Icon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />
{document}
</li>
))}
</ul>
</div>
)}
</aside>
</div>
<div className="mt-8">
<Link href="/government-services" className="text-sm font-medium text-brand-700">← Back to services</Link>
</div>
</div>
); }
