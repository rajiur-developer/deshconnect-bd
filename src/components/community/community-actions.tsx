"use client";
import { useState, useTransition } from "react"; import { useRouter } from "next/navigation";
import { deleteOwnPostAction, moderatePostAction, reactToPostAction } from "@/features/community/actions"; import { Icon } from "@/components/ui/icons";
export function ReactionButton({ postId, initialCount }: { postId: string; initialCount: number }) {
const [count, setCount] = useState(initialCount);
const [reacted, setReacted] = useState(false);
const [pending, startTransition] = useTransition();
return (
<button
type="button"
disabled={pending || reacted}
aria-pressed={reacted}
onClick={() =>
startTransition(async () => {
const result = await reactToPostAction(postId);
setCount(result.count);
setReacted(true);
})
}
className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${         reacted ? "border-accent-500 bg-accent-500/10 text-accent-600" : "border-slate-300 text-slate-700 hover:bg-slate-50"       }`}
>
<Icon name="heart" className={`h-4 w-4 ${reacted ? "fill-accent-500 text-accent-500" : ""}`} />
{count}
</button>
); }
export function DeletePostButton({ postId }: { postId: string }) {
const [deleted, setDeleted] = useState(false);
const [error, setError] = useState("");
const [pending, startTransition] = useTransition();
const router = useRouter();
if (deleted) return <span className="text-sm text-slate-500">Post deleted.</span>;
return (
<>
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
try {
const result = await deleteOwnPostAction(postId);
if (result.deleted) {
setDeleted(true);
setError("");
router.refresh();
} else setError(result.error ?? "Could not delete this post.");
} catch {
setError("Could not delete this post. Please try again.");
}
})
}
className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
>
<Icon name="trash" className="h-4 w-4" />
{pending ? "Deleting…" : "Delete"}
</button>
{error && <p role="alert" className="basis-full text-xs text-accent-600">{error}</p>}
</>
); }
export function ModeratePostButtons({ postId, status }: { postId: string; status: string }) {
const [current, setCurrent] = useState(status);
const [error, setError] = useState("");
const [pending, startTransition] = useTransition();
const router = useRouter();
const apply = (next: "visible" | "hidden") =>
startTransition(async () => {
try {
const result = await moderatePostAction(postId, next);
if (result.ok) { setCurrent(next); setError(""); router.refresh(); }
else setError(result.error ?? "Could not update this post.");
} catch {
setError("Could not update this post. Please try again.");
}
});
const remove = () =>
startTransition(async () => {
try {
const result = await deleteOwnPostAction(postId);
if (result.deleted) { setCurrent("deleted"); setError(""); router.refresh(); }
else setError(result.error ?? "Could not delete this post.");
} catch {
setError("Could not delete this post. Please try again.");
}
});
return (
<div className="flex flex-wrap gap-2">
<button
type="button"
disabled={pending || current === "visible"}
onClick={() => apply("visible")}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
>
{current === "hidden" ? "Show" : "Approve"}
</button>
<button
type="button"
disabled={pending || current === "hidden"}
onClick={() => apply("hidden")}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
>
Hide
</button>
<button
type="button"
disabled={pending || current === "deleted"}
onClick={remove}
className="rounded-lg border border-accent-500/40 px-3 py-1.5 text-xs font-medium text-accent-600 hover:bg-accent-500/10 disabled:opacity-50"
>
Delete
</button>
{error && <p role="alert" className="basis-full text-xs text-accent-600">{error}</p>}
</div>
); }
