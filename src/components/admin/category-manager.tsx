"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { AnimatedDialog } from "@/components/ui/animated-dialog";
import { Icon } from "@/components/ui/icons";

export function CategoryManager({
  placeCategories,
  newsCategories,
  institutionCategories,
  hospitalCategories,
  governmentServiceCategories,
}: {
  placeCategories: ContentCategory[];
  newsCategories: ContentCategory[];
  institutionCategories: ContentCategory[];
  hospitalCategories: ContentCategory[];
  governmentServiceCategories: ContentCategory[];
}) {
  return (
    <div className="space-y-8">
      <CategorySection section="place" title="Place categories" categories={placeCategories} />
      <CategorySection section="news" title="News categories" categories={newsCategories} />
      <CategorySection
        section="institution"
        title="Institution categories"
        categories={institutionCategories.filter((category) => {
          const value = category.value.toLowerCase().replace(/[^a-z0-9]/g, "");
          const name = category.name.toLowerCase();
          return !(
            ["hospital", "healthcare", "healthcentre", "healthcenter", "clinic", "diagnosticcenter"].includes(value) ||
            /hospital|health\s*care|health\s*cent(re|er)|clinic|diagnostic\s*cent(re|er)/i.test(name)
          );
        })}
      />
      <CategorySection section="hospital" title="Hospital categories" categories={hospitalCategories} />
      <CategorySection section="government-service" title="Government Service categories" categories={governmentServiceCategories} />
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  useFormStateToast(updateState);
  useFormStateToast(deleteState);

  useEffect(() => {
    if (updateState.success) router.refresh();
  }, [router, updateState]);

  useEffect(() => {
    if (deleteState.success) {
      setConfirmDelete(false);
      router.refresh();
    }
  }, [deleteState, router]);

  return (
    <>
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
        <Button
          type="button"
          variant="secondary"
          disabled={deleting}
          onClick={() => setConfirmDelete(true)}
          className="text-red-700 hover:text-red-800"
        >
          Delete
        </Button>
      </div>

      <AnimatedDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        label="Confirm category deletion"
        panelClassName="max-w-md"
      >
        <div className="space-y-5 pt-2">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <Icon name="alert" className="h-5 w-5" />
            </div>
            <div className="pr-5">
              <h2 className="text-lg font-semibold text-slate-900">Delete category?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">“{category.name}”</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>
          {deleteState.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{deleteState.error}</p>}
          <form action={deleteAction} className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <input type="hidden" name="section" value={category.section} />
            <input type="hidden" name="value" value={category.value} />
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="submit" disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">
              {deleting ? "Deleting…" : "Yes, delete category"}
            </Button>
          </form>
        </div>
      </AnimatedDialog>
    </>
  );
}
