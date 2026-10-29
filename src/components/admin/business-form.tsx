"use client";
import { useActionState } from "react";
import {
adminUpdateBusinessAction,
createBusinessAction,
type AdminFormState, } from "@/features/admin/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { ImageUpload } from "@/components/forms/image-upload"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters"; import type { Business } from "@/types/content";
const CATEGORIES = [
{ value: "hotel", label: "Hotel" },
{ value: "restaurant", label: "Restaurant" },
{ value: "transport", label: "Transport" },
{ value: "shop", label: "Shop" },
{ value: "service", label: "Service" },
{ value: "other", label: "Other" }, ];
const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";
type Props = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[];
userId?: string;
record?: Business; };
export function BusinessForm({ divisions, districts, upazilas, userId, record }: Props) {
const action = record ? adminUpdateBusinessAction : createBusinessAction;
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
action as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
useFormStateToast(state);
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">{record ? "Update business" : "Add a business"}</h2>
{!record && <p className="text-sm text-slate-600">Available to admins and moderators.</p>}
{record && <input type="hidden" name="id" value={record.id} />}
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Business name" htmlFor="business-name" required>
<Input id="business-name" name="name" required defaultValue={record?.name ?? ""} placeholder="e.g. Hotel Sea Palace" />
</Field>
<Field label="Category" htmlFor="business-category" required>
<select id="business-category" name="category" required defaultValue={record?.category ?? ""} className={selectClass}>
<option value="">Select category</option>
{CATEGORIES.map((category) => (
<option key={category.value} value={category.value}>{category.label}</option>
))}
</select>
</Field>
</div>
<Field label="Description" htmlFor="business-description" required>
<Textarea id="business-description" name="description" className="min-h-[110px]" required defaultValue={record?.description ?? ""} />
</Field>
<Field label="Full address" htmlFor="business-address" required>
<Input id="business-address" name="address" required defaultValue={record?.address ?? ""} placeholder="Street, area, city" />
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
<ImageUpload name="image" label="Business image" hint="Upload an image from your device, or leave as is" current={record?.image} userId={userId} storageFolder="businesses" />
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Phone" htmlFor="business-phone" hint="Optional">
<Input id="business-phone" name="phone" defaultValue={record?.phone ?? ""} placeholder="031-000000" />
</Field>
<Field label="Website" htmlFor="business-website" hint="Optional">
<Input id="business-website" name="website" defaultValue={record?.website ?? ""} placeholder="https://example.com" />
</Field>
</div>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>
{pending ? "Saving…" : record ? "Save changes" : "Create business"}
</Button>
</form>
); }
