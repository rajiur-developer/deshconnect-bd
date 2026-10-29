import Link from "next/link";
import { listDivisions, listDistricts, listUpazilas } from "@/services/locations"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { LocationAddForm } from "@/components/admin/location-form";
export const metadata = { title: "Locations" };
export default async function AdminLocationsPage() {
const [divisions, districts, upazilas] = await Promise.all([listDivisions(), listDistricts(), listUpazilas()]);
const divisionOptions = divisions.map((division) => ({ id: division.id, name: division.name }));
const districtOptions = districts.map((district) => ({
id: district.id,
name: district.name,
divisionId: district.divisionId,
}));
return (
<>
<PageHeader
title="Locations"
description="Manage divisions, districts, upazilas and unions. Data is stored centrally and drives dependent filters."
/>
<div className="mb-8">
<LocationAddForm divisions={divisionOptions} districts={districtOptions} />
</div>
<div className="space-y-6">
<Card className="p-5">
<div className="flex items-center justify-between">
<h2 className="font-semibold text-slate-900">Divisions</h2>
<Badge tone="brand">{divisions.length}</Badge>
</div>
<ul className="mt-3 divide-y divide-slate-100">
{divisions.map((division) => {
const divisionDistricts = districts.filter((item) => item.divisionId === division.id);
const divisionUpazilas = upazilas.filter((item) => divisionDistricts.some((district) => district.id === item.districtId));
return (
<li key={division.id} className="flex items-center justify-between py-3">
<div>
<p className="font-medium text-slate-900">{division.name}</p>
<p className="text-xs text-slate-500">Capital {division.capital}</p>
</div>
<div className="flex gap-2">
<Badge tone="neutral">{divisionDistricts.length} districts</Badge>
<Badge tone="neutral">{divisionUpazilas.length} upazilas</Badge>
<Link href={`/divisions/${division.slug}`} className="text-xs font-medium text-brand-700">View</Link>
</div>
</li>
);
})}
</ul>
</Card>
<div className="grid gap-4 sm:grid-cols-3">
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">{districts.length}</p>
<p className="text-sm text-slate-600">Districts</p>
</Card>
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">{upazilas.length}</p>
<p className="text-sm text-slate-600">Upazilas</p>
</Card>
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">0</p>
<p className="text-sm text-slate-600">Unions</p>
</Card>
</div>
</div>
</>
); }
