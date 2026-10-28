"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  adminCreateInstitutionAction,
  adminUpdateInstitutionAction,
  type AdminFormState,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { LocationFields } from "@/components/forms/location-fields";
import { ImageUpload } from "@/components/forms/image-upload";
import { useFormStateToast } from "@/components/ui/toast";
import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters";
import type { Institution } from "@/types/content";

const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring";

type Props = {
  divisions: LocationOption[];
  districts: DistrictOption[];
  upazilas: UpazilaOption[];
  categories: { value: string; label: string }[];
  isHospital: boolean;
  userId: string;
  record?: Institution;
};

export function InstitutionForm({ divisions, districts, upazilas, categories, isHospital, userId, record }: Props) {
  const action = record ? adminUpdateInstitutionAction : adminCreateInstitutionAction;
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    action as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  useFormStateToast(state);

  useEffect(() => {
    if (state.success) {
      setImageChanged(false);
      if (!record) {
        formRef.current?.reset();
        setResetKey((key) => key + 1);
      }
    }
  }, [record, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{record ? (isHospital ? "Update hospital" : "Update institution") : (isHospital ? "Add a hospital" : "Add an institution")}</h2>
      {!record && <p className="text-sm text-slate-600">New listings are published immediately and marked as verified.</p>}
      <input type="hidden" name="isHospital" value={isHospital ? "true" : "false"} />
      {record && <input type="hidden" name="id" value={record.id} />}
      <input type="hidden" name="imageChanged" value={imageChanged ? "true" : "false"} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="institution-name" required>
          <Input id="institution-name" name="name" required defaultValue={record?.name ?? ""} placeholder="e.g. Dhaka Medical College" />
        </Field>
        <Field label="Category" htmlFor="institution-category" required>
          <select id="institution-category" name="category" required defaultValue={record?.category ?? ""} className={selectClass}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description" htmlFor="institution-description" required>
        <Textarea id="institution-description" name="description" className="min-h-[110px]" required defaultValue={record?.description ?? ""} />
      </Field>
      <Field label="Full address" htmlFor="institution-address" required>
        <Input id="institution-address" name="address" required defaultValue={record?.address ?? ""} placeholder="Street, area, city" />
      </Field>
      <LocationFields
        key={`location-${resetKey}`}
        divisions={divisions}
        districts={districts}
        upazilas={upazilas}
        current={{
          divisionId: record?.divisionId ?? undefined,
          districtId: record?.districtId ?? undefined,
          upazilaId: record?.upazilaId ?? undefined,
        }}
      />
      <ImageUpload
        key={`image-${resetKey}`}
        name="image"
        label={isHospital ? "Hospital image" : "Institution image"}
        hint="Upload an image, or leave the current image unchanged."
        current={record?.image}
        userId={userId}
        storageFolder="institutions"
        onValueChange={() => setImageChanged(true)}
        onUploadingChange={setImageUploading}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="institution-phone" hint="Optional">
          <Input id="institution-phone" name="phone" defaultValue={record?.phone ?? ""} placeholder="02-0000-0000" />
        </Field>
        <Field label="Emergency phone" htmlFor="institution-emergency-phone" hint="Optional">
          <Input id="institution-emergency-phone" name="emergencyPhone" defaultValue={record?.emergencyPhone ?? ""} placeholder="199" />
        </Field>
        <Field label="Email" htmlFor="institution-email" hint="Optional">
          <Input id="institution-email" name="email" type="email" defaultValue={record?.email ?? ""} placeholder="info@example.org" />
        </Field>
        <Field label="Website" htmlFor="institution-website" hint="Optional">
          <Input id="institution-website" name="website" defaultValue={record?.website ?? ""} placeholder="https://example.org" />
        </Field>
      </div>
      {state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
      <Button type="submit" disabled={pending || imageUploading}>
        {pending ? "Saving…" : record ? "Save changes" : isHospital ? "Create hospital" : "Create institution"}
      </Button>
    </form>
  );
}
