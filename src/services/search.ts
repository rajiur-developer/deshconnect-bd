import { normalizeSearchIdentity } from "@/lib/search-transliteration";
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
  alternateLabel?: string;
  category: string;
};

/** Normalize Bengali and Latin spellings so equivalent names can be shown together. */
function suggestionIdentity(value: string): string {
  return normalizeSearchIdentity(value) || value.trim().toLocaleLowerCase();
}

/** Fetch names in either script; when both spellings exist, expose both in one suggestion. */
export async function searchSuggestions(query: string, perCategory = 8, scope = "all"): Promise<SearchSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const categories = scope === "all"
    ? ["places", "institutions", "hospitals", "businesses", "government-services", "news"]
    : [scope];
  const loaders: Record<string, () => Promise<any>> = {
    places: () => listPlaces({ q, page: 1, pageSize: perCategory }),
    institutions: () => listInstitutions({ q, page: 1, pageSize: perCategory }),
    hospitals: () => listHospitals({ q, page: 1, pageSize: perCategory }),
    businesses: () => listBusinesses({ q, page: 1, pageSize: perCategory }),
    "government-services": () => listGovernmentServices({ q, page: 1, pageSize: perCategory }),
    news: () => listNews({ q, page: 1, pageSize: perCategory }),
  };
  const results = await Promise.allSettled(categories.map((category) => loaders[category]()));

  const raw: SearchSuggestion[] = [];
  const add = (index: number, category: string, getLabel: (item: any) => string) => {
    const result = results[index];
    if (result.status !== "fulfilled") return;
    for (const item of result.value.items ?? []) {
      const label = String(getLabel(item) ?? "").trim();
      if (label) raw.push({ label, category });
    }
  };

  const categoryLabels: Record<string, { label: string; getLabel: (item: any) => string }> = {
    places: { label: "Places", getLabel: (item) => item.name },
    institutions: { label: "Institutions", getLabel: (item) => item.name },
    hospitals: { label: "Hospitals", getLabel: (item) => item.name },
    businesses: { label: "Businesses", getLabel: (item) => item.name },
    "government-services": { label: "Government services", getLabel: (item) => item.name },
    news: { label: "News", getLabel: (item) => item.title },
  };
  categories.forEach((category, index) => {
    const config = categoryLabels[category];
    if (config) add(index, config.label, config.getLabel);
  });

  const groups = new Map<string, SearchSuggestion[]>();
  for (const item of raw) {
    const key = `${item.category}:${suggestionIdentity(item.label)}`;
    const group = groups.get(key) ?? [];
    if (!group.some((entry) => entry.label.toLocaleLowerCase() === item.label.toLocaleLowerCase())) {
      group.push(item);
      groups.set(key, group);
    }
  }

  const suggestions: SearchSuggestion[] = [];
  for (const group of groups.values()) {
    const english = group.find((item) => !/[\u0980-\u09FF]/.test(item.label));
    const bengali = group.find((item) => /[\u0980-\u09FF]/.test(item.label));
    if (english && bengali) {
      suggestions.push({ label: english.label, alternateLabel: bengali.label, category: english.category });
    } else if (group[0]) {
      suggestions.push(group[0]);
    }
  }
  return suggestions.slice(0, 10);
}
