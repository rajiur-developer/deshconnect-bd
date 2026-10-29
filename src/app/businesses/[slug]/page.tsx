import type { Metadata } from "next"; import Image from "next/image"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getBusinessBySlug } from "@/services/businesses"; import { formatLocation } from "@/services/locations"; import { formatDate } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { MapPreview } from "@/components/maps/map-preview";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const business = await getBusinessBySlug(slug);
if (!business) return { title: "Business not found" };
return { title: business.name, description: business.description, alternates: { canonical: `/businesses/${business.slug}` } }; }
export default async function BusinessDetailPage({ params }: Props) {
const { slug } = await params;
const business = await getBusinessBySlug(slug);
if (!business) return <EmptyRecordPage title="Local businesses" description="Discover businesses and useful local services." media="/images/banner/Busenees.webp" backHref="/businesses" backLabel="Browse businesses" />;
const locationLabel = await formatLocation(business);
const jsonLd = {
"@context": "https://schema.org",
"@type": "LocalBusiness",
name: business.name,
description: business.description,
address: business.address,
...(business.phone ? { telephone: business.phone } : {}),
...(business.website ? { url: business.website } : {}),
};
return (
<>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
<div className="container-x py-8">
<div className="grid gap-8 lg:grid-cols-3">
<div className="lg:col-span-2">
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
<Image src={business.image} alt={business.name} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
</div>
<div className="mt-4 flex flex-wrap items-center gap-2">
<Badge tone="neutral">{business.category}</Badge>
{business.verification === "verified" && <Badge tone="success">Verified listing</Badge>}
</div>
<h1 className="mt-3 text-3xl font-bold text-slate-900">{business.name}</h1>
{locationLabel && (
<p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel}
</p>
)}
<div className="prose-body mt-4 text-slate-700">
{business.description.split("\n").map((paragraph, index) => (
<p key={index}>{paragraph}</p>
))}
</div>
<dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
<div>
<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
<dd className="mt-1 text-sm text-slate-900">{business.address}</dd>
</div>
<div>
<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</dt>
<dd className="mt-1 text-sm text-slate-900">{formatDate(business.updatedAt)}</dd>
</div>
</dl>
<div className="mt-8">
<h2 className="text-xl font-semibold text-slate-900">Location</h2>
<div className="mt-4">
<MapPreview latitude={null} longitude={null} name={business.name} address={business.address} />
</div>
</div>
</div>
<aside>
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Contact</h2>
<ul className="mt-4 space-y-3 text-sm">
{business.phone && (
<li className="flex items-center gap-3">
<Icon name="phone" className="h-4 w-4 text-brand-600" />
<a href={`tel:${business.phone}`} className="font-medium text-brand-700">{business.phone}</a>
</li>
)}
{business.website && (
<li className="flex items-center gap-3">
<Icon name="external" className="h-4 w-4 text-brand-600" />
<a href={business.website} target="_blank" rel="noreferrer" className="break-all font-medium text-brand-700">
{business.website}
</a>
</li>
)}
{!business.phone && !business.website && (
<li className="text-slate-600">No contact details verified yet.</li>
)}
</ul>
</div>
</aside>
</div>
<div className="mt-8">
<Link href="/businesses" className="text-sm font-medium text-brand-700">← Back to businesses</Link>
</div>
</div>
</>
); }
