"use client";
import Link from "next/link"; import { useActionState, useState } from "react";
import { googleOAuthAction, loginAction, type FormState } from "@/features/auth/actions"; import { Button } from "@/components/ui/button"; import { Field, Input } from "@/components/ui/input"; import { Icon } from "@/components/ui/icons"; import { useFormStateToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner"; import { FormPendingButton } from "@/components/ui/form-pending-button";
export function LoginForm({ next, oauthError }: { next: string; oauthError?: string }) {
const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, {});
useFormStateToast(state);
const [showPassword, setShowPassword] = useState(false);
return (<div>
<form action={formAction} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
<input type="hidden" name="next" value={next} />
<h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
<p className="mt-1 text-sm text-slate-600">Log in to your DeshConnect account.</p>
{oauthError && <p role="alert" className="mt-4 rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-accent-600">Google sign-in could not be completed. Please try again.</p>}
<div className="mt-6">
<Field label="Email" htmlFor="email" required>
<Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
</Field>
</div>
<div className="mt-4">
<Field label="Password" htmlFor="password" required>
<div className="relative">
<Input
id="password"
name="password"
type={showPassword ? "text" : "password"}
autoComplete="current-password"
required
className="pr-20"
/>
<button
type="button"
onClick={() => setShowPassword((value) => !value)}
className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
aria-label={showPassword ? "Hide password" : "Show password"}
>
{showPassword ? "Hide" : "Show"}
</button>
</div>
</Field>
</div>
{state.error && <p role="alert" className="motion-error mt-4 rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-accent-600">{state.error}</p>}
<div className="mt-6">
<Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>{pending && <Spinner />}{pending ? "Logging in…" : "Log in"}</Button>
</div>
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
<Link href="/forgot-password" className="text-brand-700 hover:text-brand-800">Forgot password?</Link>
<Link href="/register" className="text-brand-700 hover:text-brand-800">Create an account</Link>
</div>
</form>
<div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with<span className="h-px flex-1 bg-slate-200" /></div>
<form action={googleOAuthAction}><FormPendingButton variant="outline" className="w-full rounded-xl border-slate-200 bg-white py-3 font-semibold transition hover:border-brand-200 hover:bg-brand-50/50" pendingLabel="Connecting to Google…">Continue with Google</FormPendingButton></form>
</div>); }
