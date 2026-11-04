"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeletePlaceAction,
  adminDeleteInstitutionAction,
  adminDeleteServiceAction,
  adminSetBusinessStatusAction,
  adminSetInstitutionStatusAction,
  adminSetPlaceStatusAction,
  adminSetServiceStatusAction,
  deleteBusinessAction,
} from "@/features/admin/actions";
import { useToast } from "@/components/ui/toast";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
import { Icon } from "@/components/ui/icons";

/** Consistent hide, edit and delete controls for admin directory records. */
export function RecordActions({
  entity,
  id,
  status,
  children,
}: {
  entity: "place" | "business" | "service" | "institution" | "hospital";
  id: string;
  status: string;
  children?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { success, error } = useToast();
  const hidden = status === "archived";

  const run = (promise: Promise<unknown>, message: string) =>
    startTransition(async () => {
      try {
        const result = await promise;
        if (result && typeof result === "object" && "ok" in result && result.ok === false) {
          error("error" in result && typeof result.error === "string" ? result.error : "That action failed.");
          return;
        }
        success(message);
        router.refresh();
      } catch (cause) {
        error(cause instanceof Error ? cause.message : "That action failed.");
      }
    });

  const toggleHide = () => {
    const next = hidden ? "published" : "archived";
    const promise =
      entity === "place"
        ? adminSetPlaceStatusAction(id, next)
        : entity === "business"
          ? adminSetBusinessStatusAction(id, next)
          : entity === "service"
            ? adminSetServiceStatusAction(id, next)
            : adminSetInstitutionStatusAction(id, next, entity === "hospital" ? "hospital" : "institution");
    run(promise, hidden ? "Record restored." : "Record hidden.");
  };

  const confirmRemove = () => {
    setConfirmDelete(false);
    const promise =
      entity === "place"
        ? adminDeletePlaceAction(id)
        : entity === "business"
          ? deleteBusinessAction(id)
          : entity === "service"
            ? adminDeleteServiceAction(id)
            : adminDeleteInstitutionAction(id, entity === "hospital" ? "hospital" : "institution");
    run(promise, "Record deleted.");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={toggleHide}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-60"
        >
          {hidden ? "Unhide" : "Hide"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(true)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
        >
          <Icon name="trash" className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      {children && (
        <AnimatedDialog open={editing} onClose={() => setEditing(false)} label={`Update ${entity}`} panelClassName="max-w-2xl">
          {children}
        </AnimatedDialog>
      )}

      <AnimatedDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} label="Confirm permanent deletion" panelClassName="max-w-md p-0">
        <div className="p-6 sm:p-7">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <Icon name="trash" className="h-6 w-6" />
          </div>
          <h2 className="pr-7 text-lg font-bold tracking-tight text-slate-900">Confirm permanent deletion</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Are you sure you want to permanently delete this {entity} record? This action cannot be undone.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Icon name="close" className="h-4 w-4" /> Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirmRemove}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="trash" className="h-4 w-4" /> Yes, Delete
            </button>
          </div>
        </div>
      </AnimatedDialog>
    </>
  );
}
