import type { PublicDonor } from "@/types/blood";
import { Badge, Card } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { BloodGroupBadge } from "./blood-group-badge";
const AVAILABILITY_TONE: Record<PublicDonor["availability"], "success" | "amber" | "neutral"> = {
available: "success",
busy: "amber",
unavailable: "neutral", };
const AVAILABILITY_LABEL: Record<PublicDonor["availability"], string> = {
available: "Ready",
busy: "Busy",
unavailable: "Not available", };
const CONTACT_LABEL: Record<string, string> = {
phone: "Phone",
sms: "SMS",
email: "Email",
"in-app": "In-app", };
export function DonorCard({
donor,
locationLabel,
isOwner,
action, }: {
donor: PublicDonor;
locationLabel?: string;
isOwner?: boolean;
action?: React.ReactNode; }) {
return (
<Card className="dc-donor-card flex h-full flex-col rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg">
<div className="flex items-start justify-between gap-3">
<div className="flex min-w-0 items-start gap-3">
<BloodGroupBadge group={donor.bloodGroup} />
<div className="min-w-0">
<p className="text-sm font-semibold text-slate-900">{donor.fullName}</p>
<p className="text-xs text-slate-500">{donor.donationCount} donations</p>
</div>
</div>
{isOwner && (
<a href="#donor-form" className="shrink-0 rounded-lg border border-brand-200 px-3 py-2 text-xs font-medium text-brand-800 hover:bg-brand-50">
Update info
</a>
)}
</div>
<div className="mt-3 flex flex-wrap items-center gap-2">
<Badge tone={AVAILABILITY_TONE[donor.availability]}>
{AVAILABILITY_LABEL[donor.availability]}
</Badge>
<Badge tone="neutral">{CONTACT_LABEL[donor.preferredContact] ?? donor.preferredContact}</Badge>
</div>
{locationLabel && (
<p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
<Icon name="map-pin" className="h-3.5 w-3.5" />
{locationLabel}
</p>
)}
{action && <div className="mt-auto pt-4">{action}</div>}
</Card>
); }
