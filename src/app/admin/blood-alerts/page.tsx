import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { PageHeader } from "@/components/layout/page-header"; import { EmergencyAlertForm } from "@/components/admin/emergency-alert-form"; import { Badge, Card } from "@/components/ui/badge"; import { formatDate } from "@/lib/utils";
export const metadata = { title: "Emergency Blood Alerts" };
export default async function AdminBloodAlertsPage() {
const { data } = await insforgeSelectMany("blood_requests", { status: "eq.active", order: "created_at.desc", limit: "10" });
const alerts = mapDbRow(data || []);
return (
<>
<PageHeader
title="Emergency Blood Alerts"
description="Publish an active blood request and notify every registered user."
/>
<div className="mb-8">
<EmergencyAlertForm />
</div>
<Card className="p-5">
<h2 className="font-semibold text-slate-900">Recent active requests</h2>
{alerts.length === 0 ? (
<p className="mt-3 text-sm text-slate-600">No active blood requests.</p>
) : (
<ul className="mt-3 divide-y divide-slate-100">
{alerts.map((request) => (
<li key={request.id} className="flex items-center justify-between gap-3 py-3">
<div>
<p className="text-sm font-medium text-slate-900">
{request.bloodGroup} · {request.units} unit{request.units > 1 ? "s" : ""}
</p>
<p className="text-xs text-slate-500">{request.hospital}</p>
</div>
<div className="flex items-center gap-2">
<Badge tone="accent">Active</Badge>
<span className="text-xs text-slate-400">{formatDate(request.createdAt)}</span>
</div>
</li>
))}
</ul>
)}
</Card>
</>
); }
