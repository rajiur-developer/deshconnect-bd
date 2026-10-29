import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listPosts } from "@/services/community"; import { relativeTime } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { DeletePostButton } from "@/components/community/community-actions";
export const metadata = { title: "My posts", robots: { index: false, follow: false } };
const STATUS_TONE: Record<string, "success" | "amber" | "neutral" | "accent"> = {
visible: "success",
pending: "amber",
hidden: "neutral",
deleted: "accent", };
export default async function MyPostsPage() {
const user = await requireUser("/my-posts");
const result = await listPosts({ authorId: user.id, includeNonPublic: true });
return (
<AccountShell user={user} title="My posts" description="Manage your published posts.">
{result.items.length === 0 ? (
<EmptyState
title="No posts yet"
description="Share something with the community, it will appear here."
action={<Link href="/community" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Go to community</Link>}
icon={<Icon name="message" className="h-10 w-10" />}
/>
) : (
<div className="space-y-3">
{result.items.map((post) => (
<Card key={post.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<div className="flex items-center gap-2">
<Badge tone={STATUS_TONE[post.status] ?? "neutral"}>
{post.status}
</Badge>
<span className="text-xs text-slate-500">{relativeTime(post.createdAt)}</span>
</div>
<p className="mt-2 text-slate-800 line-clamp-3">{post.body}</p>
</div>
<div className="flex shrink-0 flex-col items-end gap-2">
<Link href={`/community/${post.id}`} className="text-sm font-medium text-brand-700">View</Link>
{post.status !== "deleted" && <DeletePostButton postId={post.id} />}
</div>
</div>
</Card>
))}
</div>
)}
</AccountShell>
); }
