"use client";
import { useActionState, useState, useTransition, type FormEvent } from "react"; import { useRouter } from "next/navigation";
import {
adminDeletePlaceAction,
adminDeleteNewsAction,
adminDeleteUserAction,
adminDeleteBloodDonorAction,
adminModeratePostAction,
adminResolveReportAction,
adminSavePermissionsAction,
adminSaveSettingsAction,
adminSetBloodRequestStatusAction,
adminSetBloodDonorVisibilityAction,
adminSetNewsStatusAction,
adminUpdateNewsAction,
adminSetReviewStatusAction,
adminSetUserStatusAction,
adminSetUserRoleAction,
deleteBusinessAction,
toggleModeratorAction, } from "@/features/admin/actions"; import { ALL_ACTIONS, ROLE_LABELS } from "@/config/permissions"; import { Button } from "@/components/ui/button"; import type { Role } from "@/types/auth";
import { rolePermissions } from "@/lib/auth/permissions";
import type { ContentCategory } from "@/services/content-categories";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
const selectClass = "rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus-ring";
type FormState = { error?: string; success?: string };
export function NewsStatusButtons({ article, categories }: { article: { id: string; status: string; title: string; excerpt: string; body: string; category: string; source?: string | null; image: string }; categories: ContentCategory[] }) {
const [pending, startTransition] = useTransition();
const [editing, setEditing] = useState(false);
const [message, setMessage] = useState("");
const router = useRouter();
const act = (next: "published" | "pending_review" | "rejected" | "archived") =>
startTransition(async () => {
try {
const result = await adminSetNewsStatusAction(article.id, next);
setMessage(result.error ?? `News ${next === "published" ? "published" : "status updated"}.`);
if (result.ok) router.refresh();
} catch { setMessage("The news status could not be changed. Please try again."); }
});
async function saveEdit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
const formData = new FormData(event.currentTarget);
startTransition(async () => {
try {
const result = await adminUpdateNewsAction(article.id, formData);
setMessage(result.error ?? "News updated.");
if (result.ok) { setEditing(false); router.refresh(); }
} catch { setMessage("News changes could not be saved. Please try again."); }
});
}
function remove() {
if (!window.confirm(`Delete “${article.title}” permanently?`)) return;
startTransition(async () => {
try {
const result = await adminDeleteNewsAction(article.id);
setMessage(result.error ?? "News deleted.");
if (result.ok) router.refresh();
} catch { setMessage("News could not be deleted. Please try again."); }
});
}
return (
<div className="min-w-36 space-y-2">
<div className="flex flex-wrap gap-1">
{article.status !== "published" && (
<button type="button" disabled={pending} onClick={() => act("published")} className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700">Publish</button>
)}
{article.status === "published" && (
<button type="button" disabled={pending} onClick={() => act("pending_review")} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">Unpublish</button>
)}
<button type="button" disabled={pending} onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">Update</button>
<button type="button" disabled={pending} onClick={remove} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
{article.status === "pending_review" && (
<button type="button" disabled={pending} onClick={() => act("rejected")} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">Reject</button>
)}
</div>
<AnimatedDialog open={editing} onClose={() => setEditing(false)} label={`Update news: ${article.title}`} panelClassName="max-w-2xl">
<form onSubmit={saveEdit} className="space-y-4">
<h2 className="font-semibold text-slate-900">Update news</h2>
<label className="block text-xs font-medium text-slate-700">Title<input name="title" required maxLength={200} defaultValue={article.title} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" /></label>
<label className="block text-xs font-medium text-slate-700">Excerpt<input name="excerpt" required maxLength={300} defaultValue={article.excerpt} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" /></label>
<label className="block text-xs font-medium text-slate-700">Category<select name="category" required defaultValue={article.category} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm">{categories.map((category) => <option key={category.value} value={category.value}>{category.name}</option>)}</select></label>
<label className="block text-xs font-medium text-slate-700">Article<textarea name="body" required defaultValue={article.body} rows={6} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" /></label>
<label className="block text-xs font-medium text-slate-700">Source (optional)<input name="source" defaultValue={article.source ?? ""} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" /></label>
<input type="hidden" name="image" value={article.image} />
<div className="flex gap-2">
<button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">{pending ? "Saving…" : "Save changes"}</button>
<button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50">Cancel</button>
</div>
</form>
</AnimatedDialog>
{message && <p role="status" className="text-xs text-slate-600">{message}</p>}
</div>
); }
export function UserStatusSelect({ userId, status }: { userId: string; status: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<select
disabled={pending}
defaultValue={status}
onChange={(event) =>
startTransition(async () => {
await adminSetUserStatusAction(userId, event.target.value as "active" | "suspended" | "pending");
router.refresh();
})
}
className={selectClass}
aria-label="Account status"
>
<option value="active">Active</option>
<option value="suspended">Suspended</option>
<option value="pending">Pending</option>
</select>
); }
export function UserRoleSelect({ userId, role }: { userId: string; role: Role }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<select
disabled={pending}
defaultValue={role}
onChange={(event) =>
startTransition(async () => {
await adminSetUserRoleAction(userId, event.target.value as Role);
router.refresh();
})
}
className={selectClass}
aria-label="Role"
>
<option value="user">User</option>
<option value="moderator">Moderator</option>
<option value="admin">Admin</option>
</select>
); }
export function ReportResolveButtons({ id, status }: { id: string; status: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
const act = (next: "under_review" | "resolved" | "dismissed") =>
startTransition(async () => {
await adminResolveReportAction(id, next);
router.refresh();
});
return (
<div className="flex flex-wrap gap-1">
{status !== "under_review" && (
<button type="button" disabled={pending} onClick={() => act("under_review")} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">Review</button>
)}
{status !== "resolved" && (
<button type="button" disabled={pending} onClick={() => act("resolved")} className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700">Resolve</button>
)}
{status !== "dismissed" && (
<button type="button" disabled={pending} onClick={() => act("dismissed")} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">Dismiss</button>
)}
</div>
); }
export function BloodRequestStatusSelect({ id, status }: { id: string; status: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<select
disabled={pending}
defaultValue={status}
onChange={(event) =>
startTransition(async () => {
await adminSetBloodRequestStatusAction(id, event.target.value as "active" | "fulfilled" | "cancelled" | "expired" | "under_review");
router.refresh();
})
}
className={selectClass}
aria-label="Request status"
>
<option value="active">Active</option>
<option value="under_review">Under review</option>
<option value="fulfilled">Fulfilled</option>
<option value="cancelled">Cancelled</option>
<option value="expired">Expired</option>
</select>
); }
export function BloodDonorActions({
id,
archived,
}: {
id: string;
archived: boolean;
}) {
const [pending, startTransition] = useTransition();
const [message, setMessage] = useState("");
const router = useRouter();
function setVisibility(visible: boolean) {
const prompt = visible
? "Restore this donor record? It will remain hidden until the donor consents again."
: "Hide this donor from Find a donor? The record will remain in the admin list.";
if (!window.confirm(prompt)) return;
startTransition(async () => {
try {
const result = await adminSetBloodDonorVisibilityAction(id, visible);
setMessage(result.error ?? (visible ? "Donor record restored. Public listing still requires donor consent." : "Donor hidden from public listings."));
if (result.ok) router.refresh();
} catch {
setMessage("Donor visibility could not be changed. Please try again.");
}
});
}
function permanentlyDelete() {
if (!window.confirm("Permanently delete this donor record? This cannot be undone.")) return;
startTransition(async () => {
try {
const result = await adminDeleteBloodDonorAction(id);
setMessage(result.error ?? "Donor record permanently deleted.");
if (result.ok) router.refresh();
} catch {
setMessage("Donor record could not be deleted. Please try again.");
}
});
}
return (
<div className="min-w-40 space-y-2">
<div className="flex flex-wrap gap-1">
<button type="button" disabled={pending} onClick={() => setVisibility(archived)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50">
{archived ? "Restore record" : "Hide"}
</button>
<button type="button" disabled={pending} onClick={permanentlyDelete} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50">
Delete
</button>
</div>
{message && <p role="status" className="text-xs text-slate-600">{message}</p>}
</div>
);
}
export function DeletePlaceButton({ id }: { id: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await adminDeletePlaceAction(id);
router.refresh();
})
}
className="rounded-lg border border-accent-500/40 px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/10"
>
Delete
</button>
); }
export function DeleteUserButton({ userId }: { userId: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await adminDeleteUserAction(userId);
router.refresh();
})
}
className="rounded-lg border border-accent-500/40 px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/10"
>
Delete
</button>
); }
export function SettingsForm({
initial, }: {
initial: { siteName: string; allowPublicPosts: boolean; requireNewsApproval: boolean; donorDirectoryEnabled: boolean }; }) {
const [state, formAction, pending] = useActionState<FormState, FormData>(
adminSaveSettingsAction as unknown as (prev: FormState, fd: FormData) => Promise<FormState>,
{}
);
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Platform settings</h2>
<div>
<label htmlFor="siteName" className="mb-1 block text-sm font-medium text-slate-700">Site name</label>
<input id="siteName" name="siteName" defaultValue={initial.siteName} className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
</div>
{[
{ name: "allowPublicPosts", label: "Allow public community posts without pre-approval", value: initial.allowPublicPosts },
{ name: "requireNewsApproval", label: "Require moderator approval for news", value: initial.requireNewsApproval },
{ name: "donorDirectoryEnabled", label: "Enable the public donor directory", value: initial.donorDirectoryEnabled },
].map((toggle) => (
<label key={toggle.name} className="flex items-center gap-2 text-sm text-slate-700">
<input type="checkbox" name={toggle.name} defaultChecked={toggle.value} />
{toggle.label}
</label>
))}
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
</form>
); }
export function PermissionsForm({ overrides }: { overrides: Record<string, string[]> }) {
const [state, formAction, pending] = useActionState<FormState, FormData>(
adminSavePermissionsAction as unknown as (prev: FormState, fd: FormData) => Promise<FormState>,
{}
);
const roles: Role[] = ["user", "moderator", "admin"];
return (
<form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Role permissions</h2>
<p className="text-sm text-slate-600">
Choose exactly which actions each role can use. Admin access always remains unrestricted.
</p>
<div className="space-y-3">
{roles.map((role) => {
const grantedActions = new Set(rolePermissions(role, overrides));
return (
<fieldset key={role} className="rounded-xl border border-slate-200 p-4">
<legend className="px-1 text-sm font-medium text-slate-700">{ROLE_LABELS[role]}</legend>
<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
{ALL_ACTIONS.map((action) => {
const granted = grantedActions.has(action);
return (
<label key={action} className="flex items-center gap-2 text-xs text-slate-700">
<input type="checkbox" name={`role:${role}:${action}`} defaultChecked={granted} disabled={role === "admin"} />
{action}
</label>
);
})}
</div>
</fieldset>
);
})}
</div>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save permissions"}</Button>
</form>
); }
export { adminModeratePostAction };
export function DeleteBusinessButton({ id }: { id: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await deleteBusinessAction(id);
router.refresh();
})
}
className="rounded-lg border border-accent-500/40 px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/10"
>
Delete
</button>
); }
export function ReviewStatusButton({ id, status }: { id: string; status: string }) {
const [pending, startTransition] = useTransition();
const router = useRouter();
const next = status === "visible" ? "hidden" : "visible";
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await adminSetReviewStatusAction(id, next as "visible" | "hidden");
router.refresh();
})
}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
>
{status === "visible" ? "Hide" : "Show"}
</button>
); }
