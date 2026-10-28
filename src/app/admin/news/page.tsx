// @ts-nocheck
import Link from "next/link";
import { listNews } from "@/services/news"; import { listContentCategories } from "@/services/content-categories"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { NewsStatusButtons } from "@/components/admin/admin-client"; import { StaffNewsForm } from "@/components/admin/staff-news-form"; import { formatDate } from "@/lib/utils"; import { BulkActions } from "@/components/admin/bulk-actions";
export const metadata = { title: "News" };
const TONE: Record<string, "success" | "amber" | "accent" | "neutral"> = {
published: "success",
pending_review: "amber",
rejected: "accent",
draft: "neutral",
archived: "neutral", };
export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
const params = await searchParams;
const [result, categories] = await Promise.all([listNews({ includeAll: true, page: 1, pageSize: 500, sort: "newest" }), listContentCategories("news")]);
const allNews = result.items;
const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
const requests = allNews.filter((article) => article.status === "pending_review");
const view = params.view === "all" ? "all" : "requests";
const news = view === "requests" ? requests : allNews;
return (
<>
<PageHeader
title="News"
description="Review, approve, publish and edit news. Submissions stay private until approved."
/>
<div className="mb-8">
<StaffNewsForm categories={categories} />
</div>
<div className="mb-4 flex flex-wrap gap-2" aria-label="News management views">
<Link href="/admin/news?view=requests" aria-current={view === "requests" ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === "requests" ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>Post requests ({requests.length})</Link>
<Link href="/admin/news?view=all" aria-current={view === "all" ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium ${view === "all" ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>All news ({allNews.length})</Link>
</div>
<BulkActions entity="news" records={news.map((article) => ({ id: article.id, label: article.title, status: article.status }))} />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Title</th>
<th className="px-4 py-3">Category</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Published</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{news.map((article) => (
<tr key={article.id}>
<td className="px-4 py-3">
<p className="font-medium text-slate-900">{article.title}</p>
{article.status === "published" && <Link href={`/news/${article.slug}`} className="text-xs text-brand-700">View live</Link>}
</td>
<td className="px-4 py-3 text-slate-600">{categoryNames.get(article.category) ?? article.category}</td>
<td className="px-4 py-3"><Badge tone={TONE[article.status] ?? "neutral"}>{article.status.replace("_", " ")}</Badge></td>
<td className="px-4 py-3 text-slate-500">{article.publishedAt ? formatDate(article.publishedAt) : "—"}</td>
<td className="px-4 py-3"><NewsStatusButtons article={article} categories={categories} /></td>
</tr>
))}
{news.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">{view === "requests" ? "There are no news requests waiting for review." : "No news posts yet."}</td></tr>}
</tbody>
</table>
</Card>
</>
); }
