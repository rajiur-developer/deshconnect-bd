import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query"; import { parsePage } from "@/lib/utils"; import { getDirectoryLocationOptions } from "@/services/locations"; import { listBusinesses } from "@/services/businesses"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { BusinessCard } from "@/components/cards/business-card"; import { EmptyState } from "@/components/ui/empty-state"; import { Pagination } from "@/components/ui/pagination"; import { PageBanner } from "@/components/layout/page-banner"; import { ListGrid } from "@/components/layout/list-grid"; import { Icon } from "@/components/ui/icons";
const CATEGORIES = [
{ value: "hotel", label: "Hotel" },
{ value: "restaurant", label: "Restaurant" },
{ value: "transport", label: "Transport" },
{ value: "shop", label: "Shop" },
{ value: "service", label: "Service" },
{ value: "other", label: "Other" }, ];
export const metadata: Metadata = { title: "Businesses" };
export default async function BusinessesPage({
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
const [{ items, meta }, options] = await Promise.all([listBusinesses(query), getDirectoryLocationOptions()]);
return (
<>
<PageBanner
title="Businesses"
description="Hotels, restaurants, transport, shops and local services."
media="/images/banner/Busenees.webp"
/>
<div className="container-x py-8">
<DirectoryFilters
action="/businesses"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={CATEGORIES}
showCategory
current={{ divisionId, districtId, upazilaId }}
/>
<p className="mt-6 text-sm text-slate-500">{meta.total} businesses found</p>
{items.length ? (
<ListGrid className="mt-4">
{items.map((business) => (
<BusinessCard key={business.id} business={business} />
))}
</ListGrid>
) : (
<EmptyState title="No businesses match your filters" icon={<Icon name="store" className="h-10 w-10" />} />
)}
<Pagination meta={meta} hrefFor={(page) => buildHref("/businesses", params, { page })} />
</div>
</>
); }
