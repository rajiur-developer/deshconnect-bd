"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveOwnDonorProfileAction, cancelBloodRequestAction } from "@/features/blood/actions";
import { useToast } from "@/components/ui/toast";

export function DeleteDonorProfileButton() {
const router = useRouter();
const { error, success } = useToast();
const [pending, startTransition] = useTransition();
return (
<button
type="button"
disabled={pending}
onClick={() => {
if (!window.confirm("Remove your donor profile from public listings? Your record will remain available to admins.")) return;
startTransition(async () => {
const result = await archiveOwnDonorProfileAction();
if (!result.ok) {
error(result.error ?? "Your donor profile could not be removed.");
return;
}
success("Your donor profile was removed from public listings.");
router.refresh();
});
}}
className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
>
{pending ? "Removing…" : "Delete donor profile"}
</button>
);
}

export function CancelRequestButton({ requestId }: { requestId: string }) {
const [cancelled, setCancelled] = useState(false);
const [pending, startTransition] = useTransition();
if (cancelled) {
return <span className="text-xs text-slate-500">Request cancelled.</span>;
}
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
const result = await cancelBloodRequestAction(requestId);
if (result.cancelled) setCancelled(true);
})
}
className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
Cancel request
</button>
); }
