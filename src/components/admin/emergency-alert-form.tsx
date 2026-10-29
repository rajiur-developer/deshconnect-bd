"use client";
import { useActionState } from "react";
import { DateInput } from "@/components/ui/date-input";
import { sendEmergencyBloodAlertAction, type AdminFormState } from "@/features/admin/actions"; import { BLOOD_GROUPS } from "@/lib/constants"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input";
export function EmergencyAlertForm() {
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
sendEmergencyBloodAlertAction as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-accent-500/30 bg-white p-5">
<h2 className="font-semibold text-slate-900">Emergency blood alert</h2>
<p className="text-sm text-slate-600">
Creates an active blood request and sends a notification to every registered user.
</p>
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Blood group" htmlFor="alert-group" required>
<select id="alert-group" name="bloodGroup" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring">
<option value="">Select group</option>
{BLOOD_GROUPS.map((group) => (
<option key={group} value={group}>{group}</option>
))}
</select>
</Field>
<Field label="Units needed" htmlFor="alert-units" required>
<Input id="alert-units" name="units" type="number" min={1} max={20} defaultValue={1} required />
</Field>
</div>
<Field label="Hospital" htmlFor="alert-hospital" required>
<Input id="alert-hospital" name="hospital" required placeholder="Hospital or clinic name" />
</Field>
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Needed by" htmlFor="alert-needed" required>
<DateInput id="alert-needed" name="neededBy" required />
</Field>
</div>
<Field label="Notes" htmlFor="alert-notes" hint="Optional">
<Textarea id="alert-notes" name="notes" placeholder="Ward, contact, or other details" />
</Field>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" variant="accent" disabled={pending}>{pending ? "Sending…" : "Send alert to all users"}</Button>
</form>
); }
