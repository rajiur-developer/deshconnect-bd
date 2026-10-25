// @ts-nocheck
import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query"; import { parsePage } from "@/lib/utils"; import { getDirectoryLocationOptions } from "@/services/locations"; import { listHospitals } from "@/services/institutions"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { InstitutionCard } from "@/components/cards/institution-card"; import { EmptyState } from "@/components/ui/empty-state"; import { Pagination } from "@/components/ui/pagination"; import { PageBanner } from "@/components/layout/page-banner"; import { ListGrid } from "@/components/layout/list-grid"; import { Icon } from "@/components/ui/icons";
export const metadata: Metadata = { title: "Hospitals and health centres" };
export default async function HospitalsPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const divisionId = firstParam(params.divisionId);
const districtId = firstParam(params.districtId);
const upazilaId = firstParam(params.upazilaId);
const query = {
q: firstParam(params.q),
divisionId,
districtId,
upazilaId,
sort: parseSort(params.sort),
page: parsePage(firstParam(params.page)),
};
const [{ items, meta }, options] = await Promise.all([listHospitals(query), getDirectoryLocationOptions()]);
return (
<>
<PageBanner
title="Hospitals and health centres"
description="Find hospitals, clinics and health centres, with verified emergency numbers."
media="/images/banner/Hospital.webp"
/>
<div className="container-x py-8">
<DirectoryFilters
action="/hospitals"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
sortOptions={["relevance", "name", "newest"]}
current={{ divisionId, districtId, upazilaId }}
/>
<p className="mt-6 text-sm text-slate-500">{meta.total} records found</p>
{/* <p className="mt-2 text-xs text-slate-500">
Directory data adapted from{" "}
<a
  href="https://huggingface.co/datasets/Mahadih534/all-bangladeshi-hospitals"
  target="_blank"
  rel="noreferrer"
  className="font-medium text-brand-700 underline"
>
All Bangladeshi Hospitals by Mahadi Hassan
</a>{" "}
under <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline">CC BY 2.0</a>.
Listings are unverified and may be incomplete or out of date.
</p> */}
{items.length ? (
<ListGrid className="mt-4">
{items.map((institution) => (
<InstitutionCard key={institution.id} institution={institution} />
))}
</ListGrid>
) : (
<EmptyState title="No hospitals match your filters" icon={<Icon name="heart" className="h-10 w-10" />} />
)}
<Pagination meta={meta} hrefFor={(page) => buildHref("/hospitals", params, { page })} />
</div>
</>
); }
