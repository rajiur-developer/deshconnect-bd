import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
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
  });

  return Object.assign(client, { database: client, auth });
}
