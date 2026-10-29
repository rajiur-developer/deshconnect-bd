import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listUserReports } from "@/services/community"; import { relativeTime } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; export const metadata = { title: "My reports", robots: { index: false, follow: false } };
const STATUS_TONE: Record<string, "accent" | "success" | "neutral" | "amber" | "info"> = {
open: "accent",
under_review: "info",
resolved: "success",
dismissed: "neutral", };
export default async function MyReportsPage() {
const user = await requireUser("/my-reports");
const reports = await listUserReports(user.id);
return (
<AccountShell user={user} title="My reports" description="Your submitted reports and their status.">
{reports.length === 0 ? (
<EmptyState title="No reports yet" icon={<Icon name="flag" className="h-10 w-10" />} />
) : (
<div className="space-y-3">
{reports.map((report) => (
<Card key={report.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div>
<div className="flex items-center gap-2">
<Badge tone="neutral">{report.targetType}</Badge>
<Badge tone={STATUS_TONE[report.status] ?? "neutral"}>
{report.status}
</Badge>
<span className="text-xs text-slate-500">{relativeTime(report.createdAt)}</span>
</div>
<p className="mt-2 text-sm font-medium text-slate-900">{report.reason}</p>
{report.details && <p className="mt-1 text-sm text-slate-600">{report.details}</p>}
</div>
{report.targetType === "post" && (
<Link href={`/community/${report.targetId}`} className="shrink-0 text-sm font-medium text-brand-700">
View content
</Link>
)}
</div>
</Card>
))}
</div>
)}
</AccountShell>
); }
