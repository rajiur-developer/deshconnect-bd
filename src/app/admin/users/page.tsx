import { listAdminUsers } from "@/services/users"; import { formatDate } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { UserActions } from "@/components/admin/user-form"; import { getCurrentUser } from "@/lib/auth/current-user";
export const metadata = { title: "Users" };
export default async function AdminUsersPage() {
const users = await listAdminUsers();
const isAdmin = (await getCurrentUser())?.role === "admin";
return (
<>
<PageHeader title="Users" description={`${users.length} accounts.`} />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">User</th>
<th className="px-4 py-3">Email</th>
<th className="px-4 py-3">Role</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Joined</th>
{isAdmin && <th className="px-4 py-3">Actions</th>}
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{users.map((user) => (
<tr key={user.id}>
<td className="px-4 py-3">
<p className="font-medium text-slate-900">{user.fullName}</p>
<p className="text-xs text-slate-500">@{user.username}</p>
</td>
<td className="px-4 py-3 text-slate-600">{user.email}</td>
<td className="px-4 py-3"><Badge tone="brand">{user.role}</Badge></td>
<td className="px-4 py-3">
<Badge tone={user.status === "active" ? "success" : user.status === "suspended" ? "accent" : "amber"}>{user.status}</Badge>
</td>
<td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
{isAdmin && <td className="px-4 py-3"><UserActions user={user} /></td>}
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
