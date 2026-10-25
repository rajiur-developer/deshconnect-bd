"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createContentCategoryAction,
  deleteContentCategoryAction,
  updateContentCategoryAction,
  type AdminFormState,
} from "@/features/admin/actions";
import type { ContentCategory, ContentCategorySection } from "@/services/content-categories";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useFormStateToast } from "@/components/ui/toast";

export function CategoryManager({
  placeCategories,
  newsCategories,
  institutionCategories,
}: {
  placeCategories: ContentCategory[];
  newsCategories: ContentCategory[];
  institutionCategories: ContentCategory[];
}) {
  return (
    <div className="space-y-8">
      <CategorySection section="place" title="Place categories" categories={placeCategories} />
      <CategorySection section="news" title="News categories" categories={newsCategories} />
      <CategorySection section="institution" title="Institution categories" categories={institutionCategories} />
    </div>
  );
}

function CategorySection({
  section,
  title,
  categories,
}: {
  section: ContentCategorySection;
  title: string;
  categories: ContentCategory[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(createContentCategoryAction, {});
  useFormStateToast(state);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="section" value={section} />
        <Field label="New category name" htmlFor={`${section}-new-category`} required>
          <Input id={`${section}-new-category`} name="name" required maxLength={80} />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add category"}</Button>
      </form>
      <div className="mt-5 divide-y divide-slate-100">
        {categories.map((category) => (
          <CategoryRow key={category.value} category={category} />
        ))}
        {categories.length === 0 && <p className="py-4 text-sm text-slate-500">No categories yet.</p>}
      </div>
    </section>
  );
}

function CategoryRow({ category }: { category: ContentCategory }) {
  const router = useRouter();
  const [updateState, updateAction, updating] = useActionState<AdminFormState, FormData>(updateContentCategoryAction, {});
  const [deleteState, deleteAction, deleting] = useActionState<AdminFormState, FormData>(deleteContentCategoryAction, {});
  useFormStateToast(updateState);
  useFormStateToast(deleteState);

  useEffect(() => {
    if (updateState.success || deleteState.success) router.refresh();
  }, [deleteState, router, updateState]);

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <form action={updateAction} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="section" value={category.section} />
        <input type="hidden" name="value" value={category.value} />
        <Field label="Category name" htmlFor={`category-${category.value}`}>
          <Input id={`category-${category.value}`} name="name" required maxLength={80} defaultValue={category.name} />
        </Field>
        <Button type="submit" variant="secondary" disabled={updating}>
          {updating ? "Saving…" : "Save"}
        </Button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete “${category.name}”?`)) event.preventDefault();
        }}
      >
        <input type="hidden" name="section" value={category.section} />
        <input type="hidden" name="value" value={category.value} />
        <Button type="submit" variant="secondary" disabled={deleting} className="text-red-700 hover:text-red-800">
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </form>
    </div>
  );
}
