import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getNewsBySlug } from "@/services/news"; import { listUsers } from "@/services/users"; import { formatDate } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { RecordImage } from "@/components/ui/record-image"; import { newsCategoryLabelBn } from "@/components/cards/news-card";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const article = await getNewsBySlug(slug);
if (!article) return { title: "News not found" };
return {
title: article.title,
description: article.excerpt,
alternates: { canonical: `/news/${article.slug}` },
openGraph: { title: article.title, description: article.excerpt, images: [article.image], type: "article" },
}; }
export default async function NewsDetailPage({ params }: Props) {
const { slug } = await params;
const article = await getNewsBySlug(slug);
if (!article) return <EmptyRecordPage title="News and stories" description="Read news, updates and stories from the DeshConnect community." media="/images/banner/News.webp" backHref="/news" backLabel="Browse news" />;
const users = await listUsers();
const author = users.find((user) => user.id === article.authorId);
const jsonLd = {
"@context": "https://schema.org",
"@type": "NewsArticle",
headline: article.title,
description: article.excerpt,
image: article.image,
datePublished: article.publishedAt ?? article.createdAt,
author: author ? { "@type": "Person", name: author.fullName } : undefined,
...(article.source ? { publisher: { "@type": "Organization", name: article.source } } : {}),
};
return (
<>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
<div className="container-x py-8">
<div className="mx-auto max-w-3xl">
<Badge tone="brand">{article.categoryName ?? article.category}</Badge>
<h1 className="mt-3 text-3xl font-bold text-slate-900">{article.title}</h1>
<div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
<span className="flex items-center gap-1">
<Icon name="users" className="h-4 w-4 text-slate-400" />
{author?.fullName ?? "Staff"}
</span>
<span className="flex items-center gap-1">
<Icon name="calendar" className="h-4 w-4 text-slate-400" />
{formatDate(article.publishedAt ?? article.createdAt)}
</span>
{article.source && <span className="text-slate-500">Source: {article.source}</span>}
</div>
<div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
<RecordImage src={article.image} alt={article.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
</div>
<p className="mt-6 text-lg font-medium text-slate-800">{article.excerpt}</p>
<div className="prose-body mt-4 text-slate-700">
{article.body.split("\n").map((paragraph, index) => (
<p key={index}>{paragraph}</p>
))}
</div>
<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
<p>
This article was published on {formatDate(article.publishedAt ?? article.createdAt)}. DeshConnect does
not guarantee the accuracy of third-party reporting.
</p>
</div>
</div>
<div className="mx-auto mt-8 max-w-3xl">
<Link href="/news" className="text-sm font-medium text-brand-700">← Back to news</Link>
</div>
</div>
</>
); }
