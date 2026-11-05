"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { optimizeImageForUpload } from "@/lib/images/optimize-upload";
import { createRecordAction, type RecordFormState } from "@/features/records/actions";
import { RECORD_ATTACHMENT_BUCKET, RECORD_ATTACHMENT_MAX_BYTES, RECORD_ATTACHMENT_TYPES } from "@/features/records/constants";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useLanguage } from "@/components/i18n/language-provider";

function safeFilename(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100);
  return cleaned || "attachment";
}

export function RecordForm({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [state, action, pending] = useActionState<RecordFormState, FormData>(createRecordAction, {});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const mimeRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);
  const submitAfterUpload = useRef(false);
  const uploadInProgress = useRef(false);

  useEffect(() => {
    if (state.error || state.success) {
      if (urlRef.current) urlRef.current.value = "";
      if (keyRef.current) keyRef.current.value = "";
      if (nameRef.current) nameRef.current.value = "";
      if (mimeRef.current) mimeRef.current.value = "";
      if (sizeRef.current) sizeRef.current.value = "";
    }
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitAfterUpload.current) {
      submitAfterUpload.current = false;
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    event.preventDefault();
    if (uploadInProgress.current) return;
    setUploadError("");
    if (!RECORD_ATTACHMENT_TYPES.includes(file.type as (typeof RECORD_ATTACHMENT_TYPES)[number])) {
      setUploadError(t("Choose a JPG, JPEG, or PNG image."));
      return;
    }
    if (file.size < 1 || file.size > RECORD_ATTACHMENT_MAX_BYTES) {
      setUploadError(t("The file must be 5 MB or smaller."));
      return;
    }

    uploadInProgress.current = true;
    setUploading(true);
    try {
      const client = getInsForgeBrowserClient();
      const optimizedImage = await optimizeImageForUpload(file);
      const optimizedFile = new File([optimizedImage], `attachment.${optimizedImage.type === "image/webp" ? "webp" : "jpg"}`, { type: optimizedImage.type });
      const key = `${userId}/${crypto.randomUUID()}-${safeFilename(optimizedFile.name)}`;
      const { data, error } = await client.storage.from(RECORD_ATTACHMENT_BUCKET).upload(key, optimizedFile);
      if (error || !data?.url || !data?.key) {
        setUploadError(t("File upload failed. Please try again."));
        return;
      }

      if (urlRef.current) urlRef.current.value = data.url;
      if (keyRef.current) keyRef.current.value = data.key;
      if (nameRef.current) nameRef.current.value = file.name.slice(0, 180);
      if (mimeRef.current) mimeRef.current.value = optimizedFile.type;
      if (sizeRef.current) sizeRef.current.value = String(optimizedFile.size);
      if (fileInputRef.current) fileInputRef.current.value = "";

      submitAfterUpload.current = true;
      formRef.current?.requestSubmit();
    } catch {
      setUploadError(t("File upload failed. Please try again."));
    } finally {
      uploadInProgress.current = false;
      setUploading(false);
    }
  }

  return <form ref={formRef} action={action} onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-900">{t("Add a record")}</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label={t("Title")} htmlFor="title" required><Input id="title" name="title" required minLength={2} maxLength={120} /></Field>
      <Field label={t("Category")} htmlFor="category" required><Input id="category" name="category" required maxLength={40} placeholder={t("e.g. announcement")} /></Field>
    </div>
    <div className="mt-4"><Field label={t("Description")} htmlFor="description"><textarea id="description" name="description" maxLength={2000} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" /></Field></div>
    <div className="mt-4">
      <Field label={t("Attachment (optional)")} htmlFor="attachment">
        <input ref={fileInputRef} id="attachment" name="attachment" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-medium file:text-brand-700 hover:file:bg-brand-100" />
      </Field>
      <p className="mt-1 text-xs text-slate-500">{t("JPG, JPEG, or PNG · max 5 MB. Private to your account.")}</p>
    </div>
    <input ref={urlRef} type="hidden" name="attachment_url" />
    <input ref={keyRef} type="hidden" name="attachment_key" />
    <input ref={nameRef} type="hidden" name="attachment_name" />
    <input ref={mimeRef} type="hidden" name="attachment_mime_type" />
    <input ref={sizeRef} type="hidden" name="attachment_size" />
    {(state.error || uploadError) && <p role="alert" className="mt-3 text-sm text-accent-600">{t(uploadError || state.error)}</p>}
    {state.success && <p role="status" className="mt-3 text-sm text-emerald-700">{t(state.success)}</p>}
    <div className="mt-4"><Button type="submit" disabled={pending || uploading}>{uploading ? t("Uploading…") : pending ? t("Saving…") : t("Save record")}</Button></div>
  </form>;
}
