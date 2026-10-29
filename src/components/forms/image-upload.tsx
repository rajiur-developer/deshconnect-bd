"use client";
import { useRef, useState } from "react";
 import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
 import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
 import { Icon } from "@/components/ui/icons";
 export function ImageUpload({
 name,
 label,
 hint,
 current,
 userId,
 storageFolder,
 onValueChange,
 onUploadingChange, }: {
 name: string;
 label: string;
 hint?: string;
 current?: string | null;
 userId?: string;
 storageFolder?: string;
 onValueChange?: (value: string) => void;
 onUploadingChange?: (uploading: boolean) => void;
 }) {
 const uploadToStorage = Boolean(userId && storageFolder);
 const inputRef = useRef<HTMLInputElement>(null);
 const [value, setValue] = useState(uploadToStorage ? "" : current ?? "");
 const [preview, setPreview] = useState(current ?? "");
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 async function handleFile(file: File) {
 if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
 setError("Choose a JPG, PNG, or WebP image.");
 return;
 }
 if (file.size < 1 || file.size > 5 * 1024 * 1024) {
 setError("Image must be 5 MB or smaller.");
 return;
 }
 setError("");
 setBusy(true);
 onUploadingChange?.(true);
 try {
 if (uploadToStorage && userId && storageFolder) {
 const image = await resizeToBlob(file);
 const key = `${userId}/${storageFolder}/${crypto.randomUUID()}.jpg`;
 const { data, error: uploadError } = await getInsForgeBrowserClient()
   .storage.from(COMMUNITY_POST_IMAGE_BUCKET).upload(key, image);
 if (uploadError) throw new Error(uploadError.message);
 if (!data?.url || !data.key) throw new Error("Image upload did not return a URL and storage key.");
 setValue(data.url);
 onValueChange?.(data.url);
 setPreview(URL.createObjectURL(image));
 } else {
 const dataUrl = await resizeToDataUrl(file);
 if (!dataUrl) throw new Error("This image could not be read. Please choose another image.");
 setValue(dataUrl);
 onValueChange?.(dataUrl);
 setPreview(dataUrl);
 }
 } catch (cause) {
 setError(cause instanceof Error ? cause.message : "Image upload failed. Please try again.");
 } finally {
 setBusy(false);
 onUploadingChange?.(false);
 }
 }
 return (
 <div>
 <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
<input type="hidden" name={name} value={value} />
<div className="flex items-center gap-3">
<button
type="button"
disabled={busy}
onClick={() => inputRef.current?.click()}
className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-ring disabled:cursor-wait disabled:opacity-60"
>
<Icon name="edit" className="h-4 w-4" />
{busy ? "Uploading…" : preview ? "Change image" : "Select image"}
</button>
<input
ref={inputRef}
type="file"
accept="image/jpeg,image/png,image/webp"
className="hidden"
onChange={(event) => {
const file = event.target.files?.[0];
if (file) void handleFile(file);
event.target.value = "";
}}
/>
{preview ? (
<img src={preview} alt={label} className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
) : (
<span className="text-sm text-slate-400">No image selected</span>
)}
{value && (
<button
type="button"
disabled={busy}
onClick={() => {
setValue("");
onValueChange?.("");
setPreview("");
setError("");
}}
className="text-xs font-medium text-accent-600 hover:underline disabled:opacity-60"
>
Remove
</button>
)}
</div>
{error && <p role="alert" className="mt-1 text-xs text-accent-600">{error}</p>}
{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
</div>
); }
function resizeToBlob(file: File): Promise<Blob> {
return new Promise((resolve, reject) => {
const url = URL.createObjectURL(file);
const img = new Image();
img.onload = () => {
const max = 1200;
const scale = Math.min(1, max / Math.max(img.width, img.height));
const canvas = document.createElement("canvas");
canvas.width = Math.max(1, Math.round(img.width * scale));
canvas.height = Math.max(1, Math.round(img.height * scale));
const ctx = canvas.getContext("2d");
URL.revokeObjectURL(url);
if (!ctx) {
reject(new Error("This image could not be resized."));
return;
}
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("This image could not be encoded.")), "image/jpeg", 0.8);
};
img.onerror = () => {
URL.revokeObjectURL(url);
reject(new Error("This image could not be read. Please choose another image."));
};
img.src = url;
});
}
function resizeToDataUrl(file: File): Promise<string> {
return new Promise((resolve) => {
const url = URL.createObjectURL(file);
const img = new Image();
img.onload = () => {
const max = 1200;
const scale = Math.min(1, max / Math.max(img.width, img.height));
const canvas = document.createElement("canvas");
canvas.width = Math.max(1, Math.round(img.width * scale));
canvas.height = Math.max(1, Math.round(img.height * scale));
const ctx = canvas.getContext("2d");
if (!ctx) {
URL.revokeObjectURL(url);
resolve("");
return;
}
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
URL.revokeObjectURL(url);
resolve(canvas.toDataURL("image/jpeg", 0.8));
};
img.onerror = () => {
URL.revokeObjectURL(url);
resolve("");
};
img.src = url;
}); }
