"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminBulkRecordAction } from "@/features/admin/actions";

type Item = { id: string; label: string; status?: string };
type Entity = "place" | "institution" | "hospital" | "service" | "news" | "business" | "post" | "donor";

export function BulkActions({ entity, records }: { entity: Entity; records: Item[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [operation, setOperation] = useState<"hide" | "unhide" | "delete">("hide");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const allSelected = records.length > 0 && records.every((item) => selected.includes(item.id));
  function toggleAll(checked: boolean) {
    setSelected(checked ? records.map((item) => item.id) : []);
  }
  function run() {
    if (!selected.length) { setMessage("Select at least one record."); return; }
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
  return <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Bulk actions">
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
        Select all ({records.length})
      </label>
      <span className="text-sm text-slate-600">{selected.length} selected</span>
      <select value={operation} onChange={(e) => setOperation(e.target.value as typeof operation)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" aria-label="Bulk action">
        <option value="hide">Hide selected</option>
        <option value="unhide">Unhide selected</option>
        <option value="delete">Delete selected</option>
      </select>
      <button type="button" disabled={pending || !selected.length} onClick={run} className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? "Working…" : "Bulk Actions"}</button>
    </div>
    {entity === "donor" && <p className="mt-2 text-xs text-amber-700">Restoring a donor record does not restore public listing consent. The donor must have valid consent to appear publicly.</p>}\n    <div className="mt-3 max-h-44 overflow-y-auto border-t border-slate-200 pt-2">
      {records.map((record) => <label key={record.id} className="flex items-center gap-2 py-1 text-sm text-slate-700">
        <input type="checkbox" checked={selected.includes(record.id)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, record.id] : current.filter((id) => id !== record.id))} />
        <span>{record.label}</span>{record.status ? <span className="text-xs text-slate-500">({record.status})</span> : null}
      </label>)}
      {!records.length && <p className="text-sm text-slate-500">No records available.</p>}
    </div>
    {message && <p role="status" className="mt-2 text-sm text-slate-700">{message}</p>}
  </section>;
}
