import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { listAdminUsers } from "@/services/users"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { formatDate } from "@/lib/utils";
export const metadata = { title: "Connections" };
const TONE: Record<string, "success" | "amber" | "neutral" | "accent"> = {
accepted: "success",
pending: "amber",
rejected: "neutral",
cancelled: "accent", };
export default async function AdminConnectionsPage() {
const [{ data }, users] = await Promise.all([insforgeSelectMany("connections", { order: "updated_at.desc", limit: "500" }), listAdminUsers()]);
const connections = mapDbRow(data || []);
const userById = new Map(users.map((user) => [user.id, user]));
return (
<>
<PageHeader title="Connections" description="Handle connection-related reports or abuse." />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Requester</th>
<th className="px-4 py-3">Addressee</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Updated</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{connections.map((connection) => (
<tr key={connection.id}>
<td className="px-4 py-3 text-slate-600">{userById.get(connection.requesterId)?.fullName ?? connection.requesterId}</td>
<td className="px-4 py-3 text-slate-600">{userById.get(connection.addresseeId)?.fullName ?? connection.addresseeId}</td>
<td className="px-4 py-3"><Badge tone={TONE[connection.status] ?? "neutral"}>{connection.status}</Badge></td>
<td className="px-4 py-3 text-slate-500">{formatDate(connection.updatedAt)}</td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
