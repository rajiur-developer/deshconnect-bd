import { listAuditLogs } from "@/services/audit"; import { formatDate } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header";
export const metadata = { title: "Audit Logs" };
export default async function AdminAuditLogsPage() {
const logs = await listAuditLogs(200);
return (
<>
<PageHeader title="Audit Logs" description="Records of important administrative activity." />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">When</th>
<th className="px-4 py-3">Actor</th>
<th className="px-4 py-3">Action</th>
<th className="px-4 py-3">Entity</th>
<th className="px-4 py-3">Outcome</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{logs.map((log) => (
<tr key={log.id}>
<td className="px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td>
<td className="px-4 py-3 text-slate-600">{log.actorName}</td>
<td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
<td className="px-4 py-3 text-slate-600">{log.entity} · {log.entityId}</td>
<td className="px-4 py-3">
<Badge tone={log.outcome === "success" ? "success" : log.outcome === "denied" ? "accent" : "neutral"}>{log.outcome}</Badge>
</td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
