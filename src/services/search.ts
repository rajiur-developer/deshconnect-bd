import type { Business, GovernmentService, Institution, News, Place } from "@/types/content";
import type { Post } from "@/types/community";
import { listPlaces } from "@/services/places";
import { listInstitutions } from "@/services/institutions";
import { listHospitals } from "@/services/hospitals";
import { listBusinesses } from "@/services/businesses";
import { listGovernmentServices } from "@/services/government-services";
import { listNews } from "@/services/news";
import { insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch } from "@/lib/insforge-query";
import { mapDbRow } from "@/lib/db/insforge";

export type GlobalSearchResults = {
  places: Place[];
  institutions: Institution[];
  businesses: Business[];
  governmentServices: GovernmentService[];
  news: News[];
  posts: Post[];
};

/** Categorised global search across the public directories and community posts. */
export async function globalSearch(query: string, limit = 4): Promise<GlobalSearchResults> {
  if (!query.trim()) {
    return { places: [], institutions: [], businesses: [], governmentServices: [], news: [], posts: [] };
  }

  const postParams: Record<string, string> = {
    status: "eq.visible",
    order: "created_at.desc",
    limit: String(limit),
  };
  addTextSearch(postParams, query, ["body"]);

  const [places, institutions, hospitals, businesses, governmentServices, news, postRows] = await Promise.all([
    listPlaces({ q: query, page: 1, pageSize: limit }),
    listInstitutions({ q: query, page: 1, pageSize: limit }),
    listHospitals({ q: query, page: 1, pageSize: limit }),
    listBusinesses({ q: query, page: 1, pageSize: limit }),
    listGovernmentServices({ q: query, page: 1, pageSize: limit }),
    listNews({ q: query, page: 1, pageSize: limit }),
    insforgeSelectMany("posts", postParams),
  ]);

  return {
    places: places.items,
    institutions: [...institutions.items, ...hospitals.items],
    businesses: businesses.items,
    governmentServices: governmentServices.items,
    news: news.items,
    posts: mapDbRow(postRows.data || []),
  };
}


export type SearchSuggestion = {
  label: string;
  category: string;
};

/** Fetch a small, resilient set of name suggestions while a user is typing. */
export async function searchSuggestions(query: string, perCategory = 5): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const results = await Promise.allSettled([
    listPlaces({ q, page: 1, pageSize: perCategory }),
    listInstitutions({ q, page: 1, pageSize: perCategory }),
    listHospitals({ q, page: 1, pageSize: perCategory }),
    listBusinesses({ q, page: 1, pageSize: perCategory }),
    listGovernmentServices({ q, page: 1, pageSize: perCategory }),
    listNews({ q, page: 1, pageSize: perCategory }),
  ]);

  const suggestions: SearchSuggestion[] = [];
  const add = (index: number, category: string, getLabel: (item: any) => string) => {
    const result = results[index];
    if (result.status !== "fulfilled") return;
    for (const item of result.value.items ?? []) {
      const label = String(getLabel(item) ?? "").trim();
      if (label) suggestions.push({ label, category });
    }
  };

  add(0, "Places", (item) => item.name);
  add(1, "Institutions", (item) => item.name);
  add(2, "Hospitals", (item) => item.name);
  add(3, "Businesses", (item) => item.name);
  add(4, "Government services", (item) => item.name);
  add(5, "News", (item) => item.title);

  const seen = new Set<string>();
  return suggestions.filter((item) => {
    const key = item.label.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}
