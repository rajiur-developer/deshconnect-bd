// @ts-nocheck
import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge"; import { listAdminUsers } from "@/services/users"; import { listAuditLogs } from "@/services/audit"; import { listNews } from "@/services/news"; import { formatDate } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header";
export const metadata = { title: "Admin Dashboard" };
export default async function AdminDashboardPage() {
const [users, logs, newsResult, pendingNewsResult, places, institutions, hospitals, businesses, reports, donors, requests] = await Promise.all([
listAdminUsers(), listAuditLogs(10),
listNews({ includeAll: true, page: 1, pageSize: 1 }),
listNews({ includeAll: true, status: "pending_review", page: 1, pageSize: 1 }),
insforgeSelectMany("places", { limit: "1" }).then((r) => r.count),
insforgeSelectMany("institutions", { category: "in.(school,college,madrasah)", limit: "1" }).then((r) => r.count),
insforgeSelectMany("institutions", { category: "in.(hospital,health-centre)", limit: "1" }).then((r) => r.count),
insforgeSelectMany("businesses", { limit: "1" }).then((r) => r.count),
insforgeSelectMany("reports", { status: "eq.open", limit: "1" }).then((r) => r.count),
insforgeSelectMany("blood_donors", { limit: "1" }).then((r) => r.count),
insforgeSelectMany("blood_requests", { status: "eq.active", limit: "1" }).then((r) => r.count),
]);
const newsTotal = newsResult.meta.total;
const pendingNewsTotal = pendingNewsResult.meta.total;
const moderators = users.filter((item) => item.role === "moderator");
const counts = [
{ label: "Users", value: users.length, href: "/admin/users" },
{ label: "Moderators", value: moderators.length, href: "/admin/users" },
{ label: "Places", value: places, href: "/admin/places" },
{ label: "Institutions", value: institutions, href: "/admin/institutions" },
{ label: "Hospitals", value: hospitals, href: "/admin/hospitals" },
{ label: "Businesses", value: businesses, href: "/admin/businesses" },
{ label: "News", value: newsTotal, href: "/admin/news?view=all" },
{ label: "Pending news", value: pendingNewsTotal, href: "/admin/news?view=requests" },
{ label: "Open reports", value: reports, href: "/admin/reports" },
{ label: "Donors", value: donors, href: "/admin/blood-donors" },
{ label: "Blood requests", value: requests, href: "/admin/blood-requests" },
];
return (
<>
<PageHeader title="Admin Dashboard" description="Content management overview and platform activity." />
<div className="space-y-8">
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{counts.map((item) => (
<Link key={item.label} href={item.href}>
<Card className="p-5 transition hover:border-brand-300">
<p className="text-2xl font-bold text-slate-900">{item.value}</p>
<p className="text-sm text-slate-600">{item.label}</p>
</Card>
</Link>
))}
</div>
<Card className="mt-6 p-5">
<div className="flex flex-wrap items-center justify-between gap-3">
<div>
<h2 className="font-semibold text-slate-900">Moderators</h2>
<p className="mt-1 text-sm text-slate-600">
{moderators.length} moderator{moderators.length === 1 ? "" : "s"}. Promote or demote members and configure what moderators can do.
</p>
</div>
<div className="flex gap-2">
<Link href="/admin/users" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
Manage users
</Link>
<Link href="/admin/permissions" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
Moderator permissions
</Link>
</div>
</div>
{moderators.length > 0 && (
<ul className="mt-3 flex flex-wrap gap-2">
{moderators.map((moderator) => (
<li key={moderator.id}>
<Link href={`/profile/${moderator.username}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:border-brand-300">
<span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
{moderator.fullName.slice(0, 2).toUpperCase()}
</span>
{moderator.fullName}
</Link>
</li>
))}
</ul>
)}
</Card>
<Card className="p-5">
<h2 className="font-semibold text-slate-900">Recent admin activity</h2>
<ul className="mt-3 divide-y divide-slate-100">
{logs.length === 0 && <li className="py-3 text-sm text-slate-600">No activity recorded yet.</li>}
{logs.map((log) => (
<li key={log.id} className="flex items-center justify-between gap-3 py-3">
<div>
<p className="text-sm font-medium text-slate-900">{log.action}</p>
<p className="text-xs text-slate-500">
{log.actorName} · {log.entity} {log.entityId}
{log.detail ? ` · ${log.detail}` : ""}
</p>
</div>
<div className="flex items-center gap-2">
<Badge tone={log.outcome === "success" ? "success" : log.outcome === "denied" ? "accent" : "neutral"}>
{log.outcome}
</Badge>
<span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
</div>
</li>
))}
</ul>
</Card>
</div>
</>
); }
