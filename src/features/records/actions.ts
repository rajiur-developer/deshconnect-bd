"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isTrustedSupabaseStorageUrl } from "@/lib/storage/media-url";
import { requireUser } from "@/lib/auth/current-user";
import { RECORD_ATTACHMENT_BUCKET, RECORD_ATTACHMENT_MAX_BYTES, RECORD_ATTACHMENT_TYPES } from "@/features/records/constants";

export type RecordFormState = { error?: string; success?: string };

export async function createRecordAction(_previous: RecordFormState, formData: FormData): Promise<RecordFormState> {
  const user = await requireUser("/my-records");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (title.length < 2 || title.length > 120) return { error: "Title must be between 2 and 120 characters." };
  if (!category || category.length > 40) return { error: "Choose a valid category." };
  if (description.length > 2000) return { error: "Description must be 2,000 characters or fewer." };

  const attachmentUrl = String(formData.get("attachment_url") ?? "").trim();
  const attachmentKey = String(formData.get("attachment_key") ?? "").trim();
  const attachmentName = String(formData.get("attachment_name") ?? "").trim();
  const attachmentMimeType = String(formData.get("attachment_mime_type") ?? "").trim();
  const attachmentSize = Number(formData.get("attachment_size") ?? 0);
  const hasAttachment = Boolean(attachmentUrl || attachmentKey || attachmentName || attachmentMimeType || attachmentSize);

  if (hasAttachment) {
    let urlIsTrusted = false;
    try {
      const expectedOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
      urlIsTrusted = new URL(attachmentUrl).origin === expectedOrigin
        && isTrustedSupabaseStorageUrl(attachmentUrl, attachmentKey, [RECORD_ATTACHMENT_BUCKET], "private");
    } catch {
      urlIsTrusted = false;
    }
    const safeKey = attachmentKey.startsWith(`${user.id}/`)
      && attachmentKey.split("/").length === 2
      && /^[a-zA-Z0-9._-]{1,180}$/.test(attachmentKey.split("/")[1] ?? "");
    const safeName = attachmentName.length > 0 && attachmentName.length <= 180 && !/[\\/\0]/.test(attachmentName);
    if (!attachmentUrl || !urlIsTrusted || !safeKey || !safeName
      || !RECORD_ATTACHMENT_TYPES.includes(attachmentMimeType as (typeof RECORD_ATTACHMENT_TYPES)[number])
      || !Number.isInteger(attachmentSize) || attachmentSize < 1 || attachmentSize > RECORD_ATTACHMENT_MAX_BYTES) {
      return { error: "The selected attachment is invalid. Please choose a supported file and try again." };
    }
  }

  const client = createServerClient({ cookies: await cookies() });
  const { error } = await client.database.from("sample_records").insert([{
    title,
    category,
    description: description || null,
    ...(hasAttachment ? {
      attachment_url: attachmentUrl,
      attachment_key: attachmentKey,
      attachment_name: attachmentName,
      attachment_mime_type: attachmentMimeType,
      attachment_size: attachmentSize,
    } : {}),
  }]);
  if (error) {
    if (hasAttachment) {
      await client.storage.from(RECORD_ATTACHMENT_BUCKET).remove([attachmentKey]);
    }
    return { error: "Could not save this record. Please try again." };
  }
  revalidatePath("/my-records");
  return { success: "Record saved to your account." };
}
