import "server-only";

import { createClient } from "@insforge/sdk";
import { cookies } from "next/headers";
import { getDatabase, saveDatabase } from "@/lib/db/store";

// Trailing slashes must be stripped: paths below already start with "/", so
// "https://host/" would produce "https://host//api/..." which InsForge answers
// with a 404 HTML page instead of JSON.
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim().replace(/\/+$/, "");
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim();

if (!INSFORGE_URL || !ANON_KEY) {
  throw new Error(
    "NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY are required. " +
      "Set them in .env.local (see .env.example); the URL must not end with a slash.",
  );
}

async function currentAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("insforge_access_token")?.value ?? null;
}

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: ANON_KEY,
  fetch: async (input, init) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    const accessToken = await currentAccessToken();
    headers.set("apikey", ANON_KEY);
    headers.set("Authorization", `Bearer ${accessToken ?? ANON_KEY}`);
    return fetch(input, { ...init, headers });
  },
});

const LOCAL_TABLES: Record<string, string> = {
  profiles: "users", divisions: "divisions", districts: "districts", upazilas: "upazilas",
  places: "places", institutions: "institutions", hospitals: "hospitals", businesses: "businesses",
  government_services: "governmentServices", news: "news", reviews: "reviews", posts: "posts",
  public_blood_donors: "donors",
  comments: "comments", reports: "reports", connections: "connections", conversations: "conversations",
  messages: "messages", notifications: "notifications", blood_donors: "donors", blood_requests: "bloodRequests",
  saved_places: "saved",
};

function toDatabaseRow(value: any): any {
  if (Array.isArray(value)) return value.map(toDatabaseRow);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.replace(/_([a-z])/g, (_m, c) => c.toUpperCase()), toDatabaseRow(item)]));
}
function toPostgresRow(value: any): any {
  if (Array.isArray(value)) return value.map(toPostgresRow);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), toPostgresRow(item)]));
}
function matchesFilter(value: any, expression: string): boolean {
  const separator = expression.indexOf(".");
  if (separator < 0) return true;
  const operator = expression.slice(0, separator);
  const expected = expression.slice(separator + 1);
  if (operator === "eq") return String(value ?? "") === expected;
  if (operator === "neq") return String(value ?? "") !== expected;
  if (operator === "ilike") return String(value ?? "").toLowerCase().includes(expected.replaceAll("%", "").replaceAll("*", "").toLowerCase());
  if (operator === "cs") return Array.isArray(value) && value.includes(expected.replace(/[{}]/g, ""));
  if (operator === "in") return expected.replace(/[()\"]/g, "").split(",").includes(String(value));
  if (operator === "gte") return String(value ?? "") >= expected;
  if (operator === "lte") return String(value ?? "") <= expected;
  return true;
}
async function localRows(table: string, params: Record<string, string>): Promise<{ data: any[]; count: number }> {
  if (process.env.NODE_ENV !== "development") return { data: [], count: 0 };
  const db = await getDatabase();
  const key = LOCAL_TABLES[table];
  const source = key ? (db as any)[key] : null;
  if (!Array.isArray(source)) return { data: [], count: 0 };
  let rows = source.map((row: any) => {
    if (table === "saved_places") return { id: `${row.userId}:${row.placeId}`, user_id: row.userId, place_id: row.placeId, created_at: row.createdAt };
    return toPostgresRow(row);
  });
  if (table === "public_blood_donors") {
    const now = Date.now();
    rows = rows.filter((row: any) => row.consent_listed === true && row.consent_contact === true && !row.archived_at && (!row.consent_expiry || new Date(row.consent_expiry).getTime() >= now));
  }
  if (params.or) {
    const alternatives = [...params.or.matchAll(/([a-z_]+)\.(eq|ilike)\.([^,)]+)/g)];
    rows = rows.filter((row) => alternatives.some(([, field, operator, expected]) => matchesFilter(row[field], `${operator}.${expected.replace(/[\"']/g, "")}`)));
  }
  for (const [field, expression] of Object.entries(params)) {
    if (["select", "offset", "limit", "order", "or"].includes(field) || field.includes(".")) continue;
    rows = rows.filter((row) => matchesFilter(row[field], expression));
  }
  if (params.order) {
    const [field, direction] = params.order.split(".");
    rows.sort((a, b) => String(a[field] ?? "").localeCompare(String(b[field] ?? "")) * (direction === "desc" ? -1 : 1));
  }
  const count = rows.length;
  const offset = Math.max(0, Number(params.offset ?? 0) || 0);
  const limit = Number(params.limit);
  return { data: rows.slice(offset, Number.isFinite(limit) && limit >= 0 ? offset + limit : undefined), count };
}

async function insforgeRequest(table: string, method: string, params: Record<string, string> = {}, body?: unknown, includeCount = false): Promise<any> {
  const query = new URLSearchParams(params).toString();
  // InsForge exposes its PostgREST-compatible database API under this path.
  // `/rest/v1` is a Supabase URL and returns `Cannot POST /rest/v1/...` here.
  const url = `${INSFORGE_URL}/api/database/records/${table}${query ? `?${query}` : ""}`;
  const accessToken = await currentAccessToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      apikey: ANON_KEY,
      ...((method === "POST" || method === "PATCH") ? { Prefer: "return=representation" } : {}),
      ...(includeCount ? { Prefer: "count=exact" } : {}),
      Authorization: `Bearer ${accessToken ?? ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`InsForge ${method} ${table} failed: ${res.status} ${text}`);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!includeCount) return data;
  const contentRange = res.headers.get("content-range");
  const totalValue = contentRange?.split("/").at(-1);
  const count = totalValue && totalValue !== "*" ? Number(totalValue) : undefined;
  return { data, count: Number.isFinite(count) ? count : undefined };
}

export async function insforgeGet(table: string, params: Record<string, string> = {}): Promise<any> {
  return insforgeRequest(table, "GET", params);
}

export async function insforgeInsert(table: string, record: Record<string, unknown>): Promise<any> {
  try {
    const result = await insforgeRequest(table, "POST", {}, record);
    return { data: Array.isArray(result) ? result[0] ?? null : result, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    const key = LOCAL_TABLES[table];
    if (!key) throw error;
    const now = new Date().toISOString();
    const dbRow = toDatabaseRow(record);
    const id = String(dbRow.id ?? crypto.randomUUID());
    const row = { id, createdAt: dbRow.createdAt ?? now, updatedAt: dbRow.updatedAt ?? now, status: dbRow.status ?? "active", ...dbRow };
    await saveDatabase((db: any) => {
      if (table === "saved_places") db.saved.push({ userId: row.userId, placeId: row.placeId, createdAt: now });
      else db[key].push(row);
    });
    return { data: toPostgresRow(row), error: null };
  }
}

export async function insforgeUpdate(table: string, id: string, record: Record<string, unknown>): Promise<any> {
  try {
    const [filterField, filterValue] = id.includes(".eq.") ? id.split(".eq.") : ["id", id];
    const result = await insforgeRequest(table, "PATCH", { [filterField]: `eq.${filterValue}` }, record);
    return { data: Array.isArray(result) ? result : result ? [result] : [], error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    const key = LOCAL_TABLES[table];
    if (!key) throw error;
    const [field, expected] = id.includes(".eq.") ? id.split(".eq.") : ["id", id];
    const patch = toDatabaseRow(record);
    const updated: any[] = [];
    await saveDatabase((db: any) => {
      for (const row of db[key] ?? []) if (String(row[field] ?? "") === expected) { Object.assign(row, patch, { updatedAt: new Date().toISOString() }); updated.push(toPostgresRow(row)); }
    });
    return { data: updated, error: null };
  }
}

export async function insforgeDelete(table: string, id: string): Promise<void> {
  const [filterField, filterValue] = id.includes(".eq.") ? id.split(".eq.") : ["id", id];
  try { await insforgeRequest(table, "DELETE", { [filterField]: `eq.${filterValue}` }); }
  catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    const key = LOCAL_TABLES[table];
    if (!key) throw error;
    if (table === "saved_places" && id.includes(":")) {
      const [userId, placeId] = id.split(":");
      await saveDatabase((db: any) => { db.saved = db.saved.filter((row: any) => row.userId !== userId || row.placeId !== placeId); });
      return;
    }
    const [field, expected] = id.includes(".eq.") ? id.split(".eq.") : ["id", id];
    await saveDatabase((db: any) => { db[key] = (db[key] ?? []).filter((row: any) => String(row[field] ?? "") !== expected); });
  }
}

export async function insforgeDeleteWhere(table: string, params: Record<string, string>): Promise<void> {
  try {
    await insforgeRequest(table, "DELETE", params);
  } catch (error) {
    if (process.env.NODE_ENV !== "development" || table !== "saved_places") throw error;
    const userId = params.user_id?.replace(/^eq\./, "");
    const placeId = params.place_id?.replace(/^eq\./, "");
    await saveDatabase((db: any) => {
      db.saved = db.saved.filter((row: any) => row.userId !== userId || row.placeId !== placeId);
    });
  }
}

export async function insforgeSelectOne(table: string, params: Record<string, string> = {}): Promise<any | null> {
  try {
    const result = await insforgeRequest(table, "GET", { ...params, limit: "1" });
    const arr = Array.isArray(result) ? result : [result];
    return arr[0] ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    const { data } = await localRows(table, { ...params, limit: "1" });
    return data[0] ?? null;
  }
}

export async function insforgeSelectMany(table: string, params: Record<string, string> = {}): Promise<{ data: any[]; error: any; count: number }> {
  try {
    const result = await insforgeRequest(table, "GET", params, undefined, true);
    const data = Array.isArray(result.data) ? result.data : result.data == null ? [] : [result.data];
    // During local development the remote schema can exist before its seed data
    // has been copied over. Keep the same local catalog visible until then.
    if (process.env.NODE_ENV === "development" && data.length === 0) {
      const local = await localRows(table, params);
      if (local.data.length > 0) return { data: local.data, error: null, count: local.count };
    }
    return { data, error: null, count: result.count ?? data.length };
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    const result = await localRows(table, params);
    return { data: result.data, error: null, count: result.count };
  }
}

export function isInsforgeConfigured(): boolean {
  return Boolean(INSFORGE_URL && ANON_KEY);
}
