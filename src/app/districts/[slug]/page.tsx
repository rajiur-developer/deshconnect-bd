import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getDivisionById, getDistrictBySlug, listUpazilas } from "@/services/locations"; import { listInstitutions } from "@/services/institutions"; import { listHospitals } from "@/services/hospitals"; import { listBusinesses } from "@/services/businesses"; import { listPlaces } from "@/services/places"; import { Icon } from "@/components/ui/icons"; import { BusinessCard } from "@/components/cards/business-card"; import { InstitutionCard } from "@/components/cards/institution-card"; import { PlaceCard } from "@/components/cards/place-card"; import { ListGrid } from "@/components/layout/list-grid";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const district = await getDistrictBySlug(slug);
if (!district) return { title: "District not found" };
const division = await getDivisionById(district.divisionId);
return {
title: `${district.name} District`,
description: district.summary,
alternates: { canonical: `/districts/${district.slug}` },
}; }
export default async function DistrictPage({ params }: Props) {
const { slug } = await params;
const district = await getDistrictBySlug(slug);
if (!district) return <EmptyRecordPage title="District guide" description="Explore local places, institutions and services across this district." media="/images/banner/Gram_place.webp" backHref="/" backLabel="Explore DeshConnect" />;
const [division, upazilas, places, institutions, hospitals, businesses] = await Promise.all([
getDivisionById(district.divisionId),
listUpazilas(district.id),
listPlaces({ districtId: district.id, page: 1 }).then((result) => result.items),
listInstitutions({ districtId: district.id, page: 1 }).then((result) => result.items),
listHospitals({ districtId: district.id, page: 1 }).then((result) => result.items),
listBusinesses({ districtId: district.id, page: 1 }).then((result) => result.items),
]);
return (
<div className="container-x py-8">
<div className="rounded-2xl border border-slate-200 bg-white p-8">
<h1 className="text-3xl font-bold text-slate-900">{district.name} District</h1>
<p className="mt-2 max-w-2xl text-slate-600">{district.summary}</p>
<p className="mt-3 text-sm text-slate-500">
{division ? `${division.name} Division` : "Bangladesh"} · {upazilas.length} upazilas
</p>
</div>
<section className="mt-10">
<h2 className="text-xl font-semibold text-slate-900">Upazilas</h2>
<div className="mt-4 flex flex-wrap gap-2">
{upazilas.map((upazila) => (
<Link
key={upazila.id}
href={`/places?upazilaId=${upazila.id}`}
className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-brand-300 hover:text-brand-700"
>
{upazila.name}
</Link>
))}
</div>
</section>
{places.length > 0 && (
<section className="mt-12">
<h2 className="text-xl font-semibold text-slate-900">Places to visit</h2>
<ListGrid className="mt-4">
{places.map((place) => (
<PlaceCard key={place.id} place={place} />
))}
</ListGrid>
</section>
)}
{institutions.length > 0 && (
<section className="mt-12">
<h2 className="text-xl font-semibold text-slate-900">Institutions</h2>
<ListGrid className="mt-4">
{institutions.map((institution) => (
<InstitutionCard key={institution.id} institution={institution} />
))}
</ListGrid>
</section>
)}
{hospitals.length > 0 && (
<section className="mt-12">
<h2 className="text-xl font-semibold text-slate-900">Hospitals & health centres</h2>
<ListGrid className="mt-4">
{hospitals.map((hospital) => (
<InstitutionCard key={hospital.id} institution={hospital} />
))}
</ListGrid>
</section>
)}
{businesses.length > 0 && (
<section className="mt-12">
<h2 className="text-xl font-semibold text-slate-900">Businesses</h2>
<ListGrid className="mt-4">
{businesses.map((business) => (
<BusinessCard key={business.id} business={business} />
))}
</ListGrid>
</section>
)}
<div className="mt-10">
<Link href={`/places?districtId=${district.id}`} className="text-sm font-medium text-brand-700">
View all records in {district.name} →
</Link>
</div>
</div>
); }
