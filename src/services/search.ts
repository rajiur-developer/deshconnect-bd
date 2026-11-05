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
