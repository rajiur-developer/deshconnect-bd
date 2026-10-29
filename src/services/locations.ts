import "server-only";
import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
export async function insforgeListDivisions() {
const { data } = await insforgeSelectMany("divisions", { order: "name.asc" });
return (data || []).map((r: any) => ({
id: r.id,
slug: r.slug,
name: r.name,
capital: r.capital,
districtsCount: r.districts_count,
summary: r.summary,
image: r.image,
})); }
export async function insforgeListDistricts(divisionId?: string | null) {
const params: Record<string, string> = { order: "name.asc" };
if (divisionId) params["division_id"] = `eq.${divisionId}`;
const { data } = await insforgeSelectMany("districts", params);
return (data || []).map((r: any) => ({
id: r.id,
slug: r.slug,
name: r.name,
divisionId: r.division_id,
summary: r.summary,
image: r.image,
})); }
export async function insforgeListUpazilas(districtId?: string | null) {
const params: Record<string, string> = { order: "name.asc" };
if (districtId) params["district_id"] = `eq.${districtId}`;
const { data } = await insforgeSelectMany("upazilas", params);
return (data || []).map((r: any) => ({
id: r.id,
slug: r.slug,
name: r.name,
districtId: r.district_id,
image: r.image,
summary: r.summary,
})); }
export async function insforgeGetDivisionBySlug(slug: string) {
const data = await insforgeSelectOne("divisions", { slug: `eq.${slug}` });
if (!data) return null;
return { id: data.id, slug: data.slug, name: data.name, capital: data.capital, districtsCount: data.districts_count, summary: data.summary, image: data.image }; }
export async function insforgeGetDistrictBySlug(slug: string) {
const data = await insforgeSelectOne("districts", { slug: `eq.${slug}` });
if (!data) return null;
return { id: data.id, slug: data.slug, name: data.name, divisionId: data.division_id, summary: data.summary, image: data.image }; }
export async function insforgeGetDistrictById(id: string) {
const data = await insforgeSelectOne("districts", { id: `eq.${id}` });
if (!data) return null;
return { id: data.id, slug: data.slug, name: data.name, divisionId: data.division_id, summary: data.summary, image: data.image }; }
export async function insforgeGetDivisionById(id: string) {
const data = await insforgeSelectOne("divisions", { id: `eq.${id}` });
if (!data) return null;
return { id: data.id, slug: data.slug, name: data.name, capital: data.capital, districtsCount: data.districts_count, summary: data.summary, image: data.image }; }
export type LocationOption = { id: string; name: string };
export async function districtOptions(divisionId?: string | null) {
const districts = await insforgeListDistricts(divisionId);
return districts.map((d) => ({ id: d.id, name: d.name })); }
export async function upazilaOptions(districtId?: string | null) {
const upazilas = await insforgeListUpazilas(districtId);
return upazilas.map((u) => ({ id: u.id, name: u.name })); }
export async function locationLabels(ref: { divisionId?: string | null; districtId?: string | null; upazilaId?: string | null }) {
const division = ref.divisionId ? (await insforgeSelectOne("divisions", { id: `eq.${ref.divisionId}`, select: "name" })) as any : null;
const district = ref.districtId ? (await insforgeSelectOne("districts", { id: `eq.${ref.districtId}`, select: "name" })) as any : null;
const upazila = ref.upazilaId ? (await insforgeSelectOne("upazilas", { id: `eq.${ref.upazilaId}`, select: "name" })) as any : null;
return { division: division?.name, district: district?.name, upazila: upazila?.name }; }
export async function formatLocation(ref: { divisionId?: string | null; districtId?: string | null; upazilaId?: string | null }) {
const { division, district, upazila } = await locationLabels(ref);
const parts = [upazila, district, division].filter(Boolean) as string[];
return parts.length ? parts.join(", ") : null; }
export async function insforgeGetDirectoryLocationOptions() {
const [divisions, districts, upazilas] = await Promise.all([
insforgeListDivisions().catch(() => []),
insforgeListDistricts().catch(() => []),
insforgeListUpazilas().catch(() => []),
]);
return {
divisions: divisions.map((d) => ({ id: d.id, name: d.name })),
districts: districts.map((d) => ({ id: d.id, name: d.name, divisionId: d.divisionId })),
upazilas: upazilas.map((u) => ({ id: u.id, name: u.name, districtId: u.districtId })),
}; }
export const listDivisions = insforgeListDivisions;
export const listDistricts = insforgeListDistricts;
export const listUpazilas = insforgeListUpazilas;
export const getDivisionBySlug = insforgeGetDivisionBySlug;
export const getDistrictBySlug = insforgeGetDistrictBySlug;
export const getDivisionById = insforgeGetDivisionById;
export const getDirectoryLocationOptions = insforgeGetDirectoryLocationOptions;
export function slugify(input: string): string {
return input.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
