import Link from "next/link";
import type { Metadata } from "next";
import { firstParam } from "@/lib/query"; import { globalSearch } from "@/services/search"; import { BusinessCard } from "@/components/cards/business-card"; import { InstitutionCard } from "@/components/cards/institution-card"; import { NewsCard } from "@/components/cards/news-card"; import { PlaceCard } from "@/components/cards/place-card"; import { ServiceCard } from "@/components/cards/service-card"; import { EmptyState } from "@/components/ui/empty-state"; import { PageHeader } from "@/components/layout/page-header"; import { ListGrid } from "@/components/layout/list-grid"; import { Icon } from "@/components/ui/icons";
export const metadata: Metadata = { title: "Search" };
export default async function SearchPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const q = firstParam(params.q) ?? "";
const results = await globalSearch(q, 6);
const total =
results.places.length +
results.institutions.length +
results.businesses.length +
results.governmentServices.length +
results.news.length;
return (
<>
<PageHeader
title={q ? `Results for “${q}”` : "Search"}
description="Results across places, institutions, businesses, services and news."
/>
<div className="container-x py-8">
{!q ? (
<EmptyState title="Start typing to search" description="Enter a keyword in the search box above." icon={<Icon name="search" className="h-10 w-10" />} />
) : total === 0 ? (
<EmptyState
title={`No results for “${q}”`}
description="Try different keywords or browse the directory."
action={<Link href="/places" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Visit places</Link>}
/>
) : (
<>
{results.places.length > 0 && (
<section className="mb-10">
<h2 className="text-xl font-semibold text-slate-900">Places to visit</h2>
<ListGrid className="mt-4">
{results.places.map((item) => (
<PlaceCard key={item.id} place={item} />
))}
</ListGrid>
</section>
)}
{results.institutions.length > 0 && (
<section className="mb-10">
<h2 className="text-xl font-semibold text-slate-900">Institutions</h2>
<ListGrid className="mt-4">
{results.institutions.map((item) => (
<InstitutionCard key={item.id} institution={item} />
))}
</ListGrid>
</section>
)}
{results.businesses.length > 0 && (
<section className="mb-10">
<h2 className="text-xl font-semibold text-slate-900">Businesses</h2>
<ListGrid className="mt-4">
{results.businesses.map((item) => (
<BusinessCard key={item.id} business={item} />
))}
</ListGrid>
</section>
)}
{results.governmentServices.length > 0 && (
<section className="mb-10">
<h2 className="text-xl font-semibold text-slate-900">Government services</h2>
<ListGrid className="mt-4">
{results.governmentServices.map((item) => (
<ServiceCard key={item.id} service={item} />
))}
</ListGrid>
</section>
)}
{results.news.length > 0 && (
<section className="mb-10">
<h2 className="text-xl font-semibold text-slate-900">News</h2>
<ListGrid className="mt-4">
{results.news.map((item) => (
<NewsCard key={item.id} news={item} />
))}
</ListGrid>
</section>
)}
</>
)}
</div>
</>
); }
