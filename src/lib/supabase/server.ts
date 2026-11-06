import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function supabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase publishable key.");
  }
  return { url, key };
}

/**
 * Server client used by Server Components, Server Actions and Route Handlers.
 * The database alias temporarily preserves the existing service API while
 * the InsForge-specific calls are migrated to Supabase.
 */
export async function createServerClient(options: { cookies?: CookieStore } = {}) {
  const store = options.cookies ?? await cookies();
  const { url, key } = supabaseCredentials();
  const client = createSupabaseServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            store.set(name, value, cookieOptions);
          });
        } catch {
          // Server Components cannot write cookies. Middleware refreshes the
          // session and persists cookie changes on the response.
        }
      },
    },
  });

  const auth = Object.assign(client.auth, {
    async getCurrentUser() {
      const result = await client.auth.getUser();
      const user = result.data.user
        ? {
            ...result.data.user,
            emailVerified: Boolean(result.data.user.email_confirmed_at),
            createdAt: result.data.user.created_at,
            profile: result.data.user.user_metadata,
          }
        : null;
      return { data: { user }, error: result.error };
    },
    async resendVerificationEmail(input: { email: string }) {
      return client.auth.resend({ type: "signup", email: input.email });
    },
    async sendResetPasswordEmail(input: { email: string }) {
      return client.auth.resetPasswordForEmail(input.email);
    },
    async exchangeResetPasswordToken(input: { email: string; code: string }) {
      const result = await client.auth.verifyOtp({ email: input.email, token: input.code, type: "recovery" });
      return { data: result.error ? null : { token: result.data.session?.access_token ?? "verified" }, error: result.error };
    },
    async resetPassword(input: { newPassword: string }) {
      return client.auth.updateUser({ password: input.newPassword });
    },
  });

  return Object.assign(client, { database: client, auth });
}


/** Compatibility adapter for the former InsForge auth-action interface. */
export function createAuthActions(options: { cookies: CookieStore }) {
  const clientPromise = createServerClient({ cookies: options.cookies });
  return {
    async signInWithPassword(input: { email: string; password: string }) {
      const client = await clientPromise;
      return client.auth.signInWithPassword(input);
    },
    async signUp(input: { email: string; password: string; name: string }) {
      const client = await clientPromise;
      const result = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { name: input.name, fullName: input.name } },
      });
      return {
        data: { user: result.data.user, requireEmailVerification: !result.data.session },
        error: result.error,
      };
    },
    async verifyEmail(input: { email: string; otp: string }) {
      const client = await clientPromise;
      return client.auth.verifyOtp({ email: input.email, token: input.otp, type: "signup" });
    },
    async signInWithOAuth(provider: "google", options: { redirectTo: string; skipBrowserRedirect?: boolean }) {
      const client = await clientPromise;
      const result = await client.auth.signInWithOAuth({ provider, options: { redirectTo: options.redirectTo } });
      return {
        data: result.data.url ? { url: result.data.url, codeVerifier: "supabase-pkce-cookie-managed" } : null,
        error: result.error,
      };
    },
    async signOut() {
      const client = await clientPromise;
      return client.auth.signOut();
    },
  };
}


/** Anonymous client for explicitly public, column-limited database views. */
export function createPublicClient() {
  const { url, key } = supabaseCredentials();
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
