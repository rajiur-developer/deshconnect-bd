import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { PublicUser } from "@/types/auth";
import { PROFILE_IMAGE_BUCKET } from "@/features/account/constants";
import { isR2PublicMediaUrl } from "@/lib/storage/media-url";

function makeUsername(email: string, id: string) {
  const base = (email.split("@")[0] ?? "member").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 16) || "member";
  return `${base}_${id.replaceAll("-", "").slice(-6)}`;
}

async function resolveProfile(user: any): Promise<PublicUser | null> {
  const fallback: PublicUser = {
    id: user.id,
    username: makeUsername(user.email, user.id),
    fullName: user.user_metadata?.fullName || user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0] || "Member",
    avatar: user.user_metadata?.avatar_url || "",
    bio: "",
    role: "user",
    createdAt: user.created_at,
  };
  const client = createServerClient({ cookies: await cookies() });
  const { data: profile, error } = await client.database.from("profiles")
    .select("id,username,full_name,avatar,avatar_key,bio,division_id,district_id,upazila_id,role,status,created_at")
    .eq("id", user.id).maybeSingle();
  if (!profile && !error) {
    const { error: insertError } = await client.database.from("profiles").insert([{
      id: user.id, username: fallback.username, full_name: fallback.fullName,
      email: user.email, avatar: fallback.avatar, role: "user", status: "active",
      email_verified: user.emailVerified,
    }]);
    if (insertError) console.error("Could not create a missing profile for the current user.", insertError.message);
  }
  const row: any = profile ?? fallback;
  if (row.status && row.status !== "active") return null;
  let avatar = row.avatar ?? fallback.avatar;
  if (row.avatar_key && !isR2PublicMediaUrl(row.avatar ?? "", row.avatar_key)) {
    const { data } = await client.storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(row.avatar_key, 3600);
    avatar = data?.signedUrl ?? avatar;
  }
  return {
    id: row.id ?? fallback.id, username: row.username ?? fallback.username,
    fullName: row.full_name ?? fallback.fullName, avatar, avatarKey: row.avatar_key,
    bio: row.bio ?? "", divisionId: row.division_id ?? null,
    districtId: row.district_id ?? null, upazilaId: row.upazila_id ?? null,
    role: row.role === "admin" || row.role === "moderator" ? row.role : "user",
    createdAt: row.created_at ?? fallback.createdAt,
  };
}

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return resolveProfile(data.user);
});

/** Require a Supabase Auth session, otherwise redirect to /login. */
export async function requireUser(redirectTo?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo ? `/login?next=${encodeURIComponent(redirectTo)}` : "/login");
  return user;
}
