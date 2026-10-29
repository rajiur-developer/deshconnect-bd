import "server-only";

import { insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";
import { listContentCategories } from "@/services/content-categories";
import type { Hospital } from "@/types/content";

export async function insforgeListAdminHospitals(query: {
  categories: string[];
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = query.pageSize ?? 50;
  const requestedPage = Math.max(1, query.page ?? 1);
  const params: Record<string, string> = {
    order: "updated_at.desc,id.asc",
    offset: ((requestedPage - 1) * pageSize).toString(),
    limit: pageSize.toString(),
  };
  if (query.categories.length) params.category = `in.(${query.categories.join(",")})`;
  addTextSearch(params, query.q, ["name", "address", "description"]);

  let result = await insforgeSelectMany("hospitals", params);
  const meta = makePageMeta(result.count, requestedPage, pageSize);
  if (meta.page !== requestedPage) {
    params.offset = ((meta.page - 1) * pageSize).toString();
    result = await insforgeSelectMany("hospitals", params);
  }
  return { items: (result.data ?? []) as Hospital[], meta: { ...meta, pageSize } };
}

export async function insforgeListHospitals(query: {
  q?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  category?: string;
  categories?: string[];
  sort?: "relevance" | "name" | "newest" | "rating";
  page?: number;
  pageSize?: number;
}) {
  const params: Record<string, string> = { status: "eq.published" };
  addTextSearch(params, query.q, ["name", "description", "address", "category"]);
  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
  if (query.categories?.length) params["category"] = `in.(${query.categories.join(",")})`;
  else if (query.category) params["category"] = `eq.${query.category}`;

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();
  params["order"] = query.sort === "name" ? "name.asc" : "created_at.desc";

  const { data, count } = await insforgeSelectMany("hospitals", params);
  const categories = await listContentCategories("hospital");
  const categoryNames = new Map(categories.map((category) => [category.value, category.name]));

  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      slug: (r.slug && r.slug.trim()) ? r.slug.trim() : `hospital-${r.id.slice(0, 8)}`,
      name: r.name,
      category: r.category,
      categoryName: categoryNames.get(r.category) ?? r.category,
      description: r.description,
      address: r.address,
      phone: r.phone,
      email: r.email,
      website: r.website,
      emergencyPhone: r.emergency_phone,
      latitude: r.latitude,
      longitude: r.longitude,
      image: r.image,
      verification: r.verification,
      source: r.source,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
      status: r.status,
      lastCheckedAt: r.last_checked_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })) as Hospital[],
    meta: makePageMeta(count, page, pageSize),
  };
}

export async function insforgeGetHospitalBySlug(slug: string): Promise<Hospital | null> {
  let data = await insforgeSelectOne("hospitals", { slug: `eq.${slug}`, status: "eq.published" });
  if (!data && slug.startsWith("hospital-")) {
    const idPrefix = slug.replace(/^hospital-/, "");
    data = await insforgeSelectOne("hospitals", { id: `ilike.${idPrefix}%`, status: "eq.published" });
  }
  if (!data) return null;

  const categories = await listContentCategories("hospital");
  const categoryName = categories.find((category) => category.value === data.category)?.name ?? data.category;

  return {
    id: data.id,
    slug: (data.slug && data.slug.trim()) ? data.slug.trim() : slug,
    name: data.name,
    category: data.category,
    categoryName,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
    emergencyPhone: data.emergency_phone,
    latitude: data.latitude,
    longitude: data.longitude,
    image: data.image,
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

export const listHospitals = insforgeListHospitals;
export const getHospitalBySlug = insforgeGetHospitalBySlug;

