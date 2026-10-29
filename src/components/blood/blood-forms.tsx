"use client";
import { useActionState, useEffect, useState } from "react";
import {
createBloodRequestAction,
registerDonorAction,
type BloodFormState, } from "@/features/blood/actions"; import { BLOOD_GROUPS } from "@/lib/constants"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters";
import { getDonationEligibility, isValidBloodDonationDate } from "@/lib/blood-donation";
import { DateInput } from "@/components/ui/date-input";
import type { DonorAvailability, ContactMethod } from "@/types/blood";
import { DeleteDonorProfileButton } from "./donor-actions";
type LocationProps = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[]; };
type DonorProfile = {
  bloodGroup?: string | null;
  availability?: DonorAvailability | null;
  preferredContact?: ContactMethod | null;
  contactValue?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  lastDonationAt?: string | null;
  notes?: string | null;
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
  consentListed?: boolean;
  consentContact?: boolean;
  archivedAt?: string | null;
};
const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";
function todayDate() {
const now = new Date();
return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function cooldownLabel(remainingMs: number) {
const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
const days = Math.floor(hours / 24);
const remainingHours = hours % 24;
if (days) return `${days} day${days === 1 ? "" : "s"}${remainingHours ? ` ${remainingHours} hr` : ""}`;
return `${Math.max(1, remainingHours)} hour${remainingHours === 1 ? "" : "s"}`;
}
export function DonorForm({ divisions, districts, upazilas, profile }: LocationProps & { profile?: DonorProfile | null }) {
const [state, formAction, pending] = useActionState<BloodFormState, FormData>(registerDonorAction, {});
const [lastDonationAt, setLastDonationAt] = useState(profile?.lastDonationAt ?? "");
const [availability, setAvailability] = useState<DonorAvailability>(() => {
const eligible = profile?.lastDonationAt ? getDonationEligibility(profile.lastDonationAt)?.eligible : false;
return profile?.availability === "available" && !eligible ? "busy" : profile?.availability ?? "busy";
});
const [now, setNow] = useState(Date.now());
useFormStateToast(state);
useEffect(() => {
const timer = window.setInterval(() => setNow(Date.now()), 60_000);
return () => window.clearInterval(timer);
}, []);
const eligibility = lastDonationAt ? getDonationEligibility(lastDonationAt, now) : null;
const canDonate = Boolean(eligibility?.eligible);
useEffect(() => {
if (lastDonationAt && !canDonate && availability === "available") setAvailability("busy");
}, [lastDonationAt, canDonate, availability]);
return (
<form action={formAction} className="space-y-4">
{profile?.archivedAt && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
Your donor profile is archived and hidden from public listings. Your record remains available to admins. Save this form to restore your listing.
</p>}
<div className="grid gap-3 sm:grid-cols-2">
<Field label="Blood group" htmlFor="bloodGroup" required>
<select id="bloodGroup" name="bloodGroup" defaultValue={profile?.bloodGroup ?? ""} required className={selectClass}>
<option value="">Select group</option>
{BLOOD_GROUPS.map((group) => (
<option key={group} value={group}>{group}</option>
))}
</select>
</Field>
<Field label="Availability" htmlFor="availability" required>
<select id="availability" name="availability" value={availability} onChange={(event) => setAvailability(event.target.value as DonorAvailability)} required className={selectClass}>
<option value="available" disabled={!canDonate}>Ready</option>
<option value="busy">Busy</option>
<option value="unavailable">Not available</option>
</select>
</Field>
{lastDonationAt && eligibility && !eligibility.eligible && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2">
You can mark yourself Ready in <strong>{cooldownLabel(eligibility.remainingMs)}</strong> (75 days after your last donation).
</p>}
{lastDonationAt && !eligibility && <p role="alert" className="text-sm text-accent-600 sm:col-span-2">Enter a valid last donation date.</p>}
<Field label="Preferred contact method" htmlFor="preferredContact" required>
<select id="preferredContact" name="preferredContact" defaultValue={profile?.preferredContact ?? "phone"} required className={selectClass}>
<option value="phone">Phone</option>
<option value="sms">SMS</option>
<option value="email">Email</option>
<option value="in-app">In-app</option>
</select>
</Field>
<Field label="Phone number" htmlFor="phone" required hint="Shown publicly on your donor card when you consent below.">
<Input id="phone" name="phone" type="tel" defaultValue={profile?.phone ?? ""} placeholder="01712345678" required />
</Field>
<Field label="WhatsApp number" htmlFor="whatsapp" required hint="Shown publicly on your donor card when you consent below.">
<Input id="whatsapp" name="whatsapp" type="tel" defaultValue={profile?.whatsapp ?? ""} placeholder="01712345678" required />
</Field>

</div>
<LocationFields idPrefix="donor-" divisions={divisions} districts={districts} upazilas={upazilas} current={{ divisionId: profile?.divisionId ?? undefined, districtId: profile?.districtId ?? undefined, upazilaId: profile?.upazilaId ?? undefined }} required />
<div className="grid gap-3 sm:grid-cols-2">
<Field label="Last donation date" htmlFor="lastDonationAt" required hint="Ready status becomes available 75 days after this date.">
<DateInput id="lastDonationAt" name="lastDonationAt" value={lastDonationAt} max={todayDate()} onChange={(value) => {
setLastDonationAt(value);
if (!isValidBloodDonationDate(value)) setAvailability((current) => current === "available" ? "busy" : current);
}} required />
</Field>
<Field label="Notes" htmlFor="notes" hint="Optional">
<Input id="notes" name="notes" defaultValue={profile?.notes ?? ""} placeholder="What donors should know" />
</Field>
</div>
<div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
<label className="flex items-start gap-2 text-sm text-slate-700">
<input type="checkbox" name="consentListed" defaultChecked={profile?.consentListed ?? false} required className="mt-1" />
<span>I consent to my name being listed publicly as a blood donor.</span>
</label>
<label className="flex items-start gap-2 text-sm text-slate-700">
<input type="checkbox" name="consentContact" defaultChecked={profile?.consentContact ?? false} required className="mt-1" />
<span>I consent to showing my phone and WhatsApp numbers publicly on my donor card.</span>
</label>
</div>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>{pending ? "Saving…" : profile?.archivedAt ? "Restore donor profile" : profile ? "Save changes" : "Register as donor"}</Button>
{profile && !profile.archivedAt && <DeleteDonorProfileButton />}
</form>
); }
export function BloodRequestForm({ divisions, districts, upazilas }: LocationProps) {
const [state, formAction, pending] = useActionState<BloodFormState, FormData>(createBloodRequestAction, {});
useFormStateToast(state);
return (
<form action={formAction} className="space-y-4">
<div className="grid gap-3 sm:grid-cols-2">
<Field label="Blood group" htmlFor="req-bloodGroup" required>
<select id="req-bloodGroup" name="bloodGroup" required className={selectClass}>
<option value="">Select group</option>
{BLOOD_GROUPS.map((group) => (
<option key={group} value={group}>{group}</option>
))}
</select>
</Field>
<Field label="Number of blood bags" htmlFor="units" required>
<Input id="units" name="units" type="number" min={1} max={20} defaultValue={1} required />
</Field>
</div>
<Field label="Hospital" htmlFor="hospital" required>
<Input id="hospital" name="hospital" placeholder="Hospital or clinic name" required />
</Field>
<div className="grid gap-3 sm:grid-cols-2">
<Field label="Phone number" htmlFor="req-phone" required hint="Shown on your request so donors can call you.">
<Input id="req-phone" name="phone" type="tel" placeholder="01712345678" required />
</Field>
<Field label="WhatsApp number" htmlFor="req-whatsapp" required hint="Shown on your request so donors can message you.">
<Input id="req-whatsapp" name="whatsapp" type="tel" placeholder="01712345678" required />
</Field>
</div>
<div className="grid gap-3 sm:grid-cols-2">
<Field label="Date needed" htmlFor="neededBy" required>
<DateInput id="neededBy" name="neededBy" min={todayDate()} required />
</Field>
<Field label="Patient name" htmlFor="patient" required>
<Input id="patient" name="patient" placeholder="Patient" required />
</Field>
</div>
<LocationFields idPrefix="request-" divisions={divisions} districts={districts} upazilas={upazilas} current={{}} required />
<Field label="Additional info" htmlFor="req-notes" hint="Optional — add the patient's condition, hemoglobin level, ward, or other helpful details.">
<Textarea id="req-notes" name="notes" placeholder="Patient condition, hemoglobin level, ward or doctor details" />
</Field>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" variant="accent" disabled={pending}>{pending ? "Submitting…" : "Post blood request"}</Button>
</form>
); }
