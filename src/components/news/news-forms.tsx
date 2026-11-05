"use client";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { uploadPublicImage } from "@/lib/storage/upload-public-image";
import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import { optimizeImageForUpload } from "@/lib/images/optimize-upload";
import { submitNewsAction, type NewsFormState } from "@/features/news/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { useFormStateToast } from "@/components/ui/toast";
import type { ContentCategory } from "@/services/content-categories";
export function NewsSubmitForm({ userId, categories }: { userId: string; categories: ContentCategory[] }) {
const { t } = useLanguage();
const [state, formAction, pending] = useActionState<NewsFormState, FormData>(submitNewsAction, {});
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [preview, setPreview] = useState("");
const formRef = useRef<HTMLFormElement>(null);
const fileRef = useRef<HTMLInputElement>(null);
const imageRef = useRef<HTMLInputElement>(null);
const imageKeyRef = useRef<HTMLInputElement>(null);
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
if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadError(t("Choose a JPG, PNG, or WebP image.")); return; }
if (file.size < 1 || file.size > 5 * 1024 * 1024) { setUploadError(t("Image must be 5 MB or smaller.")); return; }
uploadBusy.current = true;
setUploading(true);
try {
const optimized = await optimizeImageForUpload(file);
let uploaded: { url: string; key: string };
if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  uploaded = await uploadPublicImage(new File([optimized], file.name, { type: optimized.type }), "news");
} else {
  const filename = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "news-image";
  const extension = optimized.type === "image/webp" ? "webp" : "jpg";
  const key = `${userId}/news/${crypto.randomUUID()}-${filename.replace(/\\.[^.]+$/, "")}.${extension}`;
  const { data, error } = await getInsForgeBrowserClient().storage.from(COMMUNITY_POST_IMAGE_BUCKET).upload(key, optimized);
  if (error || !data?.url || !data?.key) throw new Error(t("Image upload failed. Please try again."));
  uploaded = { url: data.url, key: data.key };
}
if (imageRef.current) imageRef.current.value = uploaded.url;
if (imageKeyRef.current) imageKeyRef.current.value = uploaded.key;
setPreview(URL.createObjectURL(optimized));
fileRef.current.value = "";
submitAgain.current = true;
formRef.current?.requestSubmit();
} catch (error) {
setUploadError(error instanceof Error ? error.message : t("Image upload failed. Please try again."));
} finally {
uploadBusy.current = false;
setUploading(false);
}
}
return (
<form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<input ref={imageRef} type="hidden" name="image" />
<input ref={imageKeyRef} type="hidden" name="imageKey" />
<h2 className="font-semibold text-slate-900">Submit news</h2>
<Field label=t("Headline") htmlFor="news-title" required>
<Input id="news-title" name="title" required />
</Field>
<Field label=t("Excerpt") htmlFor="news-excerpt" required>
<Input id="news-excerpt" name="excerpt" required />
</Field>
<Field label=t("Category") htmlFor="news-category" required>
<select id="news-category" name="category" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring">
<option value="">Select category</option>
{categories.map((category) => (
<option key={category.value} value={category.value}>{category.name}</option>
))}
</select>
</Field>
<Field label=t("Article") htmlFor="news-body" required>
<Textarea id="news-body" name="body" className="min-h-[160px]" required />
</Field>
<div>
<label htmlFor="news-image" className="mb-1.5 block text-sm font-medium text-slate-700">Article image</label>
<input ref={fileRef} id="news-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.currentTarget.files?.[0]; setUploadError(""); setPreview(file ? URL.createObjectURL(file) : ""); if (!file) { if (imageRef.current) imageRef.current.value = ""; if (imageKeyRef.current) imageKeyRef.current.value = ""; } }} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700" />
<p className="mt-1 text-xs text-slate-500">Optional — JPG, PNG, or WebP up to 5 MB</p>
{preview && <img src={preview} alt=t("Article image preview") className="mt-3 h-24 rounded-lg object-cover" />}
{uploadError && <p role="alert" className="mt-2 text-sm text-accent-600">{t(uploadError)}</p>}
</div>
<Field label=t("Source (optional)") htmlFor="news-source">
<Input id="news-source" name="source" placeholder=t("e.g. Prothom Alo") />
</Field>
{state.error && <p role="alert" className="text-sm text-accent-600">{t(state.error)}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{t(state.success)}</p>}
<Button type="submit" disabled={pending || uploading}>{uploading ? t("Uploading image…") : pending ? t("Submitting…") : t("Submit for review")}</Button>
</form>
); }
