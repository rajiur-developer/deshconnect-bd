"use client";
import { useActionState, useState } from "react";
import { addLocationAction, type AdminFormState } from "@/features/admin/actions"; import { LOCATION_IMAGES } from "@/lib/constants"; import { Button } from "@/components/ui/button"; import { Field, Input } from "@/components/ui/input";
const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";
type Props = {
divisions: { id: string; name: string }[];
districts: { id: string; name: string; divisionId: string }[]; };
export function LocationAddForm({ divisions, districts }: Props) {
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
addLocationAction as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
const [category, setCategory] = useState("division");
const [parentId, setParentId] = useState("");
const parentOptions = category === "district" ? divisions : category === "upazila" ? districts : [];
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Add a location</h2>
<p className="text-sm text-slate-600">Admin only. Adds a division, district or upazila.</p>
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Category" htmlFor="location-category" required>
<select
id="location-category"
name="category"
required
value={category}
onChange={(event) => {
setCategory(event.target.value);
setParentId("");
}}
className={selectClass}
>
<option value="division">Division</option>
<option value="district">District</option>
<option value="upazila">Upazila</option>
</select>
</Field>
<Field label="Name" htmlFor="location-name" required>
<Input id="location-name" name="name" required placeholder="e.g. Rangpur" />
</Field>
</div>
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Title" htmlFor="location-title" hint="Optional — Bengali name or summary">
<Input id="location-title" name="title" placeholder="Rangpur" />
</Field>
<Field label="Image" htmlFor="location-image" hint="Optional">
<select id="location-image" name="image" className={selectClass}>
{LOCATION_IMAGES.map((image) => (
<option key={image} value={image}>{image}</option>
))}
</select>
</Field>
</div>
{category !== "division" && (
<Field label={category === "district" ? "Parent division" : "Parent district"} htmlFor="location-parent" required>
<select
id="location-parent"
name="parentId"
required
value={parentId}
onChange={(event) => setParentId(event.target.value)}
className={selectClass}
>
<option value="">Select parent</option>
{parentOptions.map((option) => (
<option key={option.id} value={option.id}>{option.name}</option>
))}
</select>
</Field>
)}
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add location"}</Button>
</form>
); }
