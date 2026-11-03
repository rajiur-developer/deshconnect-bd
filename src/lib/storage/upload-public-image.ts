"use client";

export type PublicImagePurpose = "profile" | "community" | "news" | "directory";
export type DirectoryImageFolder = "places" | "institutions" | "hospitals" | "businesses" | "news";

type UploadResult = { url: string; key: string };

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: string };
    return body.error || "Image upload failed. Please try again.";
  } catch {
    return "Image upload failed. Please try again.";
  }
}

/** Uploads a public image directly to R2 using a short-lived, user-scoped URL. */
export async function uploadPublicImage(
  file: File,
  purpose: PublicImagePurpose,
  directoryFolder?: DirectoryImageFolder,
): Promise<UploadResult> {
  const createResponse = await fetch("/api/media/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      purpose,
      directoryFolder,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  if (!createResponse.ok) throw new Error(await readError(createResponse));
  const upload = await createResponse.json() as {
    uploadUrl: string;
    headers: Record<string, string>;
    key: string;
  };

  const putResponse = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: upload.headers,
    body: file,
  });
  if (!putResponse.ok) throw new Error("Cloudflare R2 upload failed. Check the bucket CORS settings and try again.");

  const completeResponse = await fetch("/api/media/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "complete",
      purpose,
      directoryFolder,
      key: upload.key,
      contentType: file.type,
    }),
  });
  if (!completeResponse.ok) throw new Error(await readError(completeResponse));
  const completed = await completeResponse.json() as UploadResult;
  return completed;
}
