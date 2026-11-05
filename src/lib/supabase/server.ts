import { createServerClient as createSupabaseSsrClient } from "@supabase/ssr";
import { createServerClient as createInsForgeSsrClient } from "@insforge/sdk/ssr";

type CookieStore = {
  getAll: () => Array<{ name: string; value: string }>;
  set: (name: string, value: string, options?: any) => void;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();

export function createSupabaseServerClient(cookieStore: CookieStore) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase URL and publishable key are required.");
  return createSupabaseSsrClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot mutate cookies; middleware refreshes sessions. */ }
      },
    },
  });
}

/** Supabase handles Auth and relational data; InsForge storage remains temporarily for legacy media. */
export function createServerClient({ cookies: cookieStore }: { cookies: CookieStore }) {
  const supabase = createSupabaseServerClient(cookieStore);
  const legacyMedia = createInsForgeSsrClient({ cookies: cookieStore });
  const auth = supabase.auth as typeof supabase.auth & { getCurrentUser?: typeof supabase.auth.getUser };
  auth.getCurrentUser = auth.getUser.bind(auth);
  return Object.assign(supabase as any, {
    database: { from: supabase.from.bind(supabase), rpc: supabase.rpc.bind(supabase) },
    storage: legacyMedia.storage,
  });
}
