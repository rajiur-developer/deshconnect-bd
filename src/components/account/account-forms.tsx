"use client";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import { sendMessageAction, updateProfileAction, type AccountFormState } from "@/features/account/actions"; import { PROFILE_IMAGE_BUCKET, PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_TYPES } from "@/features/account/constants"; import { Button } from "@/components/ui/button"; import { Field, Input, Textarea } from "@/components/ui/input"; import { LocationFields } from "@/components/forms/location-fields"; import { useFormStateToast } from "@/components/ui/toast"; import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters"; import { Icon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
type LocationProps = {
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[]; };
type ProfileProps = LocationProps & {
userId: string;
initial: {
fullName: string;
bio?: string;
phone?: string;
avatar?: string;
divisionId?: string;
districtId?: string;
upazilaId?: string;
}; };
export function ProfileEditForm({ userId, divisions, districts, upazilas, initial }: ProfileProps) {
const [state, formAction, pending] = useActionState<AccountFormState, FormData>(updateProfileAction, {});
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [preview, setPreview] = useState(initial.avatar ?? "");
const formRef = useRef<HTMLFormElement>(null);
const fileRef = useRef<HTMLInputElement>(null);
const avatarUrlRef = useRef<HTMLInputElement>(null);
const avatarKeyRef = useRef<HTMLInputElement>(null);
const avatarMimeRef = useRef<HTMLInputElement>(null);
const avatarSizeRef = useRef<HTMLInputElement>(null);
const submitAfterUpload = useRef(false);
const uploadInProgress = useRef(false);
useFormStateToast(state);
useEffect(() => { setPreview(initial.avatar ?? ""); }, [initial.avat...[truncated]