import "server-only";

import { getDatabase, saveDatabase } from "@/lib/db/store";
import { createPublicClient, createServerClient } from "@/lib/supabase/server";

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

function parseFilter(expression: string): { operator: string; value: string } {
  const separator = expression.indexOf(".");
  return separator < 0
    ? { operator: "eq", value: expression }
    : { operator: expression.slice(0, separator), value: expression.slice(separator + 1) };
}

function applySupabaseParams(query: any, params: Record<string, string>) {
  for (const [field, expression] of Object.entries(params)) {
    if (["select", "offset", "limit", "order", "or"].includes(field)) continue;
    const { operator, value } = parseFilter(expression);
    if (operator === "eq") query = query.eq(field, value);
    else if (operator === "neq") query = query.neq(field, value);
    else if (operator === "ilike") query = query.ilike(field, value);
    else if (operator === "like") query = query.like(field, value);
    else if (operator === "gte") query = query.gte(field, value);
    else if (operator === "lte") query = query.lte(field, value);
    else if (operator === "gt") query = query.gt(field, value);
    else if (operator === "lt") query = query.lt(field, value);
    else if (operator === "in") query = query.in(field, value.replace(/^\\(|\\)$/g, "").split(",").map((item) => item.replace(/^"|"$/g, "")));
    else if (operator === "cs") query = query.contains(field, value.startsWith("{") ? value.slice(1, -1).split(",") : value);
  }
  if (params.or) query = query.or(params.or);
  if (params.order) {
    const [field, direction] = params.order.split(".");
    query = query.order(field, { ascending: direction !== "desc" });
  }
  const offset = Math.max(0, Number(params.offset ?? 0) || 0);
  const limit = Number(params.limit);
  if (Number.isFinite(limit) && limit >= 0) query = query.range(offset, offset + limit - 1);
  else if (offset > 0) query = query.range(offset, offset + 999);
  return query;
}

async function insforgeRequest(table: string, method: string, params: Record<string, string> = {}, body?: unknown, includeCount = false): Promise<any> {
  const client = ["public_profiles", "public_blood_donors"].includes(table) ? createPublicClient() : await createServerClient();
  let query: any;
  if (method === "GET") {
    query = client.from(table).select(params.select ?? "*", includeCount ? { count: "exact" } : undefined);
    query = applySupabaseParams(query, params);
  } else if (method === "POST") {
    query = client.from(table).insert(body).select("*");
  } else if (method === "PATCH") {
    query = client.from(table).update(body);
    query = applySupabaseParams(query, params).select("*");
  } else if (method === "DELETE") {
    query = client.from(table).delete();
    query = applySupabaseParams(query, params);
  } else {
    throw new Error(`Unsupported database operation: ${method}`);
  }
  const { data, error, count } = await query;
  if (error) throw new Error(`Supabase ${method} ${table} failed: ${error.message}`);
  return includeCount ? { data, count: count ?? data?.length ?? 0 } : data;
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
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
