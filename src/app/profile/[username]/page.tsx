import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import type { Metadata } from "next";
import { listConnections } from "@/services/users";
import { listIncomingRequests } from "@/services/messaging";
import { RespondButtons } from "@/components/account/account-actions";
import { getUserByUsername } from "@/services/users"; import { listPosts } from "@/services/community"; import { listSentRequests } from "@/services/messaging"; import { formatLocation } from "@/services/locations"; import { formatDate, relativeTime } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { ConnectButton, StartConversationButton } from "@/components/account/account-actions"; import { ProfileModerationControls } from "@/components/account/profile-moderation"; import { getCurrentUser } from "@/lib/auth/current-user"; import { ProfileAvatar } from "@/components/ui/profile-avatar"; import { cookies } from "next/headers"; import { createServerClient } from "@insforge/sdk/ssr"; import { PROFILE_IMAGE_BUCKET } from "@/features/account/constants";
type Props = { params: Promise<{ username: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { username } = await params;
const profile = await getUserByUsername(username);
if (!profile) return { title: "Profile not found" };
return { title: profile.fullName, description: profile.bio ?? undefined, alternates: { canonical: `/profile/${profile.username}` } }; }
export default async function PublicProfilePage({ params }: Props) {
const { username } = await params;
const profile = await getUserByUsername(username);
if (!profile) return <EmptyRecordPage title="Community profile" description="Connect with people and discover community activity." media="/images/banner/Collage.webp" backHref="/community" backLabel="Browse community" />;
let profileAvatar = profile.avatar;
if (profile.avatarKey) {
const client = createServerClient({ cookies: await cookies() });
const { data } = await client.storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(profile.avatarKey, 3600);
profileAvatar = data?.signedUrl ?? profileAvatar;
}
const viewer = await getCurrentUser();
const [locationLabel, posts, outgoingRequests] = await Promise.all([
formatLocation(profile),
listPosts({ authorId: profile.id }).then((result) => result.items),
viewer ? listSentRequests(viewer.id) : Promise.resolve([]),
]);
const [acceptedConnections, incomingRequests] = viewer ? await Promise.all([listConnections(viewer.id), listIncomingRequests(viewer.id)]) : [[], []];
const isSelf = viewer?.id === profile.id;
const pendingConnection = outgoingRequests.find((connection) => connection.addresseeId === profile.id);
const incomingConnection = incomingRequests.find((connection) => connection.requesterId === profile.id);
const isConnected = acceptedConnections.some((connection) => connection.id === profile.id);
return (
<div className="container-x py-8">
<div className="grid gap-8 lg:grid-cols-3">
<Card className="p-6">
<div className="flex items-center gap-4">
<ProfileAvatar name={profile.fullName} src={profileAvatar} storageKey={profile.avatarKey} className="h-16 w-16 text-xl" textClassName="text-xl" />
<div>
<h1 className="text-xl font-semibold text-slate-900">{profile.fullName}</h1>
<p className="text-sm text-slate-500">@{profile.username}</p>
<Badge tone="brand" className="mt-1">{profile.role}</Badge>
</div>
</div>
{profile.bio && <p className="mt-4 text-slate-700">{profile.bio}</p>}
<dl className="mt-6 space-y-3 text-sm">
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
<dd className="mt-1 flex items-center gap-1 text-slate-900">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel ?? "Not set"}
</dd>
</div>
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Member since</dt>
<dd className="mt-1 text-slate-900">{formatDate(profile.createdAt)}</dd>
</div>
</dl>
{!isSelf && viewer && (
<div className="mt-6 flex gap-2">
{isConnected ? <StartConversationButton username={profile.username} /> : incomingConnection ? <RespondButtons connectionId={incomingConnection.id} /> : <ConnectButton username={profile.username} pendingConnectionId={pendingConnection?.id} />}
</div>
)}
</Card>
<div className="lg:col-span-2">
<h2 className="text-lg font-semibold text-slate-900">Public posts</h2>
<div className="mt-3 space-y-3">
{posts.length === 0 && <p className="text-sm text-slate-600">No public posts yet.</p>}
{posts.map((post) => (
<Link key={post.id} href={`/community/${post.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-300">
<p className="text-sm text-slate-800 line-clamp-3">{post.body}</p>
<p className="mt-2 flex items-center gap-3 text-xs text-slate-500">
<span className="flex items-center gap-1"><Icon name="heart" className="h-3.5 w-3.5" /> {post.reactions}</span>
<span>{relativeTime(post.createdAt)}</span>
</p>
</Link>
))}
</div>
</div>
</div>
{!isSelf && viewer && (
<div className="mt-6">
<ProfileModerationControls
target={{ id: profile.id, username: profile.username, role: profile.role, status: profile.status }}
viewerRole={viewer.role}
/>
</div>
)}
</div>
); }
