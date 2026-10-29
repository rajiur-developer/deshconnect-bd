import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import type { Metadata } from "next";
import { CommunityPostImage } from "@/components/community/community-post-image";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { getPostById, listComments } from "@/services/community"; import { listUsers } from "@/services/users"; import { getCurrentUser } from "@/lib/auth/current-user"; import { can } from "@/lib/auth/permissions"; import { relativeTime } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { CommentForm } from "@/components/community/community-forms"; import { DeletePostButton, ReactionButton } from "@/components/community/community-actions"; import { ReportButton } from "@/components/community/report-button";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { id } = await params;
const post = await getPostById(id);
if (!post) return { title: "Post not found" };
return { title: post.body.slice(0, 60), description: post.body.slice(0, 160) }; }
export default async function CommunityPostPage({ params }: Props) {
const { id } = await params;
const [post, user] = await Promise.all([getPostById(id), getCurrentUser()]);
if (!post) return <EmptyRecordPage title="Community discussion" description="Join conversations and community activity across Bangladesh." media="/images/banner/News.webp" backHref="/community" backLabel="Browse community" />;
const comments = await listComments(post.id);
const users = await listUsers({ ids: [post.authorId, ...comments.map((comment) => comment.authorId)] });
const authorById = new Map(users.map((item) => [item.id, item]));
const canModerate = user ? can(user.role, "moderation:posts") : false;
const isOwner = user?.id === post.authorId;
return (
<div className="page-theme" data-page-theme="community"><div className="bg-gradient-to-b from-brand-50/80 via-slate-50 to-white"><div className="container-x py-8 sm:py-10">
<div className="grid gap-8 lg:grid-cols-3">
<article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 sm:p-8 lg:col-span-2">
<div className="flex items-center gap-3">
<ProfileAvatar name={authorById.get(post.authorId)?.fullName ?? "Community member"} src={authorById.get(post.authorId)?.avatar} storageKey={authorById.get(post.authorId)?.avatarKey} className="h-11 w-11 text-sm" textClassName="text-sm" />
<div>
<p className="font-semibold text-slate-900">{authorById.get(post.authorId)?.fullName ?? "Community member"}</p>
<p className="text-xs text-slate-500">{relativeTime(post.createdAt)}</p>
</div>
{post.status === "pending" && <Badge tone="amber">Pending review</Badge>}
</div>
<p className="mt-4 whitespace-pre-line text-lg text-slate-800">{post.body}</p>
{post.image && (
<CommunityPostImage src={post.image} storageKey={post.imageKey} className="mt-5" />
)}
<div className="mt-5 flex items-center gap-3">
{user ? <ReactionButton postId={post.id} initialCount={post.reactions} /> : null}
{user && !isOwner ? <ReportButton targetType="post" targetId={post.id} /> : null}
{isOwner || canModerate ? <DeletePostButton postId={post.id} /> : null}
</div>
</article>
<aside className="space-y-5">
<div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
<h2 className="font-semibold text-slate-900">Comments ({comments.length})</h2>
<div className="mt-4 space-y-4">
{comments.length === 0 && <p className="text-sm text-slate-600">No comments yet.</p>}
{comments.map((comment) => (
<div key={comment.id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
<p className="text-sm font-medium text-slate-900">{authorById.get(comment.authorId)?.fullName ?? "Member"}</p>
<p className="text-xs text-slate-500">{relativeTime(comment.createdAt)}</p>
<p className="mt-1 text-sm text-slate-700">{comment.body}</p>
{user ? <ReportButton targetType="comment" targetId={comment.id} /> : null}
</div>
))}
</div>
</div>
{user && <CommentForm postId={post.id} />}
</aside>
</div>
<div className="mt-8">
<Link href="/community" className="text-sm font-medium text-brand-700">← Back to community</Link>
</div>
</div></div></div>
); }
