"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { requireUser } from "@/lib/auth/current-user";

export async function decideNewsDeletionAction(
  requestId: string,
  decision: "approved" | "rejected",
): Promise<{ ok: boolean; error?: string }> {
  if (!requestId || !["approved", "rejected"].includes(decision)) {
    return { ok: false, error: "Invalid deletion request." };
  }

  const user = await requireUser("/admin");
  if (user.role !== "admin" && user.role !== "moderator") {
    return { ok: false, error: "Only admins and moderators can review deletion requests." };
  }

  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database.rpc("decide_news_deletion_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_reason: null,
  });

  if (error) {
    console.error("News deletion decision failed", { code: error.code, message: error.message });
    return { ok: false, error: "Could not save the deletion decision." };
  }
  if (data !== true) return { ok: false, error: "This request was already reviewed or no longer exists." };

  revalidatePath("/admin/news/deletion-requests");
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/admin/notifications");
  return { ok: true };
}
