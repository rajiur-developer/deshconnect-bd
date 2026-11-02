"use client";
import { useRef, useState } from "react";
 import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
 import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { optimizeImageForUpload } from "@/lib/images/optimize-upload";
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
 if (!dataUrl) throw new Error("This image could not be read. Pl...[truncated]