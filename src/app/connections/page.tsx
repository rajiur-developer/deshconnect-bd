import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listConnections } from "@/services/users"; import { formatDate } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { StartConversationButton } from "@/components/account/account-actions";
export const metadata = { title: "Connections", robots: { index: false, follow: false } };
export default async function ConnectionsPage() {
const user = await requireUser("/connections");
const connections = await listConnections(user.id);
return (
<AccountShell user={user} title="Connections" description="People connected with you.">
{connections.length === 0 ? (
<EmptyState
title="No connections yet"
description="Visit an open profile and send a connection request."
icon={<Icon name="users" className="h-10 w-10" />}
/>
) : (
<div className="grid gap-3 sm:grid-cols-2">
{connections.map((connection) => (
<Card key={connection.id} className="p-5">
<div className="flex items-center gap-3">
<span className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
{connection.fullName.slice(0, 2).toUpperCase()}
</span>
<div className="min-w-0">
<Link href={`/profile/${connection.username}`} className="font-medium text-slate-900 hover:text-brand-700">
{connection.fullName}
</Link>
<p className="truncate text-xs text-slate-500">@{connection.username} · Joined {formatDate(connection.createdAt)}</p>
</div>
</div>
<div className="mt-4">
<StartConversationButton username={connection.username} />
</div>
</Card>
))}
</div>
)}
</AccountShell>
); }
