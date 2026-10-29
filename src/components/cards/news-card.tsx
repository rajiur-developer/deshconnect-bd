import Link from "next/link";
import type { News } from "@/types/content"; import { formatDate } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { RecordImage } from "@/components/ui/record-image";
const NEWS_LABELS: Record<string, string> = {
national: "National",
district: "District",
health: "Health",
education: "Education",
sports: "Sports",
community: "Community", };
/** English labels — kept for the admin directory table. */ export function newsCategoryLabel(category: string): string {
return NEWS_LABELS[category] ?? category; }
/** Bengali labels for public-facing cards and filters. */ export function newsCategoryLabelBn(category: string): string {
return NEWS_LABELS[category] ?? category; }
export function NewsCard({ news }: { news: News }) {
return (
<Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-brand-300 hover:shadow-xl">
<div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
<RecordImage
src={news.image}
alt={news.title}
fill
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
/>
<div className="absolute left-3 top-3">
<Badge tone="brand">{news.categoryName ?? newsCategoryLabelBn(news.category)}</Badge>
</div>
</div>
<div className="flex flex-1 flex-col p-4">
<p className="text-xs text-slate-500">{formatDate(news.publishedAt ?? news.createdAt)}</p>
<h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-brand-700">
<Link href={`/news/${news.slug}`}>{news.title}</Link>
</h3>
<p className="mt-2 line-clamp-3 text-sm text-slate-600">{news.excerpt}</p>
<div className="mt-auto pt-4">
<Link
href={`/news/${news.slug}`}
className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
>
Read news
</Link>
</div>
</div>
</Card>
); }
