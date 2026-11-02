"use client";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import { optimizeImageForUpload } from "@/lib/images/optimize-upload";
import { submitNewsAction, type NewsFormState } from "@/features/news/actions"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { useFormStateToast } from "@/components/ui/toast";
import type { ContentCategory } from "@/services/content-categories";
export function NewsSubmitForm({ userId, categories }: { userId: string; categories: ContentCategory[] }) {
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
if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadError("Choose a JPG, PNG, or WebP image."); return; }
if (file.size < 1 || file.size > 5 * 1024 * 1024) { setUploadError("Image must be 5 MB or smaller."); return; }
uploadBusy.current = true;
setUploading(true);
try {
const client = getInsForgeBrowserClient();
const filename = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "news-image";
const optimize...[truncated]