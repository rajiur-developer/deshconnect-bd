import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeDeleteWhere, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";
import { listContentCategories } from "@/services/content-categories";

export async function insforgeListPlaces(query: {
  q?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  category?: string;
  sort?: "relevance" | "name" | "newest" | "rating";
  page?: number;
  pageSize?: number;
}) {
  const params: Record<string, string> = { status: "eq.published" };
  addTextSearch(params, query.q, ["name", "summary", "description", "address", "category"]);
  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
  if (query.category) params["category"] = `eq.${query.category}`;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();
  params["order"] = query.sort === "name" ? "name.asc" : query.sort === "newest" ? "created_at.desc" : query.sort === "rating" ? "rating.desc" : "created_at.desc";

  const [{ data, count }, categories] = await Promise.all([
    insforgeSelectMany("places", params),
    listContentCategories("place"),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      slug: (r.slug && r.slug.trim()) ? r.slug.trim() : `place-${r.id.slice(0, 8)}`,
      name: r.name,
      category: r.category,
      categoryName: categoryNames.get(r.category) ?? r.category,
      summary: r.summary,
      description: r.description,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      image: r.image,
      gallery: r.gallery,
      rating: r.rating,
      reviewCount: r.review_count,
      openingHours: r.opening_hours,
      entryFee: r.entry_fee,
      bestTime: r.best_time,
      verification: r.verification,
      source: r.source,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
      status: r.status,
      lastCheckedAt: r.last_checked_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    meta: makePageMeta(count, page, pageSize),
  };
}

export async function insforgeGetPlaceBySlug(slug: string) {
  let data = await insforgeSelectOne("places", { slug: `eq.${slug}`, status: "eq.published" });
  if (!data && slug.startsWith("place-")) {
    const idPrefix = slug.replace(/^place-/, "");
    data = await insforgeSelectOne("places", { id: `ilike.${idPrefix}%`, status: "eq.published" });
  }
  if (!data) return null;
  const categories = await listContentCategories("place");
  const categoryName = categories.find((category) => category.value === data.category)?.name ?? data.category;
  return {
    id: data.id,
    slug: (data.slug && data.slug.trim()) ? data.slug.trim() : slug,
    name: data.name,
    category: data.category,
    categoryName,
    summary: data.summary,
    description: data.description,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    image: data.image,
    gallery: data.gallery,
    rating: data.rating,
    reviewCount: data.review_count,
    openingHours: data.opening_hours,
    entryFee: data.entry_fee,
    bestTime: data.best_time,
    verification: data.verification,
    source: data.source,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    status: data.status,
    lastCheckedAt: data.last_checked_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function insforgeGetReviewsForPlace(placeId: string) {
  const { data } = await insforgeSelectMany("reviews", { place_id: `eq.${placeId}`, status: "eq.visible", order: "created_at.desc" });
  return (data || []).map((r: any) => ({
    id: r.id,
    placeId: r.place_id,
    authorId: r.author_id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function insforgeIsPlaceSaved(userId: string, placeId: string) {
  const data = await insforgeSelectOne("saved_places", { user_id: `eq.${userId}`, place_id: `eq.${placeId}` });
  return !!data;
}

export async function insforgeToggleSavePlace(userId: string, placeId: string) {
  const existing = await insforgeIsPlaceSaved(userId, placeId);
  if (existing) {
    await insforgeDeleteWhere("saved_places", { user_id: `eq.${userId}`, place_id: `eq.${placeId}` });
    return { saved: false };
  } else {
    await insforgeInsert("saved_places", { user_id: userId, place_id: placeId });
    return { saved: true };
  }
}
export const listPlaces = insforgeListPlaces;
export const getPlaceBySlug = insforgeGetPlaceBySlug;
export const getReviewsForPlace = insforgeGetReviewsForPlace;
export const isPlaceSaved = insforgeIsPlaceSaved;
export async function featuredPlaces(limit = 6) {
  const result = await insforgeListPlaces({ sort: "rating", page: 1, pageSize: limit });
  return result.items;
}
export async function placesByDivision(divisionId: string, limit = 6) {
  const result = await insforgeListPlaces({ divisionId, page: 1, pageSize: limit });
  return result.items;
}
export async function listSavedPlaces(userId: string) {
  const { data } = await insforgeSelectMany("saved_places", { user_id: `eq.${userId}` });
  const places = await Promise.all(data.map((row: any) => insforgeSelectOne("places", { id: `eq.${row.place_id}`, status: "eq.published" }).catch(() => null)));
  const categories = await listContentCategories("place");
  const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
  return places.filter(Boolean).map((row: any) => ({ id: row.id, slug: row.slug, name: row.name, category: row.category, categoryName: categoryNames.get(row.category) ?? row.category, summary: row.summary, description: row.description, address: row.address, image: row.image, rating: row.rating, reviewCount: row.review_count, divisionId: row.division_id, districtId: row.district_id, upazilaId: row.upazila_id, status: row.status, verification: row.verification, createdAt: row.created_at, updatedAt: row.updated_at }));
}
