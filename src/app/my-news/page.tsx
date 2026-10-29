import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listNews } from "@/services/news"; import { listContentCategories } from "@/services/content-categories"; import { formatDate } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { NewsSubmitForm } from "@/components/news/news-forms"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons";
const STATUS_TONE: Record<string, "success" | "accent" | "amber" | "neutral"> = {
published: "success",
pending_review: "amber",
rejected: "accent",
draft: "neutral",
archived: "neutral", };
export const metadata = { title: "My news", robots: { index: false, follow: false } };
export default async function MyNewsPage() {
const user = await requireUser("/my-news");
const [result, categories] = await Promise.all([listNews({ authorId: user.id, includeAll: true, page: 1 }), listContentCategories("news")]);
return (
<>
<PageHeader
title="My news"
description="Submit articles and track their review status. New submissions remain personal until approved."
/>
<div className="container-x grid gap-8 py-8 lg:grid-cols-3">
<div className="space-y-4 lg:col-span-2">
{result.items.length === 0 ? (
<EmptyState
title="No submissions yet"
description="Submit your first article, its review status will be shown here."
icon={<Icon name="globe" className="h-10 w-10" />}
/>
) : (
result.items.map((article) => (
<article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-5">
<div className="flex items-start justify-between gap-3">
<div>
<Badge tone="brand">{article.categoryName ?? article.category}</Badge>
<h2 className="mt-2 font-semibold text-slate-900">{article.title}</h2>
<p className="mt-1 text-xs text-slate-500">
Submitted {formatDate(article.createdAt)}
{article.publishedAt ? ` · Published ${formatDate(article.publishedAt)}` : ""}
</p>
</div>
<Badge tone={STATUS_TONE[article.status] ?? "neutral"}>
{article.status}
</Badge>
</div>
<p className="mt-2 line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
{article.status === "published" && (
<Link href={`/news/${article.slug}`} className="mt-3 inline-block text-sm font-medium text-brand-700">
View published article →
</Link>
)}
</article>
))
)}
</div>
<aside>
<NewsSubmitForm userId={user.id} categories={categories} />
</aside>
</div>
</>
); }
