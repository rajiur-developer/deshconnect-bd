import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listUserBloodRequests } from "@/services/blood"; import { formatDate } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { CancelRequestButton } from "@/components/blood/donor-actions";
export const metadata = { title: "My blood requests", robots: { index: false, follow: false } };
const STATUS_TONE: Record<string, "accent" | "success" | "neutral" | "amber" | "info"> = {
active: "accent",
fulfilled: "success",
cancelled: "neutral",
expired: "amber",
under_review: "info", };
export default async function MyBloodRequestsPage() {
const user = await requireUser("/my-blood-requests");
const requests = await listUserBloodRequests(user.id);
return (
<AccountShell user={user} title="My blood requests" description="Track and cancel your blood requests.">
{requests.length === 0 ? (
<EmptyState
title="No blood requests yet"
description="Post a request from the blood donation page."
action={<Link href="/blood-donation" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Blood donation</Link>}
icon={<Icon name="droplet" className="h-10 w-10" />}
/>
) : (
<div className="space-y-3">
{requests.map((request) => (
<Card key={request.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div>
<div className="flex items-center gap-2">
<Badge tone="brand">{request.bloodGroup}</Badge>
<Badge tone={STATUS_TONE[request.status] ?? "neutral"}>
{request.status}
</Badge>
</div>
<p className="mt-2 text-sm text-slate-700">
{request.units} unit{request.units > 1 ? "s" : ""} · {request.hospital}
</p>
<p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
<Icon name="calendar" className="h-3.5 w-3.5" /> Needed {formatDate(request.neededBy)}
</p>
</div>
{request.status === "active" && <CancelRequestButton requestId={request.id} />}
</div>
</Card>
))}
</div>
)}
</AccountShell>
); }
