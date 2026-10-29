"use client";
import { useActionState } from "react";
import { createNewsAction, type AdminFormState } from "@/features/admin/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { ImageUpload } from "@/components/forms/image-upload"; import { useFormStateToast } from "@/components/ui/toast";
import type { ContentCategory } from "@/services/content-categories";
export function StaffNewsForm({ categories, userId }: { categories: ContentCategory[]; userId?: string }) {
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
createNewsAction as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
useFormStateToast(state);
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Post news</h2>
<p className="text-sm text-slate-600">Articles posted here are published immediately.</p>
<Field label="Headline" htmlFor="staff-title" required>
<Input id="staff-title" name="title" required />
</Field>
<Field label="Summary" htmlFor="staff-excerpt" required>
<Input id="staff-excerpt" name="excerpt" required />
</Field>
<Field label="Category" htmlFor="staff-category" required>
<select id="staff-category" name="category" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring">
<option value="">Select category</option>
{categories.map((category) => (
<option key={category.value} value={category.value}>{category.name}</option>
))}
</select>
</Field>
<Field label="Article" htmlFor="staff-body" required>
<Textarea id="staff-body" name="body" className="min-h-[160px]" required />
</Field>
<ImageUpload name="image" label="Article image" hint="Optional — upload an image from your device (max 5 MB)" userId={userId} storageFolder="news" />
<Field label="Source (optional)" htmlFor="staff-source">
<Input id="staff-source" name="source" placeholder="e.g. Prothom Alo" />
</Field>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish news"}</Button>
</form>
); }
