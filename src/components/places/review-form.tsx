"use client";
import { useActionState } from "react";
import { createReviewAction, type ReviewFormState } from "@/features/places/actions"; import { Button } from "@/components/ui/button"; import { Input, Textarea } from "@/components/ui/input"; import { useFormStateToast } from "@/components/ui/toast";
export function ReviewForm({ placeId, slug }: { placeId: string; slug: string }) {
const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(createReviewAction, {});
useFormStateToast(state);
return (
<form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-5">
<input type="hidden" name="placeId" value={placeId} />
<input type="hidden" name="slug" value={slug} />
<h3 className="font-semibold text-slate-900">Write a review</h3>
<div className="mt-4">
<label htmlFor="rating" className="mb-1.5 block text-sm font-medium text-slate-700">Rating</label>
<select
id="rating"
name="rating"
defaultValue="5"
className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring"
>
{[5, 4, 3, 2, 1].map((value) => (
<option key={value} value={value}>{value} stars</option>
))}
</select>
</div>
<div className="mt-4">
<label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
<Input id="title" name="title" placeholder="Summarize your visit" />
</div>
<div className="mt-4">
<label htmlFor="body" className="mb-1.5 block text-sm font-medium text-slate-700">Review</label>
<Textarea id="body" name="body" placeholder="What did you like? What should others know?" />
</div>
{state.error && <p role="alert" className="mt-3 text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="mt-3 text-sm text-emerald-600">{state.success}</p>}
<div className="mt-4">
<Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Submit review"}</Button>
</div>
</form>
); }
