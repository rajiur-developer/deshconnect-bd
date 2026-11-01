"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/security/rate-limit";
import { RATES } from "@/lib/constants";
import { formatZodError, loginSchema, registerSchema } from "@/lib/validation/schemas";

export type FormState = {
  error?: string;
  success?: string;
  verificationRequired?: boolean;
  email?: string;
  fullName?: string;
  username?: string;
  phone?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  termsAccepted?: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
function safeNext(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}
function auth() {
  return cookies().then((cookieStore) => createAuthActions({ cookies: cookieStore }));
}
/**
 * Public auth attempts must start with the anon client, not a possibly stale
 * access token from an earlier session. Keep the writable cookie store so a
 * successful sign-in / verification can still establish the new session.
 */
async function freshAuth() {
  const cookieStore = await cookies();
  return {
    // Server Actions use the same writable cookie store for reading and
    // writing; responseCookies is reserved for Route Handler responses.
    actions: createAuthActions({ cookies: cookieStore }),
    cookieStore,
  };
}
function toProfile(formData: FormData) {
  return {
    username: String(formData.get("username") ?? "").trim().toLowerCase(),
    full_name: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    division_id: String(formData.get("divisionId") ?? "").trim() || null,
    district_id: String(formData.get("districtId") ?? "").trim() || null,
    upazila_id: String(formData.get("upazilaId") ?? "").trim() || null,
    blood_group: String(formData.get("bloodGroup") ?? "").trim() || null,
    gender: String(formData.get("gender") ?? "").trim() || null,
    date_of_birth: String(formData.get("dateOfBirth") ?? "").trim() || null,
    terms_accepted_at: new Date().toISOString(),
  };
}

async function saveProfile(userId: string, formData: FormData, cookieStore?: Awaited<ReturnType<typeof cookies>>) {
  const profile = toProfile(formData);
  // Reuse the same writable cookie store that received the freshly verified
  // session. A second cookies() read inside this Server Action can still see
  // only the request's pre-verification cookies.
  const client = createServerClient({ cookies: cookieStore ?? await cookies() });
  const { data: existing, error: lookupError } = await client.database.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  const result = existing
    ? await client.database.from("profiles").update({ ...profile, updated_at: new Date().toISOString() }).eq("id", userId)
    : await client.database.from("profiles").insert([{
        id: userId,
        ...profile,
        email: String(formData.get("email") ?? "").trim().toLowerCase(),
        role: "user",
        status: "active",
        email_verified: true,
      }]);
  const { error } = result;
  if (error) throw new Error(error.message);
}

function profileFields(formData: FormData) {
  return Object.fromEntries(["fullName", "username", "phone", "divisionId", "districtId", "upazilaId", "bloodGroup", "gender", "dateOfBirth", "termsAccepted"]
    .map((key) => [key, String(formData.get(key) ?? "")]));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") ?? undefined });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { email, password, next } = parsed.data;
  const limit = rateLimit(`login:${email}`, RATES.loginPerMinute, 60_000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  let signInResult;
  try {
    const { actions } = await freshAuth();
    signInResult = await actions.signInWithPassword({ email, password });
  } catch (cause) {
    console.error("Sign-in request failed before returning an auth result.", cause instanceof Error ? cause.name : "Unknown error");
    return { error: "We could not reach the sign-in service. Please try again." };
  }
  const { data, error } = signInResult;
  if (error || !data?.user) return { error: error?.message ?? "Unable to sign in. Please try again." };
  revalidatePath("/", "layout");
  const destination = new URL(safeNext(formData.get("next")) || next, appUrl());
  destination.searchParams.set("welcome", "1");
  redirect(`${destination.pathname}${destination.search}${destination.hash}`);
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"), username: formData.get("username"), email: formData.get("email"),
    phone: formData.get("phone") || undefined, password: formData.get("password"), confirmPassword: formData.get("confirmPassword"),
    divisionId: formData.get("divisionId") || undefined, districtId: formData.get("districtId") || undefined,
    upazilaId: formData.get("upazilaId") || undefined, bloodGroup: formData.get("bloodGroup") || undefined,
    gender: formData.get("gender") || undefined, dateOfBirth: formData.get("dateOfBirth") || undefined,
    termsAccepted: formData.get("termsAccepted"),
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const data = parsed.data;
  const limit = rateLimit(`register:${data.email}`, RATES.registerPerHour, 60 * 60_000);
  if (!limit.ok) return { error: `Too many registrations. Try again in ${limit.retryAfterSeconds}s.` };
  let actions: Awaited<ReturnType<typeof freshAuth>>["actions"];
  let cookieStore: Awaited<ReturnType<typeof freshAuth>>["cookieStore"];
  let response: Awaited<ReturnType<typeof actions.signUp>>["data"];
  let signUpError: Awaited<ReturnType<typeof actions.signUp>>["error"];
  try {
    ({ actions, cookieStore } = await freshAuth());
    ({ data: response, error: signUpError } = await actions.signUp({ email: data.email, password: data.password, name: data.fullName }));
  } catch (cause) {
    console.error("Registration request failed before returning an auth result.", cause instanceof Error ? cause.name : "Unknown error");
    return { error: "We could not reach the registration service. Please try again." };
  }
  const error = signUpError;
  if (error) return { error: error.message };
  if (response?.requireEmailVerification) return {
    ...profileFields(formData), email: data.email, verificationRequired: true,
    success: "A 6-digit verification code has been sent to your email.",
  };
  if (!response?.user) return { error: "Account could not be created. Please try again." };
  const profileData = new FormData();
  for (const [key, value] of Object.entries(profileFields(formData))) profileData.set(key, value);
  profileData.set("email", data.email);
  try {
    await saveProfile(response.user.id, profileData, cookieStore);
  } catch (error) {
    console.error("Registration profile setup failed after sign-up.", error instanceof Error ? error.message : "Unknown error");
    return { error: "Your account was created, but we could not finish setting up your profile. Please log in and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

export async function verifyRegistrationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();
  if (!email || !/^\d{6}$/.test(otp)) return { error: "Enter the 6-digit code sent to your email." };
  const { actions, cookieStore } = await freshAuth();
  const { data, error } = await actions.verifyEmail({ email, otp });
  if (error || !data?.user) return { error: error?.message ?? "The code is invalid or expired." };
  try {
    await saveProfile(data.user.id, formData, cookieStore);
  } catch (profileError) {
    console.error("Registration profile setup failed after email verification.", profileError instanceof Error ? profileError.message : "Unknown error");
    return { error: "Your email is verified, but we could not finish setting up your profile. Please log in to continue." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

export async function resendRegistrationCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };
  const client = createServerClient({ cookies: await cookies() });
  const { error } = await client.auth.resendVerificationEmail({ email });
  if (error) return { error: "Could not resend the verification code. Please try again." };
  return { success: "A new verification code has been sent." };
}

export async function googleOAuthAction(): Promise<void> {
  let store: Awaited<ReturnType<typeof cookies>>;
  let data: Awaited<ReturnType<ReturnType<typeof createAuthActions>["signInWithOAuth"]>>["data"];
  let error: Awaited<ReturnType<ReturnType<typeof createAuthActions>["signInWithOAuth"]>>["error"];
  try {
    store = await cookies();
    const requestHeaders = await headers();
    const requestHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    // Prefer the explicitly configured canonical URL. If it is absent,
    // derive the public origin from the incoming Vercel request in production
    // as well; falling back to localhost in production breaks Google OAuth.
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
    const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
    const redirectBase = configuredAppUrl?.trim()
      ? configuredAppUrl.trim().replace(/\/+$/, "")
      : requestHost
        ? `${forwardedProto}://${requestHost.split(",")[0].trim()}`
        : appUrl();
    const actions = createAuthActions({ cookies: store });
    ({ data, error } = await actions.signInWithOAuth("google", {
      redirectTo: new URL("/api/auth/callback", redirectBase).toString(),
      skipBrowserRedirect: true,
    }));
  } catch (cause) {
    console.error("Google OAuth request failed before returning an auth result.", cause instanceof Error ? cause.name : "Unknown error");
    redirect("/login?error=oauth_unavailable");
  }
  if (error || !data?.url || !data.codeVerifier) redirect("/login?error=oauth_unavailable");
  store.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600,
  });
  redirect(data.url);
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const limit = rateLimit(`reset:${email}`, RATES.resetPerHour, 60 * 60_000);
  if (!limit.ok) return { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` };
  const client = createServerClient({ cookies: await cookies() });
  const { error } = await client.auth.sendResetPasswordEmail({ email });
  if (error) return { error: "We could not send a reset code. Please try again shortly." };
  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!email || !/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code sent to your email." };
  if (password.length < 8 || password.length > 128) return { error: "Password must be between 8 and 128 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.auth.exchangeResetPasswordToken({ email, code });
  if (error || !data?.token) return { error: error?.message ?? "The code is invalid or expired." };
  const { error: resetError } = await client.auth.resetPassword({ newPassword: password, otp: data.token });
  if (resetError) return { error: resetError.message };
  return { success: "Your password has been updated. You can now sign in." };
}

export async function signOutAction(): Promise<void> {
  const actions = await auth();
  await actions.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
