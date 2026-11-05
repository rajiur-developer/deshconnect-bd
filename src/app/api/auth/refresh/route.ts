import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(): Promise<Response> {
  const client = createSupabaseServerClient(await cookies());
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true });
}
