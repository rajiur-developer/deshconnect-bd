"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useActionState } from "react";
import {
  googleOAuthAction,
  registerAction,
  resendRegistrationCodeAction,
  verifyRegistrationAction,
  type FormState,
} from "@/features/auth/actions";
import { BLOOD_GROUPS, GENDERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { LocationFields } from "@/components/forms/location-fields";
import { useFormStateToast } from "@/components/ui/toast";
import type { DistrictOption, LocationOption, UpazilaOption } from "@/components/search/directory-filters";
import { Spinner } from "@/components/ui/spinner";
import { FormPendingButton } from "@/components/ui/form-pending-button";
import { DateInput } from "@/components/ui/date-input";

type Props = {
  divisions: LocationOption[];
  districts: DistrictOption[];
  upazilas: UpazilaOption[];
};

const selectClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10";
const inputClass = "rounded-xl py-2.5";

function StepHeading({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>STEP {step} OF 2</span>
        <span>{step === 1 ? "Account details" : "Personal details"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2" aria-label={`Registration step ${step} of 2`}>
        <div className={`h-1.5 rounded-full ${step >= 1 ? "bg-brand-600" : "bg-slate-200"}`} />
        <div className={`h-1.5 rounded-full ${step >= 2 ? "bg-brand-600" : "bg-slate-200"}`} />
      </div>
    </div>
  );
}

export function RegisterForm({ divisions, districts, upazilas }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(registerAction, {});
  const [verifyState, verifyAction, verifyPending] = useActionState<FormState, FormData>(verifyRegistrationAction, {});
  const [resendState, resendAction, resendPending] = useActionState<FormState, FormData>(resendRegistrationCodeAction, {});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [details, setDetails] = useState({ fullName: "", username: "", email: "", phone: "" });
  const otpRefs = useRef([]);
  useFormStateToast(state);
  useFormStateToast(verifyState);
  useFormStateToast(resendState);

  const passwordStrength = password.length < 8 ? 0 : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3 : /[A-Za-z]/.test(password) && /[0-9]/.test(password) ? 2 : 1;
  const strengthLabel = ["Enter a password", "Weak", "Good", "Strong"][passwordStrength];

  if (state.verificationRequired) {
    const fields = ["fullName", "username", "phone", "divisionId", "districtId", "upazilaId", "bloodGroup", "gender", "dateOfBirth", "termsAccepted"] as const;
    const digitValues = otp.split("");
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify your email</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter the 6-digit verification code sent to <strong className="break-all text-slate-800">{state.email}</strong>.</p>
          <form action={verifyAction} className="mt-6">
            <input type="hidden" name="email" value={state.email ?? ""} />
            {fields.map((key) => <input key={key} type="hidden" name={key} value={state[key] ?? ""} />)}
            <input type="hidden" name="otp" value={otp} />
            <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-label="Six digit verification code">
              {Array.from({ length: 6 }, (_, index) => (
                <input
                  key={index}
                  ref={(node) => { otpRefs.current[index] = node; }}
                  aria-label={`Verification digit ${index + 1}`}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digitValues[index] ?? ""}
                  onChange={(event) => {
                    const digit = event.target.value.replace(/\D/g, "").slice(-1);
                    const next = digitValues.slice();
                    next[index] = digit;
                    setOtp(next.join("").slice(0, 6));
                    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digitValues[index] && index > 0) otpRefs.current[index - 1]?.focus();
                    if (event.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
                    if (event.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
                  }}
                  onPaste={(event) => {
                    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (pasted) { event.preventDefault(); setOtp(pasted); otpRefs.current[Math.min(pasted.length, 5)]?.focus(); }
                  }}
                  className="h-12 min-w-0 rounded-xl border border-slate-300 bg-white text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:h-14"
                  required={index === 0}
                />
              ))}
            </div>
            {verifyState.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{verifyState.error}</p>}
            <div className="mt-6"><Button type="submit" className="w-full rounded-xl py-3" disabled={verifyPending || otp.length !== 6} aria-busy={verifyPending}>{verifyPending && <Spinner />}{verifyPending ? "Verifying…" : "Verify email"}</Button></div>
          </form>
          <form action={resendAction} className="mt-4 text-center">
            <input type="hidden" name="email" value={state.email ?? ""} />
            <button type="submit" disabled={resendPending} className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline disabled:opacity-60">{resendPending ? "Sending new code…" : "Resend verification code"}</button>
            {resendState.error && <p role="alert" className="mt-2 text-sm text-red-700">{resendState.error}</p>}
            {resendState.success && <p role="status" className="mt-2 text-sm text-emerald-700">{resendState.success}</p>}
          </form>
          <p className="mt-5 text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-brand-700 hover:underline">Return to login</Link></p>
        </div>
      </div>
    );
  }

  function goToDetails(event: React.FormEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form) return;
    const requiredFields = Array.from(
      form.querySelectorAll<HTMLInputElement>("[data-step-one] input[required]"),
    );
    const invalid = requiredFields.find((field) => !field.checkValidity());
    if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    if (password !== confirmPassword) {
      const confirm = form.querySelector<HTMLInputElement>("#confirmPassword");
      if (confirm) {
        confirm.setCustomValidity("Passwords do not match.");
        confirm.reportValidity();
        confirm.focus();
      }
      return;
    }
    form.querySelector<HTMLInputElement>("#confirmPassword")?.setCustomValidity("");
    setStep(2);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        action={formAction}
        noValidate
        onSubmit={(event) => {
          const form = event.currentTarget;
          const requiredFields = Array.from(
            form.querySelectorAll<HTMLInputElement>("[data-final-required]"),
          );
          const invalid = requiredFields.find((field) => !field.checkValidity());
          if (invalid) {
            event.preventDefault();
            const invalidStep = Number(invalid.dataset.step || 2);
            setStep(invalidStep);
            requestAnimationFrame(() => invalid.reportValidity());
            return;
          }
          if (password !== confirmPassword) {
            event.preventDefault();
            setStep(1);
            requestAnimationFrame(() => {
              const field = form.querySelector<HTMLInputElement>("#confirmPassword");
              if (!field) return;
              field.setCustomValidity("Passwords do not match.");
              field.reportValidity();
              field.focus();
            });
          }
        }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <StepHeading step={step} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{step === 1 ? "Create your account" : "Personalise your profile"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{step === 1 ? "Start with your account details. It only takes a minute." : "Add optional details to make your DeshConnect profile more useful."}</p>
        </div>

        {step === 1 ? (
          <div data-step-one className="space-y-4">
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required><Input className={inputClass} id="fullName" name="fullName" required data-final-required data-step="1" autoComplete="name" value={details.fullName} onChange={(e) => setDetails({ ...details, fullName: e.target.value })} placeholder="Your full name" /></Field>
              <Field label="Username" htmlFor="username" required hint="3–24 lowercase letters, numbers, or underscores"><Input className={inputClass} id="username" name="username" required data-final-required data-step="1" autoComplete="username" minLength={3} maxLength={24} pattern="[a-z0-9_]{3,24}" value={details.username} onChange={(e) => setDetails({ ...details, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} placeholder="your_name" /></Field>
              <Field label="Email" htmlFor="email" required><Input className={inputClass} id="email" name="email" type="email" required data-final-required data-step="1" autoComplete="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} placeholder="you@example.com" /></Field>
              <Field label="Phone" htmlFor="phone" hint="Optional, e.g. 01712345678"><Input className={inputClass} id="phone" name="phone" type="tel" autoComplete="tel" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} placeholder="01712345678" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" htmlFor="password" required hint="At least 8 characters">
                <div className="relative"><Input className={`${inputClass} pr-16`} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required data-final-required data-step="1" minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div>
                <div className="mt-2 flex items-center gap-2" aria-live="polite"><div className="flex flex-1 gap-1">{[1, 2, 3].map((level) => <span key={level} className={`h-1.5 flex-1 rounded-full ${passwordStrength >= level ? (passwordStrength === 1 ? "bg-amber-400" : passwordStrength === 2 ? "bg-lime-500" : "bg-emerald-600") : "bg-slate-200"}`} />)}</div><span className="text-xs text-slate-500">{strengthLabel}</span></div>
              </Field>
              <Field label="Confirm password" htmlFor="confirmPassword" required>
                <div className="relative"><Input className={`${inputClass} pr-16`} id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required data-final-required data-step="1" minLength={8} maxLength={128} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); e.currentTarget.setCustomValidity(""); }} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? "Hide" : "Show"}</button></div>
                {confirmPassword && <p className={`mt-1.5 text-xs ${confirmPassword === password ? "text-emerald-700" : "text-amber-700"}`}>{confirmPassword === password ? "Passwords match" : "Passwords do not match yet"}</p>}
              </Field>
            </div>
            <div className="pt-2"><Button type="button" className="w-full rounded-xl py-3" onClick={goToDetails}>Continue to profile details <span aria-hidden="true" className="ml-2">→</span></Button></div>
            <p className="text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link></p>
          </div>
        ) : (
          <>
            {Object.entries(details).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="confirmPassword" value={confirmPassword} />
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <h2 className="font-semibold text-slate-900">Your location <span className="font-normal text-slate-500">(optional)</span></h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Choose your area to make local information more relevant.</p>
                <div className="mt-4"><LocationFields divisions={divisions} districts={districts} upazilas={upazilas} current={{}} /></div>
              </section>
              <section>
                <h2 className="mb-3 font-semibold text-slate-900">A little more about you <span className="font-normal text-slate-500">(optional)</span></h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Blood group" htmlFor="bloodGroup" hint="Optional"><select id="bloodGroup" name="bloodGroup" className={selectClass}><option value="">Select</option>{BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}</select></Field>
                  <Field label="Gender" htmlFor="gender" hint="Optional"><select id="gender" name="gender" className={selectClass}><option value="">Select</option>{GENDERS.map((gender) => <option key={gender.value} value={gender.value}>{gender.label}</option>)}</select></Field>
                  <Field label="Date of birth" htmlFor="dateOfBirth" hint="Optional"><DateInput id="dateOfBirth" name="dateOfBirth" /></Field>
                </div>
              </section>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                <input type="checkbox" name="termsAccepted" data-final-required data-step="2" className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-700" required />
                <span>I agree to the <Link href="/terms" className="font-semibold text-brand-700 hover:underline">Terms of Use</Link> and <Link href="/privacy-policy" className="font-semibold text-brand-700 hover:underline">Privacy Policy</Link>.</span>
              </label>
            </div>
            {state.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="rounded-xl py-3" onClick={() => setStep(1)}>← Back</Button>
              <Button type="submit" className="rounded-xl py-3" disabled={pending} aria-busy={pending}>{pending && <Spinner />}{pending ? "Creating account…" : "Create account"}</Button>
            </div>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">You can leave optional profile details blank and add them later.</p>
          </>
        )}
      </form>
      {step === 1 && <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" />or sign up with<span className="h-px flex-1 bg-slate-200" /></div>}
      {step === 1 && <form action={googleOAuthAction}><FormPendingButton variant="outline" className="w-full rounded-xl border-slate-200 bg-white py-3 font-semibold transition hover:border-brand-200 hover:bg-brand-50/50" pendingLabel="Connecting to Google…">Continue with Google</FormPendingButton></form>}
    </div>
  );
}
