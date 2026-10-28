// @ts-nocheck
"use client";
import { useActionState } from "react";
import {
adminUpdateServiceAction,
createGovernmentServiceAction,
type AdminFormState, } from "@/features/admin/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters"; import type { GovernmentService } from "@/types/content"; import type { ContentCategory } from "@/services/content-categories";
const CATEGORIES = [
{ value: "identity", label: "Identity" },
{ value: "land", label: "Land" },
{ value: "health", label: "Health" },
{ value: "education", label: "Education" },
{ value: "transport", label: "Transport" },
{ value: "tax", label: "Tax" },
{ value: "other", label: "Other" }, ];
const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";
type Props = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[];
record?: GovernmentService; categories: ContentCategory[]; };
export function ServiceForm({ divisions, districts, upazilas, record, categories }: Props) {
const action = record ? adminUpdateServiceAction : createGovernmentServiceAction;
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
action as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
useFormStateToast(state);
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">{record ? "Update service" : "Add a government service"}</h2>
{!record && <p className="text-sm text-slate-600">Available to admins and moderators.</p>}
{record && <input type="hidden" name="id" value={record.id} />}
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Service name" htmlFor="service-name" required>
<Input id="service-name" name="name" required defaultValue={record?.name ?? ""} placeholder="e.g. Dhaka Passport Office" />
</Field>
<Field label="Category" htmlFor="service-category" required>
<select id="service-category" name="category" required defaultValue={record?.category ?? ""} className={selectClass}>
<option value="">Select category</option>
{(categories.length ? categories : [{ value: "identity", name: "Identity" }, { value: "land", name: "Land" }, { value: "health", name: "Health" }, { value: "education", name: "Education" }, { value: "transport", name: "Transport" }, { value: "tax", name: "Tax" }, { value: "other", name: "Other" }]).map((category) => (
<option key={category.value} value={category.value}>{category.name}</option>
))}
</select>
</Field>
</div>
<Field label="Description" htmlFor="service-description" required>
<Textarea id="service-description" name="description" className="min-h-[110px]" required defaultValue={record?.description ?? ""} />
</Field>
<Field label="Full address" htmlFor="service-address" required>
<Input id="service-address" name="officeAddress" required defaultValue={record?.officeAddress ?? ""} placeholder="Street, area, city" />
</Field>
<LocationFields
divisions={divisions}
districts={districts}
upazilas={upazilas}
current={{
divisionId: record?.divisionId ?? undefined,
districtId: record?.districtId ?? undefined,
upazilaId: record?.upazilaId ?? undefined,
}}
/>
<div className="grid gap-4 sm:grid-cols-3">
<Field label="Phone" htmlFor="service-phone" hint="Optional">
<Input id="service-phone" name="phone" defaultValue={record?.phone ?? ""} placeholder="02-0000-0000" />
</Field>
<Field label="Emergency phone" htmlFor="service-emergency" hint="Optional">
<Input id="service-emergency" name="emergencyPhone" defaultValue={record?.emergencyPhone ?? ""} placeholder="199" />
</Field>
<Field label="Opening hours" htmlFor="service-hours" hint="Optional">
<Input id="service-hours" name="hours" defaultValue={record?.hours ?? ""} placeholder="Sun–Thu 09:00–17:00" />
</Field>
</div>
<Field label="Website" htmlFor="service-website" hint="Optional">
<Input id="service-website" name="website" defaultValue={record?.website ?? ""} placeholder="https://example.gov.bd" />
</Field>
<Field label="Required documents" htmlFor="service-documents" hint="Optional — separate with commas">
<Input
id="service-documents"
name="requiredDocuments"
defaultValue={record?.requiredDocuments?.join(", ") ?? ""}
placeholder="National ID, Application form, Photo"
/>
</Field>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>
{pending ? "Saving…" : record ? "Save changes" : "Create service"}
</Button>
</form>
); }
