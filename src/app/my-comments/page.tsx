import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listUserComments, getPostById } from "@/services/community"; import { relativeTime } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons";
export const metadata = { title: "My comments", robots: { index: false, follow: false } };
export default async function MyCommentsPage() {
const user = await requireUser("/my-comments");
const comments = await listUserComments(user.id);
const posts = await Promise.all([...new Set(comments.map((comment) => comment.postId))].map((id) => getPostById(id).catch(() => null)));
const postById = new Map(posts.filter(Boolean).map((post) => [post.id, post]));
return (
<AccountShell user={user} title="My comments" description="Your comments on community posts.">
{comments.length === 0 ? (
<EmptyState title="No comments yet" icon={<Icon name="edit" className="h-10 w-10" />} />
) : (
<div className="space-y-3">
{comments.map((comment) => {
const post = postById.get(comment.postId);
return (
<Card key={comment.id} className="p-5">
<p className="text-slate-800">{comment.body}</p>
<div className="mt-2 flex items-center justify-between text-xs text-slate-500">
<span>{relativeTime(comment.createdAt)}</span>
{post ? (
<Link href={`/community/${post.id}`} className="font-medium text-brand-700">View post →</Link>
) : (
<span>Original post removed</span>
)}
</div>
</Card>
);
})}
</div>
)}
</AccountShell>
); }
