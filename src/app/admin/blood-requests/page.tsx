import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { listAdminUsers } from "@/services/users"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { BloodRequestStatusSelect } from "@/components/admin/admin-client"; import { formatDate } from "@/lib/utils";
export const metadata = { title: "Blood Requests" };
export default async function AdminBloodRequestsPage() {
const [{ data }, users] = await Promise.all([insforgeSelectMany("blood_requests", { order: "needed_by.asc", limit: "500" }), listAdminUsers()]);
const userById = new Map(users.map((user) => [user.id, user]));
const requests = mapDbRow(data || []);
return (
<>
<PageHeader title="Blood Requests" description="Review blood requests and manage their statuses." />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Requester</th>
<th className="px-4 py-3">Group</th>
<th className="px-4 py-3">Hospital</th>
<th className="px-4 py-3">Needed by</th>
<th className="px-4 py-3">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{requests.map((request) => (
<tr key={request.id}>
<td className="px-4 py-3 text-slate-600">{userById.get(request.requesterId)?.fullName ?? request.requesterId}</td>
<td className="px-4 py-3"><Badge tone="brand">{request.bloodGroup}</Badge></td>
<td className="px-4 py-3 text-slate-600">{request.hospital}</td>
<td className="px-4 py-3 text-slate-600">{formatDate(request.neededBy)}</td>
<td className="px-4 py-3"><BloodRequestStatusSelect id={request.id} status={request.status} /></td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
