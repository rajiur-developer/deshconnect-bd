"use client";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import {
createCommentAction,
createPostAction,
reportAction,
type CommunityFormState, } from "@/features/community/actions"; import { Button } from "@/components/ui/button"; import { Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters";
type LocationProps = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[]; };
export function PostForm({ divisions, districts, upazilas, userId }: LocationProps & { userId: string }) {
const [state, formAction, pending] = useActionState<CommunityFormState, FormData>(createPostAction, {});
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [preview, setPreview] = useState("");
const formRef = useRef<HTMLFormElement>(null);
const fileRef = useRef<HTMLInputElement>(null);
const imageUrlRef = useRef<HTMLInputElement>(null);
const imageKeyRef = useRef<HTMLInputElement>(null);
const imageMimeRef = useRef<HTMLInputElement>(null);
const imageSizeRef = useRef<HTMLInputElement>(null);
const submitAgain = useRef(false);
const uploadBusy = useRef(false);
useFormStateToast(state);
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
if (submitAgain.current) { submitAgain.current = false; return; }
const file = fileRef.current?.files?.[0];
if (!file) return;
event.preventDefault();
if (uploadBusy.current) return;
setUploadError("");
if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadError("Choose a JPG, PNG, or WebP image."); return; }
if (file.size < 1 || file.size > 3 * 1024 * 1024) { setUploadError("Image must be 3 MB or smaller."); return; }
uploadBusy.current = true;
setUploading(true);
try {
const client = getInsForgeBrowserClient();
const filename = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "post-image";
const key = `${userId}/${crypto.randomUUID()}-${filename}`;
const { data, error } = await client.storage.from(COMMUNITY_POST_IMAGE_BUCKET).upload(key, file);
if (error || !data?.url || !data?.key) { setUploadError("Image upload failed. Please try again."); return; }
if (imageUrlRef.current) imageUrlRef.current.value = data.url;
if (imageKeyRef.current) imageKeyRef.current.value = data.key;
if (imageMimeRef.current) imageMimeRef.current.value = file.type;
if (imageSizeRef.current) imageSizeRef.current.value = String(file.size);
setPreview(URL.createObjectURL(file));
fileRef.current.value = "";
submitAgain.current = true;
formRef.current?.requestSubmit();
} catch { setUploadError("Image upload failed. Please try again."); }
finally { uploadBusy.current = false; setUploading(false); }
}
return (
<form ref={formRef} action={formAction} onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
<input ref={imageUrlRef} type="hidden" name="image" />
<input ref={imageKeyRef} type="hidden" name="imageKey" />
<input ref={imageMimeRef} type="hidden" name="imageMimeType" />
<input ref={imageSizeRef} type="hidden" name="imageSize" />
<h2 className="font-semibold text-slate-900">Share with the community</h2>
<div className="mt-3">
<Textarea name="body" placeholder="Ask a question, give advice or start a discussion…" aria-label="Post content" />
</div>
<div className="mt-3">
<LocationFields divisions={divisions} districts={districts} upazilas={upazilas} current={{}} />
</div>
<div className="mt-3">
<label htmlFor="community-post-image" className="mb-1 block text-sm font-medium text-slate-700">Add an image (optional, up to 3 MB)</label>
<input ref={fileRef} id="community-post-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.currentTarget.files?.[0]; setUploadError(""); setPreview(file ? URL.createObjectURL(file) : ""); if (!file) { if (imageUrlRef.current) imageUrlRef.current.value = ""; if (imageKeyRef.current) imageKeyRef.current.value = ""; if (imageMimeRef.current) imageMimeRef.current.value = ""; if (imageSizeRef.current) imageSizeRef.current.value = ""; } }} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700" />
{preview && <img src={preview} alt="Post image preview" className="mt-3 max-h-48 rounded-xl object-contain" />}
{uploadError && <p role="alert" className="mt-2 text-sm text-accent-600">{uploadError}</p>}
</div>
{state.error && <p role="alert" className="mt-3 text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="mt-3 text-sm text-emerald-600">{state.success}</p>}
<div className="mt-4">
<Button type="submit" disabled={pending || uploading}>{uploading ? "Uploading image…" : pending ? "Publishing…" : "Post"}</Button>
</div>
</form>
); }
export function CommentForm({ postId }: { postId: string }) {
const [state, formAction, pending] = useActionState<CommunityFormState, FormData>(createCommentAction, {});
useFormStateToast(state);
return (
<form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-4">
<input type="hidden" name="postId" value={postId} />
<label htmlFor="comment-body" className="sr-only">Write a comment</label>
<Textarea id="comment-body" name="body" placeholder="Write a comment…" className="min-h-[80px]" />
{state.error && <p role="alert" className="mt-2 text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="mt-2 text-sm text-emerald-600">{state.success}</p>}
<div className="mt-3 flex justify-end">
<Button type="submit" size="sm" disabled={pending}>{pending ? "Publishing…" : "Comment"}</Button>
</div>
</form>
); }
export function ReportForm({
targetType,
targetId,
onDone, }: {
targetType: "post" | "comment" | "review" | "news" | "blood_request";
targetId: string;
onDone?: () => void; }) {
const [state, setState] = useState<CommunityFormState>({});
const [pending, setPending] = useState(false);
return (
<form
onSubmit={async (event) => {
event.preventDefault();
setPending(true);
const formData = new FormData(event.currentTarget);
const result = await reportAction({}, formData);
setState(result);
setPending(false);
if (result.success) onDone?.();
}}
className="rounded-2xl border border-slate-200 bg-white p-4"
>
<input type="hidden" name="targetType" value={targetType} />
<input type="hidden" name="targetId" value={targetId} />
<h3 className="font-semibold text-slate-900">Report about content</h3>
<p className="mt-1 text-sm text-slate-600">Tell us why this needs review.</p>
<div className="mt-3">
<label htmlFor="report-reason" className="mb-1 block text-sm font-medium text-slate-700">Reason</label>
<input
id="report-reason"
name="reason"
required
placeholder="e.g. spam, harassment, incorrect info"
className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring"
/>
</div>
<div className="mt-3">
<label htmlFor="report-details" className="mb-1 block text-sm font-medium text-slate-700">Details (optional)</label>
<Textarea id="report-details" name="details" className="min-h-[70px]" />
</div>
{state.error && <p role="alert" className="mt-2 text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="mt-2 text-sm text-emerald-600">{state.success}</p>}
<div className="mt-3 flex justify-end">
<Button type="submit" size="sm" variant="danger" disabled={pending}>{pending ? "Sending…" : "Submit report"}</Button>
</div>
</form>
); }
