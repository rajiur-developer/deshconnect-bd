import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query"; import { parsePage } from "@/lib/utils"; import { getDirectoryLocationOptions } from "@/services/locations"; import { listGovernmentServices } from "@/services/government-services"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { ServiceCard } from "@/components/cards/service-card"; import { EmptyState } from "@/components/ui/empty-state"; import { Pagination } from "@/components/ui/pagination"; import { PageBanner } from "@/components/layout/page-banner"; import { ListGrid } from "@/components/layout/list-grid"; import { Icon } from "@/components/ui/icons";
const CATEGORIES = [
{ value: "identity", label: "Identity" },
{ value: "land", label: "Land" },
{ value: "health", label: "Health" },
{ value: "education", label: "Education" },
{ value: "transport", label: "Transport" },
{ value: "tax", label: "Tax" },
{ value: "other", label: "Other" }, ];
export const metadata: Metadata = { title: "Government services" };
export default async function GovernmentServicesPage({
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
category: firstParam(params.category),
sort: parseSort(params.sort),
page: parsePage(firstParam(params.page)),
};
const [{ items, meta }, options] = await Promise.all([listGovernmentServices(query), getDirectoryLocationOptions()]);
return (
<>
<PageBanner
title="Government services"
description="Government offices, required documents and opening hours."
media="/images/banner/Gram_place.webp"
/>
<div className="container-x py-8">
<DirectoryFilters
action="/government-services"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={CATEGORIES}
showCategory
current={{ divisionId, districtId, upazilaId }}
/>
<p className="mt-6 text-sm text-slate-500">{meta.total} services found</p>
{items.length ? (
<ListGrid className="mt-4">
{items.map((service) => (
<ServiceCard key={service.id} service={service} />
))}
</ListGrid>
) : (
<EmptyState title="No services match your filters" icon={<Icon name="landmark" className="h-10 w-10" />} />
)}
<Pagination meta={meta} hrefFor={(page) => buildHref("/government-services", params, { page })} />
</div>
</>
); }
