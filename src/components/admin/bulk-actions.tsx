"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminBulkRecordAction } from "@/features/admin/actions";

type Item = { id: string; label: string; status?: string };
type Entity = "place" | "institution" | "hospital" | "service" | "news" | "business" | "post" | "donor" | "review";
type SelectionContextValue = { selected: string[]; toggle: (id: string, checked: boolean) => void };
const SelectionContext = createContext<SelectionContextValue | null>(null);

export function BulkSelectCheckbox({ id, label }: { id: string; label?: string }) {
  const context = useContext(SelectionContext);
  if (!context) return null;
  return (
    <input
      type="checkbox"
      checked={context.selected.includes(id)}
      onChange={(event) => context.toggle(id, event.target.checked)}
      aria-label={label ? `Select ${label}` : "Select record"}
      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-700 accent-brand-700 focus:ring-brand-600"
    />
  );
}

export function BulkActions({ entity, records, children }: { entity: Entity; records: Item[]; children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const allSelected = records.length > 0 && records.every((item) => selected.includes(item.id));
  const toggle = (id: string, checked: boolean) => {
    setSelected((current) => checked ? (current.includes(id) ? current : [...current, id]) : current.filter((value) => value !== id));
    setMessage("");
  };
  const toggleAll = (checked: boolean) => {
    setSelected(checked ? records.map((item) => item.id) : []);
    setMessage("");
  };
  function run(operation: "hide" | "unhide" | "delete") {
    if (!selected.length) return;
    const verb = operation === "delete" ? "permanently delete" : operation === "hide" ? "hide" : "unhide";
    if (!window.confirm(`Are you sure you want to ${verb} ${selected.length} selected record(s)?${operation === "delete" ? " This cannot be undone." : ""}`)) return;
    startTransition(async () => {
      try {
        const result = await adminBulkRecordAction(entity, selected, operation);
        setMessage(`${result.processed} record(s) processed.${result.errors.length ? " Some actions failed: " + result.errors.slice(0, 3).join("; ") : ""}`);
        if (result.processed) { setSelected([]); router.refresh(); }
      } catch {
        setMessage("Bulk action failed. Please try again.");
      }
    });
  }
  return (
    <SelectionContext.Provider value={{ selected, toggle }}>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={allSelected} onChange={(event) => toggleAll(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-700 focus:ring-brand-600" />
            Select All
          </label>
          <span className="text-sm text-slate-500">Total Items: <strong className="text-slate-800">{records.length}</strong></span>
          <span className="text-sm text-slate-500">Selected Items: <strong className="text-brand-700">{selected.length}</strong></span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending || !selected.length} onClick={() => run("hide")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40">Hide Selected</button>
          <button type="button" disabled={pending || !selected.length} onClick={() => run("unhide")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40">Unhide Selected</button>
          <button type="button" disabled={pending || !selected.length} onClick={() => run("delete")} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40">{pending ? "Working…" : "Delete Selected"}</button>
        </div>
        {message && <p role="status" className="text-xs text-slate-600 sm:basis-full">{message}</p>}
      </div>
      {entity === "donor" && <p className="mb-3 text-xs text-amber-700">Restoring a donor record does not restore public listing consent. The donor must have valid consent to appear publicly.</p>}
      {children}
    </SelectionContext.Provider>
  );
}
