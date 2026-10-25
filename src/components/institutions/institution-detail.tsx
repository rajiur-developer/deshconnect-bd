// @ts-nocheck
import Image from "next/image"; import Link from "next/link";
import type { Institution } from "@/types/content"; import { formatLocation } from "@/services/locations"; import { formatDate } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { MapPreview } from "@/components/maps/map-preview"; import { institutionCategoryLabel } from "@/components/cards/institution-card";
export async function InstitutionDetail({ institution }: { institution: Institution }) {
const locationLabel = await formatLocation(institution);
const contacts: Array<{ icon: "phone" | "mail" | "external" | "globe"; label: string; value: string; href?: string }> = [];
if (institution.phone) contacts.push({ icon: "phone", label: "Phone", value: institution.phone, href: `tel:${institution.phone}` });
if (institution.emergencyPhone) contacts.push({ icon: "phone", label: "Emergency", value: institution.emergencyPhone, href: `tel:${institution.emergencyPhone}` });
if (institution.email) contacts.push({ icon: "mail", label: "Email", value: institution.email, href: `mailto:${institution.email}` });
if (institution.website) contacts.push({ icon: "external", label: "Website", value: institution.website, href: institution.website });
return (
<div className="grid gap-8 lg:grid-cols-3">
<div className="lg:col-span-2">
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
<Image src={institution.image} alt={institution.name} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
</div>
<div className="mt-4 flex flex-wrap items-center gap-2">
<Badge tone="info">{institutionCategoryLabel(institution.category, institution.categoryName)}</Badge>
{institution.verification === "verified" && <Badge tone="success">Verified listing</Badge>}
{institution.verification !== "verified" && <Badge tone="neutral">Unverified listing</Badge>}
{institution.source?.startsWith("Mahadi Hassan (CC BY 2.0)") ? (
<a
href="https://huggingface.co/datasets/Mahadih534/all-bangladeshi-hospitals"
target="_blank"
rel="noreferrer"
className="text-xs font-medium text-brand-700 underline"
>
Source: Mahadi Hassan · CC BY 2.0
</a>
) : institution.source?.startsWith("OpenStreetMap") ? (
<a
href="https://www.openstreetmap.org/copyright"
target="_blank"
rel="noreferrer"
className="text-xs font-medium text-brand-700 underline"
>
Source: OpenStreetMap contributors · ODbL
</a>
) : institution.source ? <Badge tone="neutral">Source: {institution.source}</Badge> : null}
</div>
<h1 className="mt-3 text-3xl font-bold text-slate-900">{institution.name}</h1>
{locationLabel && (
<p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel}
</p>
)}
<div className="prose-body mt-4 text-slate-700">
{institution.description.split("\n").map((paragraph, index) => (
<p key={index}>{paragraph}</p>
))}
</div>
<dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
<div>
<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
<dd className="mt-1 text-sm text-slate-900">{institution.address}</dd>
</div>
{institution.lastCheckedAt && (
<div>
<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last verified</dt>
<dd className="mt-1 text-sm text-slate-900">{formatDate(institution.lastCheckedAt)}</dd>
</div>
)}
</dl>
<div className="mt-8">
<h2 className="text-xl font-semibold text-slate-900">Location</h2>
<p className="mt-1 text-sm text-slate-600">{institution.address}</p>
<div className="mt-4">
<MapPreview latitude={institution.latitude} longitude={institution.longitude} name={institution.name} address={institution.address} />
</div>
</div>
</div>
<aside className="space-y-6">
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Contact & info</h2>
<ul className="mt-4 space-y-3">
{contacts.length === 0 && <li className="text-sm text-slate-600">No contact details verified yet.</li>}
{contacts.map((contact, index) => (
<li key={`${contact.label}-${index}`} className="flex items-start gap-3">
<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
<Icon name={contact.icon} className="h-4 w-4" />
</span>
<div className="min-w-0">
<p className="text-xs text-slate-500">{contact.label}</p>
{contact.href ? (
<Link href={contact.href} className="break-words text-sm font-medium text-brand-700 hover:text-brand-800">
{contact.value}
</Link>
) : (
<p className="break-words text-sm font-medium text-slate-900">{contact.value}</p>
)}
</div>
</li>
))}
</ul>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Found an error?</h2>
<p className="mt-1 text-sm text-slate-600">Submit a correction, our team will review it.</p>
<Link href={`/contact?target=${encodeURIComponent(institution.name)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
Submit correction
<Icon name="arrow-right" className="h-4 w-4" />
</Link>
</div>
</aside>
</div>
); }
