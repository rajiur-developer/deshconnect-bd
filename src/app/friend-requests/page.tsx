import { requireUser } from "@/lib/auth/current-user"; import { listPendingRequests, listSentRequests } from "@/services/messaging"; import { listUsers } from "@/services/users"; import { formatDate } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { CancelRequestButton, RespondButtons } from "@/components/account/account-actions";
export const metadata = { title: "Friend requests", robots: { index: false, follow: false } };
export default async function FriendRequestsPage() {
const user = await requireUser("/friend-requests");
const [incoming, outgoing, users] = await Promise.all([
listPendingRequests(user.id),
listSentRequests(user.id),
listUsers(),
]);
const userById = new Map(users.map((item) => [item.id, item]));
return (
<AccountShell user={user} title="Friend requests" description="Accept or decline incoming requests, or cancel your own.">
<div className="space-y-8">
<section>
<h2 className="text-lg font-semibold text-slate-900">Received ({incoming.length})</h2>
{incoming.length === 0 ? (
<p className="mt-2 text-sm text-slate-600">No pending requests.</p>
) : (
<div className="mt-3 space-y-3">
{incoming.map((connection) => {
const sender = userById.get(connection.requesterId);
return (
<Card key={connection.id} className="flex items-center justify-between p-4">
<div>
<p className="font-medium text-slate-900">{sender?.fullName ?? "Unknown user"}</p>
<p className="text-xs text-slate-500">@{sender?.username} · {formatDate(connection.createdAt)}</p>
</div>
<RespondButtons connectionId={connection.id} />
</Card>
);
})}
</div>
)}
</section>
<section>
<h2 className="text-lg font-semibold text-slate-900">Sent ({outgoing.length})</h2>
{outgoing.length === 0 ? (
<EmptyState title="No sent requests" icon={<Icon name="users" className="h-8 w-8" />} />
) : (
<div className="mt-3 space-y-3">
{outgoing.map((connection) => {
const target = userById.get(connection.addresseeId);
return (
<Card key={connection.id} className="flex items-center justify-between p-4">
<div>
<p className="font-medium text-slate-900">{target?.fullName ?? "Unknown user"}</p>
<p className="text-xs text-slate-500">@{target?.username} · {formatDate(connection.createdAt)}</p>
</div>
<CancelRequestButton connectionId={connection.id} />
</Card>
);
})}
</div>
)}
</section>
</div>
</AccountShell>
); }
