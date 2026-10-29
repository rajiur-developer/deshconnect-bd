"use client";
import { useState } from "react";
import { ReportForm } from "./community-forms"; import { Icon } from "@/components/ui/icons";
export function ReportButton({
targetType,
targetId, }: {
targetType: "post" | "comment" | "review" | "news" | "blood_request";
targetId: string; }) {
const [open, setOpen] = useState(false);
if (!open) {
return (
<button
type="button"
onClick={() => setOpen(true)}
className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
>
<Icon name="flag" className="h-4 w-4" />
Report
</button>
);
}
return <ReportForm targetType={targetType} targetId={targetId} onDone={() => setOpen(false)} />; }
