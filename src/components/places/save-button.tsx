"use client";
import { useState, useTransition } from "react";
import { toggleSaveAction } from "@/features/places/actions"; import { Icon } from "@/components/ui/icons"; import { cn } from "@/lib/utils";
export function SaveButton({ placeId, initialSaved }: { placeId: string; initialSaved: boolean }) {
const [saved, setSaved] = useState(initialSaved);
const [pending, startTransition] = useTransition();
return (
<button
type="button"
disabled={pending}
aria-pressed={saved}
onClick={() =>
startTransition(async () => {
const result = await toggleSaveAction(placeId);
setSaved(result.saved);
})
}
className={cn(
"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus-ring",
saved
? "border border-brand-600 bg-brand-50 text-brand-700"
: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
)}
>
<Icon name={saved ? "check" : "save"} className="h-4 w-4" />
{saved ? "Saved" : "Save for later"}
</button>
); }
