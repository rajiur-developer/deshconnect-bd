import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { getDonorForUser } from "@/services/blood"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge";
export const metadata = { title: "Settings", robots: { index: false, follow: false } };
export default async function SettingsPage() {
const user = await requireUser("/settings");
const donor = await getDonorForUser(user.id);
return (
<AccountShell user={user} title="Settings" description="Account preferences and donor settings.">
<div className="space-y-6">
<Card className="p-5">
<h2 className="font-semibold text-slate-900">Blood donation</h2>
<p className="mt-1 text-sm text-slate-600">
{donor ? "You are registered as a donor." : "You are not registered as a donor."}
</p>
<div className="mt-3">
<Link href="/blood-donation" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
{donor ? "Manage donor profile" : "Register as a donor"}
</Link>
</div>
</Card>
<Card className="p-5">
<h2 className="font-semibold text-slate-900">Account</h2>
<p className="mt-1 text-sm text-slate-600">Change your password, review your data, or deactivate your account.</p>
<div className="mt-3 flex flex-wrap items-center gap-3">
<Link href="/forgot-password" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
Change password
</Link>
<Badge tone="amber">Full settings flow not yet enabled</Badge>
</div>
</Card>
</div>
</AccountShell>
); }
