"use client";
import Link from "next/link"; import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "@/features/auth/actions"; import { Button } from "@/components/ui/button"; import { Field, Input } from "@/components/ui/input"; import { useFormStateToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
export function ResetPasswordForm({ email }: { email: string }) {
const [state, formAction, pending] = useActionState<FormState, FormData>(resetPasswordAction, {});
useFormStateToast(state);
return (
<form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
<input type="hidden" name="email" value={email} />
<h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
<p className="mt-1 text-sm text-slate-600">Enter the code sent to {email}, then choose a new password.</p>
<div className="mt-6 grid gap-4">
<Field label="6-digit code" htmlFor="code" required><Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></Field>
<Field label="New password" htmlFor="password" required hint="At least 8 characters">
<Input id="password" name="password" type="password" autoComplete="new-password" required />
</Field>
<Field label="Confirm new password" htmlFor="confirmPassword" required>
<Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
</Field>
</div>
{state.error && <p role="alert" className="motion-error mt-4 text-sm text-accent-600">{state.error}</p>}
{state.success && <p role="status" className="motion-success mt-4 text-sm text-emerald-600">{state.success}</p>}
<div className="mt-6">
<Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>{pending && <Spinner />}{pending ? "Updating…" : "Update password"}</Button>
</div>
<p className="mt-4 text-center text-sm text-slate-600">
<Link href="/login" className="text-brand-700">Back to login</Link>
</p>
</form>
); }
