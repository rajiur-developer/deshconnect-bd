import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listNotifications } from "@/services/notifications"; import { relativeTime } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { MarkAllReadButton, MarkReadButton } from "@/components/account/account-actions";
export const metadata = { title: "Notifications", robots: { index: false, follow: false } };
export default async function NotificationsPage() {
const user = await requireUser("/notifications");
const notifications = await listNotifications(user.id);
const unread = notifications.filter((notification) => !notification.read).length;
return (
<AccountShell
user={user}
title="Notifications"
description={unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "All read."}
>
{notifications.length === 0 ? (
<EmptyState title="No notifications" icon={<Icon name="bell" className="h-10 w-10" />} />
) : (
<>
<div className="mb-4 flex justify-end">
<MarkAllReadButton />
</div>
<div className="space-y-3">
{notifications.map((notification) => (
<Card key={notification.id} className={`p-4 ${notification.read ? "" : "border-brand-300 bg-brand-50/40"}`}>
<div className="flex items-start justify-between gap-3">
<div className="flex items-start gap-3">
<Icon name="bell" className="mt-0.5 h-4 w-4 text-brand-600" />
<div>
<p className="text-sm font-semibold text-slate-900">{notification.title}</p>
<p className="text-sm text-slate-600">{notification.body}</p>
<p className="mt-1 text-xs text-slate-500">{relativeTime(notification.createdAt)}</p>
{notification.href && (
<Link href={notification.href} className="mt-1 inline-block text-sm font-medium text-brand-700">
Open →
</Link>
)}
</div>
</div>
{!notification.read && <MarkReadButton id={notification.id} />}
</div>
</Card>
))}
</div>
</>
)}
</AccountShell>
); }
