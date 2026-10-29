import Link from "next/link";
import type { BloodRequest } from "@/types/blood"; import { DEFAULT_MAPS_LINK } from "@/lib/constants"; import { formatDate } from "@/lib/utils"; import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { BloodGroupBadge } from "./blood-group-badge";
const STATUS_TONE: Record<BloodRequest["status"], "success" | "accent" | "amber" | "info" | "neutral"> = {
active: "accent",
fulfilled: "success",
cancelled: "neutral",
expired: "amber",
under_review: "info", };
const STATUS_LABEL: Record<BloodRequest["status"], string> = {
active: "Active",
fulfilled: "Fulfilled",
cancelled: "Cancelled",
expired: "Expired",
under_review: "Under review", };
export function BloodRequestCard({
request,
locationLabel,
action, }: {
request: BloodRequest;
locationLabel?: string;
action?: React.ReactNode; }) {
return (
<Card className="flex h-full flex-col p-4">
<div className="flex items-start gap-3">
<BloodGroupBadge group={request.bloodGroup} />
<div className="min-w-0">
<p className="text-sm font-semibold text-slate-900">
{request.units} bags needed
</p>
<p className="text-xs text-slate-500">{request.hospital}</p>
</div>
</div>
<div className="mt-3">
<Badge tone={STATUS_TONE[request.status]}>
{STATUS_LABEL[request.status]}
</Badge>
</div>
<dl className="mt-3 space-y-1.5 text-sm">
<div className="flex items-center gap-2 text-slate-600">
<Icon name="calendar" className="h-4 w-4 text-slate-400" />
Needed {formatDate(request.neededBy)}
</div>
{locationLabel && (
<div className="flex items-center gap-2 text-slate-600">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel}
</div>
)}
</dl>
{request.notes && <p className="mt-3 text-sm text-slate-600">{request.notes}</p>}
{action && <div className="mt-auto pt-4">{action}</div>}
{!action && (
<div className="mt-auto pt-4 text-xs text-slate-400">
<Link href={DEFAULT_MAPS_LINK} className="hover:text-brand-700" target="_blank" rel="noreferrer">
Find hospital on map
</Link>
</div>
)}
</Card>
); }
