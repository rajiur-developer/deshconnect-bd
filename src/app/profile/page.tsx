import Link from "next/link"; import { requireUser } from "@/lib/auth/current-user"; import { getUserById } from "@/services/users"; import { formatLocation } from "@/services/locations"; import { formatDate } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { ProfileAvatar } from "@/components/ui/profile-avatar";
export const metadata = { title: "My profile", robots: { index: false, follow: false } };
export default async function ProfilePage() {
const user = await requireUser("/profile");
const full = await getUserById(user.id);
const locationLabel = await formatLocation(user);
return (
<AccountShell user={user} title="My profile" description="Information on your public profile.">
<Card className="p-6">
<div className="flex items-center gap-4">
<ProfileAvatar name={user.fullName} src={user.avatar} storageKey={user.avatarKey} className="h-16 w-16 text-xl" textClassName="text-xl" />
<div>
<h2 className="text-xl font-semibold text-slate-900">{user.fullName}</h2>
<p className="text-sm text-slate-500">@{user.username}</p>
<div className="mt-1 flex gap-2">
<Badge tone="brand">{user.role}</Badge>
{full?.emailVerified && <Badge tone="success">Email verified</Badge>}
</div>
</div>
</div>
{user.bio && <p className="mt-4 text-slate-700">{user.bio}</p>}
<dl className="mt-6 grid gap-4 sm:grid-cols-2">
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
<dd className="mt-1 flex items-center gap-1 text-sm text-slate-900">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel ?? "Not set"}
</dd>
</div>
<div>
<dt className="text-xs uppercase tracking-wide text-slate-500">Member since</dt>
<dd className="mt-1 text-sm text-slate-900">{formatDate(user.createdAt)}</dd>
</div>
</dl>
<div className="mt-6">
<Link href="/profile/edit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
Edit profile
</Link>
</div>
</Card>
</AccountShell>
); }
