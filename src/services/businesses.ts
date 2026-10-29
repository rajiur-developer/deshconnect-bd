import "server-only";
import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";
export async function insforgeListBusinesses(query: {
q?: string;
divisionId?: string;
districtId?: string;
upazilaId?: string;
category?: string;
sort?: "relevance" | "name" | "newest" | "rating";
page?: number;
pageSize?: number; }) {
const params: Record<string, string> = { status: "eq.published" };
addTextSearch(params, query.q, ["name", "description", "address", "category"]);
if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
if (query.category) params["category"] = `eq.${query.category}`;
const page = query.page ?? 1;
const pageSize = query.pageSize ?? 12;
params["offset"] = ((page - 1) * pageSize).toString();
params["limit"] = pageSize.toString();
params["order"] = query.sort === "name" ? "name.asc" : "created_at.desc";
const { data, count } = await insforgeSelectMany("businesses", params);
return {
items: (data || []).map((r: any) => ({
id: r.id,
slug: r.slug,
name: r.name,
category: r.category,
description: r.description,
address: r.address,
phone: r.phone,
website: r.website,
image: r.image,
verification: r.verification,
divisionId: r.division_id,
districtId: r.district_id,
upazilaId: r.upazila_id,
status: r.status,
createdAt: r.created_at,
updatedAt: r.updated_at,
})),
meta: makePageMeta(count, page, pageSize),
}; }
export const listBusinesses = insforgeListBusinesses;
export const getBusinessBySlug = insforgeGetBusinessBySlug;
export async function insforgeGetBusinessBySlug(slug: string) {
const data = await insforgeSelectOne("businesses", { slug: `eq.${slug}`, status: "eq.published" });
if (!data) return null;
return {
id: data.id,
slug: data.slug,
name: data.name,
category: data.category,
description: data.description,
address: data.address,
phone: data.phone,
website: data.website,
image: data.image,
verification: data.verification,
divisionId: data.division_id,
districtId: data.district_id,
upazilaId: data.upazila_id,
status: data.status,
createdAt: data.created_at,
updatedAt: data.updated_at,
}; }
