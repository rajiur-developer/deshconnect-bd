"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimitAsync } from "@/lib/security/rate-limit";
import { RATES } from "@/lib/constants";
import { formatZodError, loginSchema, registerSchema } from "@/lib/validation/schemas";

export type FormState = {
  error?: string; success?: string; verificationRequired?: boolean; email?: string;
  fullName?: string; username?: string; phone?: string; divisionId?: string; districtId?: string;
  upazilaId?: string; bloodGroup?: string; gender?: string; dateOfBirth?: string; termsAccepted?: string;
};
const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const safeNext = (value: FormDataEntryValue | string | null) => {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
};
const supabase = async () => createSupabaseServerClient(await cookies());

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
    updated_at: new Date().toISOString(),
  };
}
async function saveProfile(client: Awaited<ReturnType<typeof supabase>>, userId: string, formData: FormData) {
  const profile = toProfile(formData);
  const { data: existing, error: lookupError } = await client.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (existing) {
    const { error } = await client.from("profiles").update(profile).eq("id", userId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await client.from("profiles").insert([{
    id: userId, ...profile, email: String(formData.get("email") ?? "").trim().toLowerCase(), role: "user", status: "active",
  }]);
  if (error) throw new Error(error.message);
}
function profileFields(formData: FormData) {
  return Object.fromEntries(["fullName","username","phone","divisionId","districtId","upazilaId","bloodGroup","gender","dateOfBirth","termsAccepted"]
    .map((key) => [key, String(formData.get(key) ?? "")]));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") ?? undefined });
  if (!parsed.success) return { error: formatZodError(parsed.error) };
  const { email, password } = parsed.data;
  const limit = await rateLimitAsync(`login:${email}`, RATES.loginPerMinute, 60_000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  const client = await supabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: error?.message ?? "Unable to sign in. Please try again." };
  revalidatePath("/", "layout");
  const destination = new URL(safeNext(formData.get("next") ?? parsed.data.next ?? "/dashboard"), appUrl());
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
  const limit = await rateLimitAsync(`register:${data.email}`, RATES.registerPerHour, 60 * 60_000);
  if (!limit.ok) return { error: `Too many registrations. Try again in ${limit.retryAfterSeconds}s.` };

  const client = await supabase();
  const { data: result, error } = await client.auth.signUp({
    email: data.email, password: data.password,
    options: {
      emailRedirectTo: `${appUrl()}/api/auth/callback?next=/dashboard?welcome=1`,
      data: {
        fullName: data.fullName, username: data.username, phone: data.phone || null,
        divisionId: data.divisionId || null, districtId: data.districtId || null, upazilaId: data.upazilaId || null,
        bloodGroup: data.bloodGroup || null, gender: data.gender || null, dateOfBirth: data.dateOfBirth || null, termsAccepted: true,
      },
    },
  });
  if (error) return { error: error.message };
  if (!result.user) return { error: "Account could not be created. Please try again." };
  if (!result.session) return {
    ...profileFields(formData), email: data.email, verificationRequired: true,
    success: "A secure verification link has been sent to your email.",
  };

  const profileData = new FormData();
  for (const [key, value] of Object.entries(profileFields(formData))) profileData.set(key, value);
  profileData.set("email", data.email);
  try { await saveProfile(client, result.user.id, profileData); }
  catch (cause) {
    console.error("Supabase registration profile setup failed.", cause instanceof Error ? cause.message : "Unknown error");
    return { error: "Your account was created, but we could not finish setting up your profile. Please log in and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

export async function verifyRegistrationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("otp") ?? "").trim();
  if (!email || !/^\d{6}$/.test(token)) return { error: "Enter the 6-digit code sent to your email." };
  const client = await supabase();
  const { data, error } = await client.auth.verifyOtp({ email, token, type: "signup" });
  if (error || !data.user) return { error: error?.message ?? "The code is invalid or expired." };
  try { await saveProfile(client, data.user.id, formData); }
  catch (cause) {
    console.error("Supabase profile setup after email verification failed.", cause instanceof Error ? cause.message : "Unknown error");
    return { error: "Your email is verified, but we could not finish setting up your profile. Please log in to continue." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

export async function resendRegistrationCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };
  const { error } = await (await supabase()).auth.resend({ type: "signup", email });
  if (error) return { error: "Could not resend the verification link. Please try again." };
  return { success: "A new verification link has been sent." };
}

export async function googleOAuthAction(): Promise<void> {
  const { data, error } = await (await supabase()).auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl()}/api/auth/callback?next=/dashboard?welcome=1` },
  });
  if (error || !data.url) redirect("/login?error=oauth_unavailable");
  redirect(data.url);
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const limit = await rateLimitAsync(`reset:${email}`, RATES.resetPerHour, 60 * 60_000);
  if (!limit.ok) return { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` };
  const next = `/reset-password?email=${encodeURIComponent(email)}`;
  const redirectTo = `${appUrl()}/api/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await (await supabase()).auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: "We could not send a reset link. Please try again shortly." };
  redirect(next);
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8 || password.length > 128) return { error: "Password must be between 8 and 128 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const client = await supabase();
  const { data, error: authError } = await client.auth.getUser();
  if (authError || !data.user) return { error: "Open the secure password-reset link from your email before choosing a new password." };
  const { error } = await client.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: "Your password has been updated. You can now sign in." };
}

export async function signOutAction(): Promise<void> {
  await (await supabase()).auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
