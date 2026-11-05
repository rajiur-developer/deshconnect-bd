"use client";
import Link from "next/link"; import { useActionState } from "react";
import { requestPasswordResetAction, type FormState } from "@/features/auth/actions"; import { Button } from "@/components/ui/button"; import { Field, Input } from "@/components/ui/input"; import { useFormStateToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/components/i18n/language-provider";
export function ForgotPasswordForm() {
const { t } = useLanguage();
const [state, formAction, pending] = useActionState<FormState, FormData>(requestPasswordResetAction, {});
useFormStateToast(state);
return (
<form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
<h1 className="text-2xl font-bold text-slate-900">{t("Forgot password")}</h1>
<p className="mt-1 text-sm text-slate-600">{t("Enter your email and we’ll send you a 6-digit reset code.")}</p>
<div className="mt-6"><Field label="Email" htmlFor="email" required><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></Field></div>
{state.error && <p role="alert" className="motion-error mt-4 text-sm text-accent-600">{t(state.error)}</p>}
<div className="mt-6"><Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>{pending && <Spinner />}{pending ? t("Sending…") : t("Send reset code")}</Button></div>
<p className="mt-4 text-center text-sm text-slate-600"><Link href="/login" className="text-brand-700">{t("Back to login")}</Link></p>
</form>); }
