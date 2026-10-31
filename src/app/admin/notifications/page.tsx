import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { listAdminUsers } from "@/services/users"; import { Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { relativeTime } from "@/lib/utils"; import Link from "next/link";
export const metadata = { title: "Notifications" };
export default async function AdminNotificationsPage() {
const [{ data }, users] = await Promise.all([insforgeSelectMany("notifications", { order: "created_at.desc", limit: "500" }), listAdminUsers()]);
const notifications = mapDbRow(data || []);
const userById = new Map(users.map((user) => [user.id, user]));
return (
<>
<PageHeader title="Notifications" description="Platform notifications sent to members." />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">User</th>
<th className="px-4 py-3">Title</th>
<th className="px-4 py-3">Read</th>
<th className="px-4 py-3">When</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{notifications.map((notification) => (
<tr key={notification.id}>
<td className="px-4 py-3 text-slate-600">{userById.get(notification.userId)?.fullName ?? notification.userId}</td>
<td className="px-4 py-3">
<p className="font-medium text-slate-900">{notification.title}</p>
<p className="text-xs text-slate-500">{notification.body}</p>
{notification.href && <Link href={notification.href} className="mt-1 inline-block text-xs font-medium text-brand-700 underline">Open request</Link>}
</td>
<td className="px-4 py-3 text-slate-600">{notification.read ? "Read" : "Unread"}</td>
<td className="px-4 py-3 text-slate-500">{relativeTime(notification.createdAt)}</td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
