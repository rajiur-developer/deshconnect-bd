import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { getDatabase } from "@/lib/db/store";

async function findDevelopmentUser(match: (user: any) => boolean) {
  if (process.env.NODE_ENV !== "development") return null;
  const db = await getDatabase();
  const user = db.users.find(match);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    password_hash: user.passwordHash,
    phone: user.phone,
    avatar: user.avatar,
    avatarKey: user.avatarKey,
    bio: user.bio,
    divisionId: user.divisionId,
    districtId: user.districtId,
    upazilaId: user.upazilaId,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    termsAcceptedAt: user.termsAcceptedAt,
    bloodGroup: user.bloodGroup,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function insforgeListUsers(query?: {
  page?: number;
  pageSize?: number;
  ids?: string[];
}) {
  const params: Record<string, string> = {};
  const ids = [...new Set(query?.ids ?? [])].filter(Boolean);
  if (ids.length) params.id = `in.(${ids.join(",")})`;
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? (ids.length || 200);
  params.offset = ((page - 1) * pageSize).toString();
  params.limit = pageSize.toString();
  params.order = "created_at.desc";
  // Public directories and author lists must use the public view. The profiles
  // table intentionally denies anonymous reads and includes private fields.
  const { data, error } = await insforgeSelectMany("public_profiles", params);
  if (error) throw error;
  return (data || []).map((r: any) => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      email: null,
      phone: null,
      avatar: r.avatar,
      avatarKey: r.avatar_key,
      bio: r.bio,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
      role: undefined,
      status: undefined,
      emailVerified: undefined,
      termsAcceptedAt: undefined,
      bloodGroup: undefined,
      gender: undefined,
      dateOfBirth: undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
  }));
}

export async function listAdminUsers() {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database.from("profiles")
    .select("id,username,full_name,email,phone,avatar,bio,division_id,district_id,upazila_id,role,status,email_verified,terms_accepted_at,blood_group,gender,date_of_birth,created_at,updated_at")
    .order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id, username: r.username, fullName: r.full_name, email: r.email, phone: r.phone,
    avatar: r.avatar, bio: r.bio, divisionId: r.division_id, districtId: r.district_id,
    upazilaId: r.upazila_id, role: r.role, status: r.status, emailVerified: r.email_verified,
    termsAcceptedAt: r.terms_accepted_at, bloodGroup: r.blood_group, gender: r.gender,
    dateOfBirth: r.date_of_birth, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

export async function insforgeUpdateUserStatus(userId: string, status: string) {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database.from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", userId).select("id,status").maybeSingle();
  if (error) throw error;
  return data;
}

export async function insforgeDeleteUser(userId: string) {
  await insforgeDelete("profiles", userId);
  return { ok: true };
}
export const setUserStatus = insforgeUpdateUserStatus;
export async function setUserRole(userId: string, role: string) {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", userId).select("id,role").maybeSingle();
  if (error) throw error;
  return data;
}
export async function listConnections(userId: string) {
  const { data: edges } = await insforgeSelectMany("connections", { or: `(requester_id.eq.${userId},addressee_id.eq.${userId})`, status: "eq.accepted" });
  const ids = [...new Set(edges.map((edge: any) => edge.requester_id === userId ? edge.addressee_id : edge.requester_id))];
  const users = await Promise.all(ids.map((id) => insforgeGetUserById(id)));
  return users.filter(Boolean);
}

export async function insforgeToggleModerator(userId: string) {
  const current = await insforgeSelectOne("profiles", { id: `eq.${userId}` });
  if (!current) throw new Error("User not found");
  const newRole = current.role === "moderator" ? "user" : "moderator";
  const { data, error } = await insforgeUpdate("profiles", userId, {
    role: newRole,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return data;
}

export async function insforgeAuditLog(input: {
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  outcome: string;
  detail?: string | null;
}) {
  const { data, error } = await insforgeInsert("audit_logs", {
    actor_id: input.actorId,
    actor_name: input.actorName,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    outcome: input.outcome,
    detail: input.detail,
  });
  if (error) throw error;
  return data;
}

// Wrapper exports for backward compatibility
export const getUserById = insforgeGetUserById;
export const getUserByUsername = insforgeGetUserByUsername;
export const getUserByEmail = insforgeGetUserByEmail;
export const listUsers = insforgeListUsers;
export const updateUserStatus = insforgeUpdateUserStatus;
export const deleteUser = insforgeDeleteUser;
export const toggleModerator = insforgeToggleModerator;
export const auditLog = insforgeAuditLog;

export async function insforgeGetUserById(userId: string) {
  let data;
  try { data = await insforgeSelectOne("profiles", { id: `eq.${userId}` }); } catch {}
  if (!data) try { data = await insforgeSelectOne("public_profiles", { id: `eq.${userId}` }); } catch {}
  if (!data) return findDevelopmentUser((user) => user.id === userId);
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar,
    avatarKey: data.avatar_key,
    bio: data.bio,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    role: data.role ?? "user",
    status: data.status ?? "active",
    emailVerified: data.email_verified ?? false,
    termsAcceptedAt: data.terms_accepted_at,
    bloodGroup: data.blood_group,
    gender: data.gender,
    dateOfBirth: data.date_of_birth,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function insforgeGetUserByUsername(username: string) {
  let data;
  try { data = await insforgeSelectOne("public_profiles", { username: `eq.${username}` }); } catch {}
  if (!data) return findDevelopmentUser((user) => user.username === username);
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar,
    avatarKey: data.avatar_key,
    bio: data.bio,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    role: data.role ?? "user",
    status: data.status ?? "active",
    emailVerified: data.email_verified ?? false,
    termsAcceptedAt: data.terms_accepted_at,
    bloodGroup: data.blood_group,
    gender: data.gender,
    dateOfBirth: data.date_of_birth,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function insforgeGetUserByEmail(email: string) {
  let data;
  try { data = await insforgeSelectOne("profiles", { email: `eq.${email.toLowerCase()}` }); } catch {}
  if (!data) return findDevelopmentUser((user) => user.email.toLowerCase() === email.toLowerCase());
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    email: data.email,
    password_hash: data.password_hash,
    phone: data.phone,
    avatar: data.avatar,
    bio: data.bio,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    role: data.role,
    status: data.status,
    emailVerified: data.email_verified,
    termsAcceptedAt: data.terms_accepted_at,
    bloodGroup: data.blood_group,
    gender: data.gender,
    dateOfBirth: data.date_of_birth,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function insforgeCreateUser(input: {
  username: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  role?: string;
  status?: string;
}) {
  const { data, error } = await insforgeInsert("profiles", {
    username: input.username,
    full_name: input.fullName,
    email: input.email.toLowerCase(),
    password_hash: input.passwordHash,
    phone: input.phone ?? null,
    avatar: input.avatar ?? null,
    blood_group: input.bloodGroup ?? null,
    gender: input.gender ?? null,
    date_of_birth: input.dateOfBirth ?? null,
    division_id: input.divisionId ?? null,
    district_id: input.districtId ?? null,
    upazila_id: input.upazilaId ?? null,
    role: input.role ?? "user",
    status: input.status ?? "active",
    terms_accepted_at: new Date().toISOString(),
  });
  if (error) throw error;
  if (!data?.id) throw new Error("Account could not be created. Please try again.");
  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    status: data.status,
  };
}
