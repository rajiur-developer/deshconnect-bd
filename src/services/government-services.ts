import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";

export async function insforgeListGovernmentServices(query: {
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
  addTextSearch(params, query.q, ["name", "description", "office_address", "category"]);
  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
  if (query.category) params["category"] = `eq.${query.category}`;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();
  params["order"] = query.sort === "name" ? "name.asc" : "created_at.desc";

  const { data, count } = await insforgeSelectMany("government_services", params);
  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category,
      description: r.description,
      officeAddress: r.office_address,
      phone: r.phone,
      emergencyPhone: r.emergency_phone,
      website: r.website,
      hours: r.hours,
      requiredDocuments: r.required_documents,
      verification: r.verification,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    meta: makePageMeta(count, page, pageSize),
  };
}
export const listGovernmentServices = insforgeListGovernmentServices;
export const getGovernmentServiceBySlug = insforgeGetGovernmentServiceBySlug;

export async function insforgeGetGovernmentServiceBySlug(slug: string) {
  const data = await insforgeSelectOne("government_services", { slug: `eq.${slug}`, status: "eq.published" });
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    category: data.category,
    description: data.description,
    officeAddress: data.office_address,
    phone: data.phone,
    emergencyPhone: data.emergency_phone,
    website: data.website,
    hours: data.hours,
    requiredDocuments: data.required_documents,
    verification: data.verification,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
