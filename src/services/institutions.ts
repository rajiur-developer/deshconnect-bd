import "server-only";

import { insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";
import { listContentCategories } from "@/services/content-categories";

export async function insforgeListAdminInstitutions(query: {
  categories: string[];
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.max(1, Math.min(100, query.pageSize ?? 50));
  const requestedPage = Math.max(1, query.page ?? 1);
  const params: Record<string, string> = {
    order: "updated_at.desc,id.asc",
    offset: ((requestedPage - 1) * pageSize).toString(),
    limit: pageSize.toString(),
  };

  if (query.categories.length) {
    params.category = `in.(${query.categories.join(",")})`;
  }

  addTextSearch(params, query.q, ["name", "address", "description"]);

  let result = await insforgeSelectMany("institutions", params);
  const meta = makePageMeta(result.count, requestedPage, pageSize);

  if (meta.page !== requestedPage) {
    params.offset = ((meta.page - 1) * pageSize).toString();
    result = await insforgeSelectMany("institutions", params);
  }

  return { items: result.data ?? [], meta: { ...meta, pageSize } };
}

export async function insforgeListInstitutions(query: {
  q?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  category?: string;
  categories?: string[];
  sort?: "relevance" | "name" | "newest" | "rating";
  page?: number;
  pageSize?: number;
} = {}) {
  const params: Record<string, string> = { status: "eq.published" };

  addTextSearch(params, query.q, ["name", "description", "address", "category"]);

  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;

  if (query.categories?.length) {
    params["category"] = `in.(${query.categories.join(",")})`;
  } else if (query.category) {
    params["category"] = `eq.${query.category}`;
  }

  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, query.pageSize ?? 12));

  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();

  switch (query.sort) {
    case "name":
      params["order"] = "name.asc";
      break;
    case "rating":
      params["order"] = "rating.desc";
      break;
    case "relevance":
      params["order"] = "name.asc";
      break;
    case "newest":
    default:
      params["order"] = "created_at.desc";
      break;
  }

  const { data, count } = await insforgeSelectMany("institutions", params);
  const categories = await listContentCategories("institution");
  const categoryNames = new Map(
    categories.map((category) => [category.value, category.name]),
  );

  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
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
    })),
    meta: makePageMeta(count, page, pageSize),
  };
}

export const listInstitutions = insforgeListInstitutions;

export async function insforgeGetInstitutionBySlug(slug: string) {
  if (!slug?.trim()) return null;

  const data = await insforgeSelectOne("institutions", {
    slug: `eq.${slug.trim()}`,
    status: "eq.published",
  });

  if (!data) return null;

  const categories = await listContentCategories("institution");
  const categoryName =
    categories.find((category) => category.value === data.category)?.name ??
    data.category;

  return {
    id: data.id,
    slug: data.slug,
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

export const getInstitutionBySlug = insforgeGetInstitutionBySlug;

// Hospitals now use their dedicated table/service.
export { listHospitals, getHospitalBySlug } from "@/services/hospitals";
