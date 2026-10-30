import type { Business, GovernmentService, Institution, News, Place } from "@/types/content"; import type { Post } from "@/types/community";
import { listPlaces } from "@/services/places";
import { listInstitutions } from "@/services/institutions";
import { listHospitals } from "@/services/hospitals";
import { listBusinesses } from "@/services/businesses";
import { listGovernmentServices } from "@/services/government-services";
import { listNews } from "@/services/news";
import { insforgeSelectMany } from "@/lib/insforge";
import { mapDbRow } from "@/lib/db/insforge";
export type GlobalSearchResults = {
places: Place[];
institutions: Institution[];
businesses: Business[];
governmentServices: GovernmentService[];
news: News[];
posts: Post[]; };
/** Build the set of lowercase needles to match against. */ function buildNeedles(query: string): string[] {
const base = query.trim().toLowerCase();
return base ? [base] : []; }
function matches(haystack: string[], needles: string[]): boolean {
return haystack.some((field) => {
const value = field.toLowerCase();
return needles.some((needle) => value.includes(needle));
}); }
/** Categorised global search across the public directories. */ export async function globalSearch(query: string, limit = 4): Promise<GlobalSearchResults> {
const needles = buildNeedles(query);
if (!needles.length) {
return { places: [], institutions: [], businesses: [], governmentServices: [], news: [], posts: [] };
}
const [places, institutions, hospitals, businesses, governmentServices, news, postRows] = await Promise.all([
listPlaces({ q: query, page: 1, pageSize: limit }),
listInstitutions({ q: query, page: 1, pageSize: limit }),
listBusinesses({ q: query, page: 1, pageSize: limit }),
listGovernmentServices({ q: query, page: 1, pageSize: limit }),
listNews({ q: query, page: 1, pageSize: limit }),
insforgeSelectMany("posts", { status: "eq.visible", body: `ilike.*${query.trim().replace(/[(),%_*]/g, " ").replace(/\s+/g, " ")}*`, order: "created_at.desc", limit: String(limit) }),
]);
return { places: places.items, institutions: [...institutions.items, ...hospitals.items].slice(0, limit), businesses: businesses.items, governmentServices: governmentServices.items, news: news.items, posts: mapDbRow(postRows.data || []) }; }
