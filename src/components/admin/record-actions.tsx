"use client";
import { useState, useTransition, type ReactNode } from "react"; import { useRouter } from "next/navigation";
import {
adminDeletePlaceAction,
adminDeleteInstitutionAction,
adminDeleteServiceAction,
adminSetBusinessStatusAction,
adminSetInstitutionStatusAction,
adminSetPlaceStatusAction,
adminSetServiceStatusAction,
deleteBusinessAction, } from "@/features/admin/actions"; import { useToast } from "@/components/ui/toast";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
/**
* Hide / Edit / Delete controls for a directory record. "Edit" opens the
* supplied edit form in a modal. Success and failure are shown as pop-ups.
*/ export function RecordActions({
entity,
id,
status,
children, }: {
entity: "place" | "business" | "service" | "institution" | "hospital";
id: string;
status: string;
children?: ReactNode; }) {
const [editing, setEditing] = useState(false);
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
: adminSetInstitutionStatusAction(id, next);
run(promise, hidden ? "Record restored." : "Record hidden.");
};
const remove = () => {
const promise =
entity === "place"
? adminDeletePlaceAction(id)
: entity === "business"
? deleteBusinessAction(id)
: entity === "service"
? adminDeleteServiceAction(id)
: adminDeleteInstitutionAction(id);
run(promise, "Record deleted.");
};
return (
<>
<div className="flex flex-wrap items-center gap-1.5">
<button
type="button"
disabled={pending}
onClick={toggleHide}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
{hidden ? "Unhide" : "Hide"}
</button>
<button
type="button"
disabled={pending}
onClick={() => setEditing(true)}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
Edit
</button>
<button
type="button"
disabled={pending}
onClick={remove}
className="rounded-lg border border-accent-500/40 px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/10 disabled:opacity-60"
>
Delete
</button>
</div>
{children && <AnimatedDialog open={editing} onClose={() => setEditing(false)} label={`Update ${entity}`} panelClassName="max-w-2xl">{children}</AnimatedDialog>}
</>
); }
