import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export async function getRolePermissionOverrides(): Promise<Record<string, string[]>> {
  const client = await createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database
    .from("role_permission_overrides")
    .select("role,actions");
  if (error) throw new Error(`Could not load role permissions: ${error.message}`);
  return Object.fromEntries((data ?? []).map((row: any) => [row.role, row.actions ?? []]));
}

export async function saveRolePermissionOverrides(
  overrides: Record<string, string[]>,
  actorId: string,
) {
  const client = await createServerClient({ cookies: await cookies() });
  const rows = ["user", "moderator"].map((role) => ({
    role,
    actions: overrides[role] ?? [],
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await client.database
    .from("role_permission_overrides")
    .upsert(rows, { onConflict: "role" });
  if (error) throw new Error(`Could not save role permissions: ${error.message}`);
}
