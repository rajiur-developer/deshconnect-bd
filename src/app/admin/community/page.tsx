// @ts-nocheck
import Link from "next/link";
import { listPosts } from "@/services/community"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { ModeratePostButtons } from "@/components/community/community-actions"; import { relativeTime } from "@/lib/utils"; import { BulkActions } from "@/components/admin/bulk-actions";
export const metadata = { title: "Community Moderation" };
const TONE: Record<string, "success" | "amber" | "neutral" | "accent"> = {
visible: "success",
pending: "amber",
hidden: "neutral",
deleted: "accent", };
export default async function AdminCommunityPage() {
const { items: posts } = await listPosts({ includeNonPublic: true, page: 1, pageSize: 100 });
return (
<>
<PageHeader title="Community Moderation" description="Review posts and take action on rule violations." />
<BulkActions entity="post" records={posts.map((post) => ({ id: post.id, label: post.body.slice(0, 100) || "Community post", status: post.status }))} />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Post</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Posted</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{posts.map((post) => (
<tr key={post.id}>
<td className="max-w-md px-4 py-3">
<p className="line-clamp-2 text-slate-800">{post.body}</p>
<Link href={`/community/${post.id}`} className="text-xs text-brand-700">View post</Link>
</td>
<td className="px-4 py-3"><Badge tone={TONE[post.status] ?? "neutral"}>{post.status}</Badge></td>
<td className="px-4 py-3 text-slate-500">{relativeTime(post.createdAt)}</td>
<td className="px-4 py-3"><ModeratePostButtons postId={post.id} status={post.status} /></td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
