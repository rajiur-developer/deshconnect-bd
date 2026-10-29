"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import {
adminUpdatePlaceAction,
createPlaceAction,
type AdminFormState, } from "@/features/admin/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { ImageUpload } from "@/components/forms/image-upload"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters"; import type { Place } from "@/types/content";
import type { ContentCategory } from "@/services/content-categories";
const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";
type Props = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[];
categories: ContentCategory[];
userId: string;
/** When provided the form edits this record instead of creating one. */
record?: Place; };
export function PlaceForm({ divisions, districts, upazilas, categories, userId, record }: Props) {
const action = record ? adminUpdatePlaceAction : createPlaceAction;
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
action as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
const formRef = useRef<HTMLFormElement>(null);
const [resetKey, setResetKey] = useState(0);
const [imageChanged, setImageChanged] = useState(false);
const [imageUploading, setImageUploading] = useState(false);
useFormStateToast(state);
useEffect(() => {
if (state.success) {
setImageChanged(false);
if (!record) {
formRef.current?.reset();
setResetKey((key) => key + 1);
}
}
}, [record, state]);
return (
<form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">{record ? "Update place" : "Add a new place"}</h2>
{!record && <p className="text-sm text-slate-600">Places created here are published immediately and marked as verified.</p>}
{record && <input type="hidden" name="id" value={record.id} />}
<input type="hidden" name="imageChanged" value={imageChanged ? "true" : "false"} />
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Name" htmlFor="place-name" required>
<Input id="place-name" name="name" required defaultValue={record?.name ?? ""} placeholder="e.g. Sajek Valley" />
</Field>
<Field label="Category" htmlFor="place-category" required>
<select id="place-category" name="category" required defaultValue={record?.category ?? ""} className={selectClass}>
<option value="">Select category</option>
{categories.map((category) => (
<option key={category.value} value={category.value}>{category.name}</option>
))}
</select>
</Field>
</div>
<Field label="Summary (up to 200 words)" htmlFor="place-summary" required>
<Textarea id="place-summary" name="summary" required defaultValue={record?.summary ?? ""} placeholder="Write a summary of the place" />
</Field>
<Field label="Description" htmlFor="place-description" required>
<Textarea id="place-description" name="description" className="min-h-[140px]" required defaultValue={record?.description ?? ""} placeholder="What visitors should know" />
</Field>
<Field label="Address" htmlFor="place-address" required>
<Input id="place-address" name="address" required defaultValue={record?.address ?? ""} placeholder="Upazila, District" />
</Field>
<LocationFields
key={`location-${resetKey}`}
divisions={divisions}
districts={districts}
upazilas={upazilas}
current={{
divisionId: record?.divisionId ?? undefined,
districtId: record?.districtId ?? undefined,
upazilaId: record?.upazilaId ?? undefined,
}}
/>
<ImageUpload
key={`image-${resetKey}`}
name="image"
label="Place image"
hint="Upload a new image to replace it. The current image stays unchanged if you do not select another."
current={record?.image}
userId={userId}
storageFolder="places"
onValueChange={() => setImageChanged(true)}
onUploadingChange={setImageUploading}
/>
<div className="grid gap-4 sm:grid-cols-3">
<Field label="Opening hours" htmlFor="place-hours" hint="Optional">
<Input id="place-hours" name="openingHours" defaultValue={record?.openingHours ?? ""} placeholder="All day" />
</Field>
<Field label="Entry fee" htmlFor="place-fee" hint="Optional">
<Input id="place-fee" name="entryFee" defaultValue={record?.entryFee ?? ""} placeholder="Free" />
</Field>
<Field label="Best time" htmlFor="place-best" hint="Optional">
<Input id="place-best" name="bestTime" defaultValue={record?.bestTime ?? ""} placeholder="November to February" />
</Field>
</div>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending || imageUploading}>
{pending ? "Saving…" : record ? "Save changes" : "Create place"}
</Button>
</form>
); }
