import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query"; import { parsePage } from "@/lib/utils"; import { listPlaces } from "@/services/places"; import { listContentCategories } from "@/services/content-categories"; import { getDirectoryLocationOptions } from "@/services/locations"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { PlaceCard } from "@/components/cards/place-card"; import { EmptyState } from "@/components/ui/empty-state"; import { Pagination } from "@/components/ui/pagination"; import { PageBanner } from "@/components/layout/page-banner"; import { ListGrid } from "@/components/layout/list-grid"; import { Icon } from "@/components/ui/icons";
export const metadata: Metadata = { title: "Places to visit" };
export default async function PlacesPage({
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
const [{ items, meta }, options, categories] = await Promise.all([
listPlaces(query),
getDirectoryLocationOptions(),
listContentCategories("place"),
]);
return (
<>
<PageBanner
title="Places to visit"
description="Browse places to visit across Bangladesh, filtered by division, district, and upazila."
media="/images/banner/Travel.webp"
/>
<div className="container-x py-8">
<DirectoryFilters
action="/places"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={categories.map((category) => ({ value: category.value, label: category.name }))}
showCategory
current={{ divisionId, districtId, upazilaId }}
/>
<p className="mt-6 text-sm text-slate-500">
{meta.total} places found
</p>
{items.length ? (
<ListGrid className="mt-4">
{items.map((place) => (
<PlaceCard key={place.id} place={place} />
))}
</ListGrid>
) : (
<EmptyState
title="No places match your filters"
description="Clear a filter, choose another area, or try different keywords."
icon={<Icon name="map-pin" className="h-10 w-10" />}
/>
)}
<Pagination meta={meta} hrefFor={(page) => buildHref("/places", params, { page })} />
</div>
</>
); }
