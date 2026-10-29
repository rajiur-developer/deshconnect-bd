import { listAdminReports } from "@/services/community"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { ReportResolveButtons } from "@/components/admin/admin-client"; import { relativeTime } from "@/lib/utils";
export const metadata = { title: "Reports" };
const TONE: Record<string, "accent" | "info" | "success" | "neutral"> = {
open: "accent",
under_review: "info",
resolved: "success",
dismissed: "neutral", };
export default async function AdminReportsPage() {
const reports = await listAdminReports();
return (
<>
<PageHeader title="Reports" description="Review user-submitted reports and take action." />
{reports.length === 0 ? (
<Card className="p-6 text-sm text-slate-600">No reports yet.</Card>
) : (
<div className="space-y-3">
{reports.map((report) => (
<Card key={report.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div>
<div className="flex items-center gap-2">
<Badge tone="neutral" className="capitalize">{report.targetType.replace("_", " ")}</Badge>
<Badge tone={TONE[report.status] ?? "neutral"}>{report.status.replace("_", " ")}</Badge>
<span className="text-xs text-slate-500">{relativeTime(report.createdAt)}</span>
</div>
<p className="mt-2 text-sm font-medium text-slate-900">{report.reason}</p>
{report.details && <p className="mt-1 text-sm text-slate-600">{report.details}</p>}
{report.resolution && <p className="mt-1 text-sm text-brand-700">Resolution: {report.resolution}</p>}
</div>
<ReportResolveButtons id={report.id} status={report.status} />
</div>
</Card>
))}
</div>
)}
</>
); }
