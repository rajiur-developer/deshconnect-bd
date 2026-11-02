"use client";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import { optimizeImageForUpload } from "@/lib/images/optimize-upload";
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
if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setUploadError("Choose a JPG,...[truncated]