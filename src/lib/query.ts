// @ts-nocheck
import type { LocationRef } from "@/types/location";
export type Sort = "relevance" | "newest" | "name" | "rating";
export type DirectoryQuery = {
q?: string;
divisionId?: string | null;
districtId?: string | null;
upazilaId?: string | null;
page?: number;
sort?: Sort; };
/**
* Apply composable keyword + geographic filters. A record only survives if it
* matches every filter that is set, so "All" is simply an absent filter.
*/ export function applyDirectoryFilters<T extends LocationRef>(
items: T[],
query: DirectoryQuery,
fields: (keyof T)[] ): T[] {
let out = items;
if (query.divisionId) out = out.filter((item) => item.divisionId === query.divisionId);
if (query.districtId) out = out.filter((item) => item.districtId === query.districtId);
if (query.upazilaId) out = out.filter((item) => item.upazilaId === query.upazilaId);
const q = query.q?.trim().toLowerCase();
if (q) {
out = out.filter((item) =>
fields.some((field) => String(item[field] ?? "").toLowerCase().includes(q))
);
}
return out; }
type Sortable = { name?: string; title?: string; createdAt?: string; rating?: number };
export function sortItems<T extends Sortable>(items: T[], sort: Sort): T[] {
const copy = [...items];
switch (sort) {
case "name":
return copy.sort((a, b) => (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? ""));
case "newest":
return copy.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
case "rating":
return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
default:
return copy;
} }
export function parseSort(value: string | string[] | undefined): Sort {
const raw = Array.isArray(value) ? value[0] : value;
return raw === "newest" || raw === "name" || raw === "rating" ? raw : "relevance"; }
/** Normalise a search param (which may be an array) to a single string. */ export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    const next = value.find((part) => typeof part === "string" && part.trim().length > 0);
    return next !== undefined ? next : undefined;
  }
  return value && value.trim() ? value : undefined;
}
/** Build a URL that keeps current filters, with per-key overrides. */ export function buildHref(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string | number | undefined> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    const firstValue = Array.isArray(value)
      ? value.find((part) => typeof part === "string" && part.trim().length > 0)
      : value;
    if (firstValue === undefined || firstValue === "") continue;
    search.set(key, String(firstValue));
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") search.delete(key);
    else search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
