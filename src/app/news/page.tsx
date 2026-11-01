import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query"; import { parsePage } from "@/lib/utils"; import { listNews } from "@/services/news"; import { listContentCategories } from "@/services/content-categories"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { NewsCard } from "@/components/cards/news-card"; import { EmptyState } from "@/components/ui/empty-state"; import { Pagination } from "@/components/ui/pagination"; import { PageBanner } from "@/components/layout/page-banner"; import { Icon } from "@/components/ui/icons"; import { getDirectoryLocationOptions } from "@/services/locations";
export const metadata: Metadata = { title: "News" };
export default async function NewsPage({
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
const [result, options, categories] = await Promise.all([listNews(query), getDirectoryLocationOptions(), listContentCategories("news")]);
return (
<>
<PageBanner
title="News"
description="Approved and published news from across Bangladesh."
media="/images/banner/News.webp"
/>
<div className="container-x py-8">
<DirectoryFilters
action="/news"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={categories.map((category) => ({ value: category.value, label: category.name }))}
showCategory
icon="globe"
title="Filter news"
current={{ divisionId, districtId, upazilaId }}
/>
<p className="mt-6 text-sm text-slate-500">{result.meta.total} news</p>
{result.items.length ? (
<div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
{result.items.map((item) => (
<NewsCard key={item.id} news={item} />
))}
</div>
) : (
<EmptyState title="No news found" icon={<Icon name="globe" className="h-10 w-10" />} />
)}
<Pagination meta={result.meta} hrefFor={(page) => buildHref("/news", params, { page })} />
</div>
</>
); }
