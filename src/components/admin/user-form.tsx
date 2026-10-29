"use client";
import { useActionState, useState, useTransition } from "react"; import { useRouter } from "next/navigation";
import { adminDeleteUserAction, adminSetUserStatusAction, adminUpdateUserAction, type AdminFormState } from "@/features/admin/actions"; import { Button } from "@/components/ui/button"; import { Field, Input } from "@/components/ui/input"; import { useFormStateToast, useToast } from "@/components/ui/toast"; import type { User } from "@/types/auth";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
/** Delete / Block / Update controls for a member, shown on the admin users page. */ export function UserActions({ user }: { user: User }) {
const [editing, setEditing] = useState(false);
const [pending, startTransition] = useTransition();
const router = useRouter();
const { success, error } = useToast();
const blocked = user.status === "suspended";
const run = (promise: Promise<unknown>, message: string) =>
startTransition(async () => {
try {
await promise;
success(message);
router.refresh();
} catch (cause) {
error(cause instanceof Error ? cause.message : "That action failed.");
}
});
const toggleBlock = () =>
run(
adminSetUserStatusAction(user.id, blocked ? "active" : "suspended"),
blocked ? "User unblocked." : "User blocked."
);
const remove = () => run(adminDeleteUserAction(user.id), "User deleted.");
return (
<>
<div className="flex flex-wrap items-center gap-1.5">
<button
type="button"
disabled={pending}
onClick={toggleBlock}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
{blocked ? "Unblock" : "Block"}
</button>
<button
type="button"
disabled={pending}
onClick={() => setEditing(true)}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
Update
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
<AnimatedDialog open={editing} onClose={() => setEditing(false)} label="Update user" panelClassName="max-w-xl">
{(close) => <UserEditForm user={user} onDone={close} />}
</AnimatedDialog>
</>
); }
export function UserEditForm({ user, onDone }: { user: User; onDone?: () => void }) {
const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
adminUpdateUserAction as unknown as (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>,
{}
);
useFormStateToast(state);
return (
<form action={formAction} className="space-y-4">
<input type="hidden" name="id" value={user.id} />
<h2 className="font-semibold text-slate-900">Update user</h2>
<div className="grid gap-4 sm:grid-cols-2">
<Field label="Full name" htmlFor="user-fullName" required>
<Input id="user-fullName" name="fullName" required defaultValue={user.fullName} />
</Field>
<Field label="Email" htmlFor="user-email" required>
<Input id="user-email" name="email" type="email" readOnly defaultValue={user.email} />
</Field>
<Field label="Phone" htmlFor="user-phone" hint="Optional">
<Input id="user-phone" name="phone" defaultValue={user.phone ?? ""} placeholder="01XXXXXXXXX" />
</Field>
<Field label="Role" htmlFor="user-role" required>
<select id="user-role" name="role" defaultValue={user.role} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring">
<option value="user">User</option>
<option value="moderator">Moderator</option>
<option value="admin">Admin</option>
</select>
</Field>
<Field label="Status" htmlFor="user-status" required>
<select id="user-status" name="status" defaultValue={user.status} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring">
<option value="active">Active</option>
<option value="suspended">Suspended</option>
<option value="pending">Pending</option>
</select>
</Field>
</div>
{state.error && <p role="alert" className="text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="text-sm text-emerald-600">{state.success}</p>}
<div className="flex gap-2">
<Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
{onDone && (
<Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
)}
</div>
</form>
); }
