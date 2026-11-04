"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminBulkRecordAction } from "@/features/admin/actions";
import { useToast } from "@/components/ui/toast";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
import { Icon } from "@/components/ui/icons";

type Item = { id: string; label: string; status?: string };
type Entity = "place" | "institution" | "hospital" | "service" | "news" | "business" | "post" | "donor" | "review";
type Operation = "hide" | "unhide" | "delete";
type SelectionContextValue = { selected: string[]; toggle: (id: string, checked: boolean) => void };
const SelectionContext = createContext<SelectionContextValue | null>(null);

const operationCopy: Record<Operation, { title: string; description: string; action: string; tone: string; icon: "trash" | "alert" }> = {
  delete: {
    title: "Confirm permanent deletion",
    description: "You are about to permanently delete the selected records. This action cannot be undone. Please review your selection before continuing.",
    action: "Yes, delete selected",
    tone: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
    icon: "trash",
  },
  hide: {
    title: "Hide selected records?",
    description: "The selected records will be moved out of the public directory. You can restore them later.",
    action: "Yes, hide records",
    tone: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
    icon: "alert",
  },
  unhide: {
    title: "Restore selected records?",
    description: "The selected records will be restored from the hidden state. Review the selection before continuing.",
    action: "Yes, restore records",
    tone: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    icon: "check",
  },
};

export function BulkSelectCheckbox({ id, label }: { id: string; label?: string }) {
  const context = useContext(SelectionContext);
  if (!context) return null;
  return (
    <input
      type="checkbox"
      checked={context.selected.includes(id)}
      onChange={(event) => context.toggle(id, event.target.checked)}
      aria-label={label ? `Select ${label}` : "Select record"}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-700 focus:ring-brand-600"
    />
  );
}

export function BulkActions({ entity, records, children }: { entity: Entity; records: Item[]; children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [confirmOperation, setConfirmOperation] = useState<Operation | null>(null);
  const { success, error } = useToast();
  const router = useRouter();
  const allSelected = records.length > 0 && records.every((item) => selected.includes(item.id));
  const someSelected = selected.length > 0 && !allSelected;

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) => checked ? (current.includes(id) ? current : [...current, id]) : current.filter((value) => value !== id));
  };
  const toggleAll = (checked: boolean) => setSelected(checked ? records.map((item) => item.id) : []);
  const requestOperation = (operation: Operation) => {
    if (selected.length) setConfirmOperation(operation);
  };

  function executeOperation() {
    if (!confirmOperation || !selected.length) return;
    const operation = confirmOperation;
    const selectedIds = [...selected];
    setConfirmOperation(null);
    startTransition(async () => {
      try {
        const result = await adminBulkRecordAction(entity, selectedIds, operation);
        if (result.processed > 0) {
          success(`${result.processed} record(s) ${operation === "delete" ? "deleted" : operation === "hide" ? "hidden" : "restored"} successfully.`);
          setSelected([]);
          router.refresh();
        }
        if (result.errors.length > 0) {
          error(`${result.errors.length} record(s) could not be processed. ${result.errors.slice(0, 2).join("; ")}`);
        } else if (result.processed === 0) {
          error("No records were processed. Please try again.");
        }
      } catch (cause) {
        error(cause instanceof Error ? cause.message : "Bulk action failed. Please try again.");
      }
    });
  }

  const copy = confirmOperation ? operationCopy[confirmOperation] : null;

  return (
    <SelectionContext.Provider value={{ selected, toggle }}>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-1 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(node) => { if (node) node.indeterminate = someSelected; }}
              onChange={(event) => toggleAll(event.target.checked)}
              aria-label="Select all records"
              className="h-4 w-4 rounded border-slate-300 accent-brand-700 focus:ring-brand-600"
            />
            Select All
          </label>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Total Items: <strong className="ml-1 tabular-nums text-slate-900">{records.length}</strong></span>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">Selected: <strong className="ml-1 tabular-nums">{selected.length}</strong></span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending || !selected.length} onClick={() => requestOperation("hide")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="eye-off" className="h-4 w-4" /> Hide Selected
          </button>
          <button type="button" disabled={pending || !selected.length} onClick={() => requestOperation("unhide")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="check" className="h-4 w-4" /> Unhide Selected
          </button>
          <button type="button" disabled={pending || !selected.length} onClick={() => requestOperation("delete")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:border-rose-700 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="trash" className="h-4 w-4" /> {pending ? "Working…" : "Delete Selected"}
          </button>
        </div>
      </div>
      {entity === "donor" && <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Restoring a donor record does not restore public listing consent. The donor must have valid consent to appear publicly.</p>}
      {children}
      <AnimatedDialog open={Boolean(confirmOperation)} onClose={() => setConfirmOperation(null)} label={copy?.title ?? "Confirm action"} panelClassName="max-w-md p-0">
        {copy && (
          <div className="p-6 sm:p-7">
            <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${confirmOperation === "delete" ? "bg-rose-50 text-rose-600" : confirmOperation === "hide" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
              <Icon name={copy.icon} className="h-6 w-6" />
            </div>
            <h2 className="pr-7 text-lg font-bold tracking-tight text-slate-900">{copy.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy.description}</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Selected records: <strong className="text-slate-900">{selected.length}</strong>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmOperation(null)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <Icon name="close" className="h-4 w-4" /> Cancel
              </button>
              <button type="button" disabled={pending} onClick={executeOperation} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${copy.tone}`}>
                <Icon name={copy.icon} className="h-4 w-4" /> {copy.action}
              </button>
            </div>
          </div>
        )}
      </AnimatedDialog>
    </SelectionContext.Provider>
  );
}
