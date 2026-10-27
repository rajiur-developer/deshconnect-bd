// @ts-nocheck
"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user"; import { can, rolePermissions } from "@/lib/auth/permissions"; import { ALL_ACTIONS, type PermissionAction } from "@/config/permissions"; import { setNewsStatus } from "@/services/news"; import { setPostStatus, setReportStatus, setReviewStatus } from "@/services/community"; import { setUserRole, setUserStatus } from "@/services/users"; import { setBloodRequestStatus } from "@/services/blood"; import { recordAudit } from "@/services/audit"; import { createId, slugify } from "@/lib/utils"; import { formatZodError, emergencyAlertSchema, businessSchema, institutionSchema, locationSchema, placeSchema, serviceSchema, staffNewsSchema } from "@/lib/validation/schemas"; import { sanitizeMultiline, sanitizeText } from "@/lib/security/sanitize"; import type { Business, GovernmentService, News, Place } from "@/types/content"; import type { Role } from "@/types/auth";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { getRolePermissionOverrides, saveRolePermissionOverrides } from "@/services/role-permissions";
import { isContentCategory, type ContentCategorySection } from "@/services/content-categories";
import { isValidAdminDirectoryImageUrl, isValidAdminPlaceImageUrl } from "@/features/admin/place-image";
import { insforgeUpdate } from "@/lib/insforge";
export type AdminFormState = { error?: string; success?: string };
async function guard(action: PermissionAction, redirectTo = "/admin") {
const user = await requireUser(redirectTo);
const overrides = await getRolePermissionOverrides();
if (!can(user.role, action, overrides)) {
throw new Error("You do not have permission to perform this action.");
}
return user; }
async function audit(user: { id: string; fullName: string }, action: string, entity: string, entityId: string, outcome: "success" | "denied" = "success", detail?: string) {
await recordAudit({ actorId: user.id, actorName: user.fullName, action, entity, entityId, outcome, detail }); }
async function deleteAdminRow(table: string, id: string) {
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from(table).delete().eq("id", id).select("id").maybeSingle();
if (error) throw error;
return data;
}
async function updateAdminRow(table: string, id: string, values: Record<string, unknown>) {
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from(table).update({ ...values, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
if (error) throw error;
return data;
}
async function requireMainAdmin() {
const user = await requireUser("/admin/categories");
if (user.role !== "admin") throw new Error("Only the main admin can manage categories.");
return user;
}
function categorySectionFromForm(formData: FormData): ContentCategorySection | null {
const section = formData.get("section");
return section === "place" || section === "news" || section === "institution" ? section : null;
}
function revalidateContentCategoryPaths(section: ContentCategorySection) {
revalidatePath("/admin/categories");
if (section === "place") {
revalidatePath("/admin/places");
revalidatePath("/admin/tourism");
revalidatePath("/places");
} else if (section === "news") {
revalidatePath("/admin/news");
revalidatePath("/news");
revalidatePath("/my-news");
} else {
revalidatePath("/admin/institutions");
revalidatePath("/admin/hospitals");
revalidatePath("/institutions");
revalidatePath("/hospitals");
}
}
export async function createContentCategoryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await requireMainAdmin();
const section = categorySectionFromForm(formData);
const name = String(formData.get("name") ?? "").trim();
if (!section || name.length < 1 || name.length > 80) return { error: "Enter a category name between 1 and 80 characters." };
const client = createServerClient({ cookies: await cookies() });
const value = createId("category");
const { data, error } = await client.database.from("content_categories")
.insert([{ section, value, name: sanitizeText(name, 80) }])
.select("value").maybeSingle();
if (error) {
console.error("Content category creation failed", { code: error.code, message: error.message });
return { error: error.code === "23505" ? "A category with this name already exists in this section." : "Could not add the category. Please try again." };
}
if (!data) return { error: "The category could not be confirmed as saved." };
try { await audit(user, `category:${section}:create`, "content_category", value); } catch (error) { console.error("Category added but audit logging failed.", error); }
revalidateContentCategoryPaths(section);
return { success: "Category added." };
}
export async function updateContentCategoryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await requireMainAdmin();
const section = categorySectionFromForm(formData);
const value = String(formData.get("value") ?? "");
const name = String(formData.get("name") ?? "").trim();
if (!section || !value || name.length < 1 || name.length > 80) return { error: "Enter a category name between 1 and 80 characters." };
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from("content_categories")
.update({ name: sanitizeText(name, 80), updated_at: new Date().toISOString() })
.eq("section", section).eq("value", value).select("value").maybeSingle();
if (error) {
console.error("Content category update failed", { code: error.code, message: error.message });
return { error: error.code === "23505" ? "A category with this name already exists in this section." : "Could not update the category. Please try again." };
}
if (!data) return { error: "Category not found." };
try { await audit(user, `category:${section}:update`, "content_category", value); } catch (error) { console.error("Category updated but audit logging failed.", error); }
revalidateContentCategoryPaths(section);
return { success: "Category updated." };
}
export async function deleteContentCategoryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await requireMainAdmin();
const section = categorySectionFromForm(formData);
const value = String(formData.get("value") ?? "");
if (!section || !value) return { error: "Invalid category." };
const table = section === "place" ? "places" : section === "news" ? "news" : "institutions";
const client = createServerClient({ cookies: await cookies() });
const { data: uses, error: usesError } = await client.database.from(table).select("id").eq("category", value).limit(1);
if (usesError) {
console.error("Could not check category usage before delete", { section, code: usesError.code, message: usesError.message });
return { error: "Could not check whether this category is in use." };
}
if (uses?.length) return { error: "This category is used by existing content and cannot be deleted." };
const { data, error } = await client.database.from("content_categories").delete()
.eq("section", section).eq("value", value).select("value").maybeSingle();
if (error) {
console.error("Content category deletion failed", { code: error.code, message: error.message });
return { error: "Could not delete the category. Please try again." };
}
if (!data) return { error: "Category not found." };
try { await audit(user, `category:${section}:delete`, "content_category", value); } catch (error) { console.error("Category deleted but audit logging failed.", error); }
revalidateContentCategoryPaths(section);
return { success: "Category deleted." };
}
export async function adminSetNewsStatusAction(id: string, status: "pending_review" | "published" | "rejected" | "archived"): Promise<{ ok: boolean; error?: string }> {
if (!id || !["pending_review", "published", "rejected", "archived"].includes(status)) return { ok: false, error: "Invalid news update." };
const requiredPermission: PermissionAction = status === "published" ? "news:publish" : status === "pending_review" || status === "rejected" ? "news:approve" : "news:edit";
const user = await guard(requiredPermission);
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from("news").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
if (error) { console.error("News status update failed", { code: error.code, message: error.message }); return { ok: false, error: "Could not update the news status." }; }
if (!data) return { ok: false, error: "News post not found or permission denied." };
try { await audit(user, `news:${status}`, "news", id); } catch (auditError) { console.error("News status changed but audit logging failed.", auditError); }
revalidatePath("/admin/news"); revalidatePath("/news");
return { ok: true }; }

export async function adminUpdateNewsAction(id: string, formData: FormData): Promise<{ ok: boolean; error?: string }> {
const user = await guard("news:edit");
const parsed = staffNewsSchema.safeParse({
title: formData.get("title"), excerpt: formData.get("excerpt"), body: formData.get("body"),
category: formData.get("category"), source: formData.get("source") || undefined,
image: formData.get("image") || undefined,
});
if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) };
if (!(await isContentCategory("news", parsed.data.category))) return { ok: false, error: "Please choose a valid news category." };
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from("news").update({
title: sanitizeText(parsed.data.title, 200), excerpt: sanitizeText(parsed.data.excerpt, 300),
body: sanitizeMultiline(parsed.data.body), category: parsed.data.category,
source: parsed.data.source ? sanitizeText(parsed.data.source, 200) : null,
image: parsed.data.image || "/images/news/user.svg", updated_at: new Date().toISOString(),
}).eq("id", id).select("id").maybeSingle();
if (error) { console.error("News content update failed", { code: error.code, message: error.message }); return { ok: false, error: "Could not save the news changes." }; }
if (!data) return { ok: false, error: "News post not found or permission denied." };
try { await audit(user, "news:update", "news", id); } catch (auditError) { console.error("News updated but audit logging failed.", auditError); }
revalidatePath("/admin/news"); revalidatePath("/news");
return { ok: true }; }

export async function adminDeleteNewsAction(id: string): Promise<{ ok: boolean; error?: string }> {
const user = await guard("news:edit");
if (!id) return { ok: false, error: "Invalid news post." };
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from("news").delete().eq("id", id).select("id").maybeSingle();
if (error) { console.error("News delete failed", { code: error.code, message: error.message }); return { ok: false, error: "Could not delete the news post." }; }
if (!data) return { ok: false, error: "News post not found or permission denied." };
try { await audit(user, "news:delete", "news", id); } catch (auditError) { console.error("News deleted but audit logging failed.", auditError); }
revalidatePath("/admin/news"); revalidatePath("/news");
return { ok: true }; }
export async function adminModeratePostAction(id: string, status: "visible" | "hidden" | "pending") {
const user = await guard("moderation:posts");
await setPostStatus(id, status);
await audit(user, `post:${status}`, "post", id);
revalidatePath("/admin/community");
revalidatePath("/community"); }
export async function adminSetReviewStatusAction(id: string, status: "visible" | "hidden" | "pending") {
const user = await guard("moderation:reviews");
await setReviewStatus(id, status);
await audit(user, `review:${status}`, "review", id);
revalidatePath("/admin/reviews"); }
export async function adminResolveReportAction(id: string, status: "under_review" | "resolved" | "dismissed", resolution?: string) {
const user = await guard("moderation:reports");
await setReportStatus(id, status, resolution);
await audit(user, `report:${status}`, "report", id);
revalidatePath("/admin/reports"); }
export async function adminSetUserStatusAction(userId: string, status: "active" | "suspended" | "pending") {
const user = await requireUser("/admin");
if (user.role !== "admin") throw new Error("Only an admin can manage user accounts.");
await setUserStatus(userId, status);
await audit(user, `user:${status}`, "user", userId);
revalidatePath("/admin/users"); }
export async function adminSetUserRoleAction(userId: string, role: Role) {
const user = await requireUser("/admin");
if (user.role !== "admin") throw new Error("Only an admin can change account roles.");
if (!["user", "moderator", "admin"].includes(role)) throw new Error("Invalid role.");
if (userId === user.id) throw new Error("You cannot change your own role.");
await setUserRole(userId, role);
await audit(user, `user:role:${role}`, "user", userId);
revalidatePath("/admin/users");
revalidatePath("/admin/roles"); }
/**
* Promote/demote a user between "user" and "moderator". Available to admins and
* moderators, but neither may grant or change an admin account.
*/ export async function toggleModeratorAction(userId: string): Promise<{ ok: boolean; role?: Role; error?: string }> {
const actor = await requireUser("/admin");
if (actor.role !== "admin") return { ok: false, error: "Only an admin can change account roles." };
const client = createServerClient({ cookies: await cookies() });
const { data: target, error: readError } = await client.database.from("profiles").select("id,username,role").eq("id", userId).maybeSingle();
if (readError) return { ok: false, error: readError.message };
if (!target) return { ok: false, error: "User not found." };
if (target.id === actor.id) return { ok: false, error: "You cannot change your own role." };
const nextRole: Role = target.role === "moderator" ? "user" : "moderator";
const { error } = await client.database.from("profiles").update({ role: nextRole, updated_at: new Date().toISOString() }).eq("id", userId);
if (error) return { ok: false, error: error.message };
await audit(actor, `user:role:${nextRole}`, "user", userId);
revalidatePath("/admin/users");
revalidatePath(`/profile/${target.username}`);
return { ok: true, role: nextRole }; }
export async function adminSetBloodRequestStatusAction(id: string, status: "active" | "fulfilled" | "cancelled" | "expired" | "under_review") {
const user = await guard("blood:manage");
await setBloodRequestStatus(id, status);
await audit(user, `blood-request:${status}`, "blood_request", id);
revalidatePath("/admin/blood-requests");
revalidatePath("/blood-donation"); }
export async function adminDeleteBloodRequestAction(id: string): Promise<{ ok: boolean; error?: string }> {
const user = await guard("blood:manage");
if (!id || typeof id !== "string") return { ok: false, error: "Invalid blood request." };
const request = await deleteAdminRow("blood_requests", id);
if (!request) return { ok: false, error: "Blood request not found." };
await audit(user, "blood-request:delete", "blood_request", id);
revalidatePath("/admin/blood-requests");
revalidatePath("/blood-donation");
return { ok: true }; }
export async function adminDeleteBloodDonorAction(id: string): Promise<{ ok: boolean; error?: string }> {
const user = await guard("blood:manage");
if (!id || typeof id !== "string") return { ok: false, error: "Invalid donor record." };
let donor;
try {
donor = await deleteAdminRow("blood_donors", id);
} catch (error) {
console.error("Could not permanently delete donor record:", error);
return { ok: false, error: "Donor record could not be deleted. Please try again." };
}
if (!donor) return { ok: false, error: "Donor record not found." };
await audit(user, "blood-donor:delete", "blood_donor", id);
revalidatePath("/admin/blood-donors");
revalidatePath("/blood-donation");
return { ok: true }; }
export async function adminSetBloodDonorVisibilityAction(
id: string,
visible: boolean,
): Promise<{ ok: boolean; error?: string }> {
const user = await guard("blood:manage");
if (!id || typeof id !== "string") return { ok: false, error: "Invalid donor record." };
let donor;
try {
donor = await updateAdminRow("blood_donors", id, {
archived_at: visible ? null : new Date().toISOString(),
...(visible ? {} : {
consent_listed: false,
consent_contact: false,
availability: "unavailable",
}),
});
} catch (error) {
console.error("Could not update donor visibility:", error);
return { ok: false, error: "Donor visibility could not be changed. Please try again." };
}
if (!donor) return { ok: false, error: "Donor record not found." };
await audit(user, `blood-donor:${visible ? "restored" : "hidden"}`, "blood_donor", id);
revalidatePath("/admin/blood-donors");
revalidatePath("/blood-donation");
return { ok: true };
}
export async function adminDeletePlaceAction(id: string) {
const user = await guard("places:delete");
const deleted = await deleteAdminRow("places", id);
if (!deleted) return { ok: false, error: "Place not found." };
await audit(user, "place:delete", "place", id);
revalidatePath("/admin/places");
revalidatePath("/places"); }
export async function adminDeleteInstitutionAction(id: string) {
const user = await guard("institutions:edit");
const deleted = await deleteAdminRow("institutions", id);
if (!deleted) return { ok: false, error: "Institution not found." };
await audit(user, "institution:delete", "institution", id);
revalidatePath("/admin/institutions");
revalidatePath("/admin/hospitals");
revalidatePath("/institutions");
revalidatePath("/hospitals"); }
export async function adminSaveSettingsAction(_prev: { error?: string; success?: string }, formData: FormData) {
const user = await guard("settings:manage");
const siteName = String(formData.get("siteName") ?? "").trim();
if (!siteName) return { error: "Site name is required." };
const client = createServerClient({ cookies: await cookies() });
const { error } = await client.database.from("platform_settings").upsert([{ id: "platform", site_name: siteName, allow_public_posts: formData.get("allowPublicPosts") === "on", require_news_approval: formData.get("requireNewsApproval") === "on", donor_directory_enabled: formData.get("donorDirectoryEnabled") === "on", updated_by: user.id, updated_at: new Date().toISOString() }]);
if (error) return { error: "Settings could not be saved. Please try again." };
await audit(user, "settings:update", "settings", "platform");
revalidatePath("/admin/settings");
return { success: "Settings saved." }; }
export async function adminSavePermissionsAction(_prev: { error?: string; success?: string }, formData: FormData) {
const user = await requireUser("/admin/permissions");
if (user.role !== "admin") return { error: "Only an admin can change role permissions." };
const roles: Role[] = ["user", "moderator", "admin"];
const next: Record<string, string[]> = {};
for (const role of roles) {
if (role === "admin") continue;
next[role] = ALL_ACTIONS.filter((action) => formData.get(`role:${role}:${action}`) === "on");
}
await saveRolePermissionOverrides(next, user.id);
await audit(user, "permissions:update", "settings", "permissions");
revalidatePath("/admin/permissions");
return { success: "Permissions updated." }; }
export async function adminDeleteUserAction(userId: string) {
const user = await requireUser("/admin");
if (user.role !== "admin") throw new Error("Only an admin can manage user accounts.");
if (user.id === userId) return;
const client = createServerClient({ cookies: await cookies() });
const { data: deleted, error } = await client.database.rpc("admin_delete_user", { target_user_id: userId });
if (error) throw error;
if (!deleted) return;
await audit(user, "user:delete", "user", userId);
revalidatePath("/admin/users"); }
/** Create a published tourist place. Available to admins and moderators. */ export async function createPlaceAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("places:create");
const parsed = placeSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
summary: formData.get("summary"),
description: formData.get("description"),
address: formData.get("address"),
entryFee: formData.get("entryFee") || undefined,
openingHours: formData.get("openingHours") || undefined,
bestTime: formData.get("bestTime") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!(await isContentCategory("place", parsed.data.category))) return { error: "Please choose a valid place category." };
if (parsed.data.image && !isValidAdminPlaceImageUrl(parsed.data.image, user.id)) {
return { error: "The selected place image could not be verified. Please upload it again." };
}
const now = new Date().toISOString();
const place = {
slug: `${slugify(parsed.data.name) || "place"}-${createId("place").slice(-8)}`,
name: sanitizeText(parsed.data.name, 200),
category: parsed.data.category,
summary: sanitizeText(parsed.data.summary, 10_000),
description: sanitizeMultiline(parsed.data.description),
address: sanitizeText(parsed.data.address, 300),
latitude: null,
longitude: null,
image: parsed.data.image || "/images/places/p1.svg",
gallery: [],
rating: 0,
reviewCount: 0,
openingHours: parsed.data.openingHours,
entryFee: parsed.data.entryFee,
bestTime: parsed.data.bestTime,
status: "published",
verification: "verified",
createdAt: now,
updatedAt: now,
divisionId: parsed.data.divisionId ?? null,
districtId: parsed.data.districtId ?? null,
upazilaId: parsed.data.upazilaId ?? null,
};
const client = createServerClient({ cookies: await cookies() });
let created;
try {
const result = await client.database.from("places").insert([{ slug: place.slug, name: place.name, category: place.category, summary: place.summary, description: place.description, address: place.address, latitude: place.latitude, longitude: place.longitude, image: place.image, gallery: place.gallery, rating: place.rating, review_count: place.reviewCount, opening_hours: place.openingHours, entry_fee: place.entryFee, best_time: place.bestTime, status: place.status, verification: place.verification, division_id: place.divisionId, district_id: place.districtId, upazila_id: place.upazilaId }]).select("id").single();
if (result.error) {
console.error("Place creation failed", { code: result.error.code, message: result.error.message });
if (result.error.code === "23505") return { error: "This place conflicts with an existing record. Please try again." };
return { error: `Place could not be saved: ${result.error.message}` };
}
created = result.data;
} catch (error) {
console.error("Place creation request failed", error);
return { error: error instanceof Error ? `Place could not be saved: ${error.message}` : "Place could not be saved. Please try again." };
}
if (!created?.id) return { error: "Place could not be saved because the database returned no record." };
try {
await audit(user, "place:create", "place", created.id);
} catch (error) {
console.error("Place was created but audit logging failed", error);
}
revalidatePath("/admin/places");
revalidatePath("/places");
return { success: "Place created and published." }; }
/** Create a published hospital or educational institution. */
export async function adminCreateInstitutionAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("institutions:edit");
const parsed = institutionSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
address: formData.get("address"),
phone: formData.get("phone") || undefined,
email: formData.get("email") || undefined,
website: formData.get("website") || undefined,
emergencyPhone: formData.get("emergencyPhone") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!(await isContentCategory("institution", parsed.data.category))) return { error: "Please choose a valid institution category." };
if (parsed.data.image && !isValidAdminDirectoryImageUrl(parsed.data.image, user.id, "institutions")) {
return { error: "The selected institution image could not be verified. Please upload it again." };
}
const slug = `${slugify(parsed.data.name) || "institution"}-${createId("institution").slice(-8)}`;
const client = createServerClient({ cookies: await cookies() });
let created;
try {
const result = await client.database.from("institutions").insert([{
slug,
name: sanitizeText(parsed.data.name, 200),
category: parsed.data.category,
description: sanitizeMultiline(parsed.data.description),
address: sanitizeText(parsed.data.address, 300),
phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null,
email: parsed.data.email ? sanitizeText(parsed.data.email, 200) : null,
website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null,
emergency_phone: parsed.data.emergencyPhone ? sanitizeText(parsed.data.emergencyPhone, 50) : null,
image: parsed.data.image || "/images/places/p1.svg",
verification: "verified",
status: "published",
division_id: parsed.data.divisionId ?? null,
district_id: parsed.data.districtId ?? null,
upazila_id: parsed.data.upazilaId ?? null,
}]).select("id").single();
if (result.error) {
console.error("Institution creation failed", { code: result.error.code, message: result.error.message });
return { error: "Institution could not be saved. Please try again." };
}
created = result.data;
} catch (error) {
console.error("Institution creation request failed", error);
return { error: "Institution could not be saved. Please try again." };
}
if (!created?.id) return { error: "Institution could not be saved because the database returned no record." };
try {
await audit(user, "institution:create", "institution", created.id);
} catch (error) {
console.error("Institution was created but audit logging failed", error);
}
revalidatePath("/admin/institutions");
revalidatePath("/admin/hospitals");
revalidatePath("/institutions");
revalidatePath("/hospitals");
return { success: "Institution created and published." };
}
/** Publish a news article directly. Available to admins and moderators. */ export async function createNewsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("news:publish");
const parsed = staffNewsSchema.safeParse({
title: formData.get("title"),
excerpt: formData.get("excerpt"),
body: formData.get("body"),
category: formData.get("category"),
source: formData.get("source") || undefined,
image: formData.get("image") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!(await isContentCategory("news", parsed.data.category))) return { error: "Please choose a valid news category." };
const now = new Date().toISOString();
const article: News = {
id: createId("news"),
slug: createId("news").replace("news_", "news-"),
title: sanitizeText(parsed.data.title, 200),
excerpt: sanitizeText(parsed.data.excerpt, 300),
body: sanitizeMultiline(parsed.data.body),
image: parsed.data.image || "/images/news/user.svg",
category: parsed.data.category,
authorId: user.id,
source: parsed.data.source,
status: "published",
publishedAt: now,
createdAt: now,
updatedAt: now,
};
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database.from("news").insert([{
slug: article.slug, title: article.title, excerpt: article.excerpt, body: article.body,
image: article.image, category: article.category, author_id: user.id, source: article.source,
status: article.status, published_at: article.publishedAt, created_at: article.createdAt,
division_id: user.divisionId ?? null, district_id: user.districtId ?? null, upazila_id: user.upazilaId ?? null,
}]).select("id").single();
if (error) { console.error("Admin news publish failed", { code: error.code, message: error.message }); return { error: "News could not be published. Please try again." }; }
await audit(user, "news:create", "news", data.id);
revalidatePath("/admin/news");
revalidatePath("/news");
return { success: "News published." }; }
/** Publish an active blood request and alert every user. */ export async function sendEmergencyBloodAlertAction(
_prev: AdminFormState,
formData: FormData ): Promise<AdminFormState> {
const user = await guard("blood:manage");
const parsed = emergencyAlertSchema.safeParse({
bloodGroup: formData.get("bloodGroup"),
units: formData.get("units"),
hospital: formData.get("hospital"),
neededBy: formData.get("neededBy"),
notes: formData.get("notes") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const now = new Date().toISOString();
const client = createServerClient({ cookies: await cookies() });
const { data: request, error: requestError } = await client.database.from("blood_requests").insert([{ requester_id: user.id, blood_group: parsed.data.bloodGroup, units: parsed.data.units, hospital: sanitizeText(parsed.data.hospital, 200), needed_by: parsed.data.neededBy, notes: parsed.data.notes ? sanitizeText(parsed.data.notes, 1000) : null, status: "active" }]).select("id").single();
if (requestError) return { error: "Emergency blood request could not be published." };
const { data: recipients, error: usersError } = await client.database.from("profiles").select("id");
if (usersError) return { error: "The request was published, but member notifications could not be loaded." };
if (recipients?.length) {
const { error: notificationError } = await client.database.from("notifications").insert(recipients.map((recipient: { id: string }) => ({ user_id: recipient.id, title: "Emergency blood alert", body: `${parsed.data.bloodGroup} needed — ${sanitizeText(parsed.data.hospital, 200)}`, href: "/blood-donation" })));
if (notificationError) return { error: "The request was published, but notifications could not be sent." };
}
await audit(user, "blood:emergency_alert", "blood_request", request.id, "success", "Alert sent to all users");
revalidatePath("/admin/blood-alerts");
revalidatePath("/blood-donation");
return { success: "Emergency blood alert sent to all users." }; }
/** Create a government-service record. Available to admins and moderators. */ export async function createGovernmentServiceAction(
_prev: AdminFormState,
formData: FormData ): Promise<AdminFormState> {
const user = await guard("services:edit");
const parsed = serviceSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
officeAddress: formData.get("officeAddress"),
phone: formData.get("phone") || undefined,
emergencyPhone: formData.get("emergencyPhone") || undefined,
website: formData.get("website") || undefined,
hours: formData.get("hours") || undefined,
requiredDocuments: formData.get("requiredDocuments") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const now = new Date().toISOString();
const service = {
slug: slugify(parsed.data.name),
name: sanitizeText(parsed.data.name, 200),
category: parsed.data.category,
description: sanitizeMultiline(parsed.data.description),
officeAddress: sanitizeText(parsed.data.officeAddress, 300),
phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null,
emergencyPhone: parsed.data.emergencyPhone ? sanitizeText(parsed.data.emergencyPhone, 50) : null,
website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null,
hours: parsed.data.hours,
requiredDocuments: parsed.data.requiredDocuments
? parsed.data.requiredDocuments.split(",").map((item) => item.trim()).filter(Boolean)
: undefined,
status: "published",
createdAt: now,
updatedAt: now,
divisionId: parsed.data.divisionId ?? null,
districtId: parsed.data.districtId ?? null,
upazilaId: parsed.data.upazilaId ?? null,
};
const client = createServerClient({ cookies: await cookies() });
const { data: created, error } = await client.database.from("government_services").insert([{ slug: service.slug, name: service.name, category: service.category, description: service.description, office_address: service.officeAddress, phone: service.phone, emergency_phone: service.emergencyPhone, website: service.website, hours: service.hours, required_documents: service.requiredDocuments ?? [], status: service.status, division_id: service.divisionId, district_id: service.districtId, upazila_id: service.upazilaId }]).select("id").single();
if (error) return { error: "Government service could not be saved. Please try again." };
await audit(user, "service:create", "government_service", created.id);
revalidatePath("/admin/government-services");
revalidatePath("/government-services");
return { success: "Government service created." }; }
/** Delete a business listing. Available to admins and moderators. */ export async function deleteBusinessAction(id: string) {
const user = await guard("businesses:edit");
const deleted = await deleteAdminRow("businesses", id);
if (!deleted) return { ok: false, error: "Business not found." };
await audit(user, "business:delete", "business", id);
revalidatePath("/admin/businesses");
revalidatePath("/businesses"); }
/** Create a business listing. Available to admins and moderators. */ export async function createBusinessAction(
_prev: AdminFormState,
formData: FormData ): Promise<AdminFormState> {
const user = await guard("businesses:edit");
const parsed = businessSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
address: formData.get("address"),
phone: formData.get("phone") || undefined,
website: formData.get("website") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const now = new Date().toISOString();
const business = {
slug: slugify(parsed.data.name),
name: sanitizeText(parsed.data.name, 200),
category: parsed.data.category,
description: sanitizeMultiline(parsed.data.description),
address: sanitizeText(parsed.data.address, 300),
phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null,
website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null,
image: parsed.data.image || "/images/businesses/b1.svg",
status: "published",
verification: "verified",
createdAt: now,
updatedAt: now,
divisionId: parsed.data.divisionId ?? null,
districtId: parsed.data.districtId ?? null,
upazilaId: parsed.data.upazilaId ?? null,
};
const client = createServerClient({ cookies: await cookies() });
const { data: created, error } = await client.database.from("businesses").insert([{ slug: business.slug, name: business.name, category: business.category, description: business.description, address: business.address, phone: business.phone, website: business.website, image: business.image, status: business.status, verification: business.verification, division_id: business.divisionId, district_id: business.districtId, upazila_id: business.upazilaId }]).select("id").single();
if (error) return { error: "Business could not be saved. Please try again." };
await audit(user, "business:create", "business", created.id);
revalidatePath("/admin/businesses");
revalidatePath("/businesses");
return { success: "Business created." }; }
/** Add a division, district or upazila. Admin only. */ export async function addLocationAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("locations:manage");
const parsed = locationSchema.safeParse({
name: formData.get("name"),
title: formData.get("title") || undefined,
category: formData.get("category"),
image: formData.get("image") || undefined,
parentId: formData.get("parentId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const name = sanitizeText(parsed.data.name, 120);
const title = parsed.data.title ? sanitizeText(parsed.data.title, 300) : name;
const image = parsed.data.image || "/images/districts/district.svg";
const parentId = parsed.data.parentId ?? "";
if (parsed.data.category !== "division" && !parentId) {
return { error: "Select a parent division/district for this location." };
}
const client = createServerClient({ cookies: await cookies() });
let table: string; let row: Record<string, unknown>;
if (parsed.data.category === "division") {
table = "divisions"; row = { id: createId("div"), slug: slugify(name), name, capital: name, districts_count: 0, summary: title, image };
} else if (parsed.data.category === "district") {
table = "districts"; row = { id: createId("dis"), slug: slugify(name), name, division_id: parentId, summary: title, image };
} else {
table = "upazilas"; row = { id: createId("upa"), slug: slugify(name), name, district_id: parentId, summary: title, image };
}
const { error } = await client.database.from(table).insert([row]);
if (error) return { error: `${parsed.data.category} could not be saved. Please try again.` };
await audit(user, `location:${parsed.data.category}:create`, "location", name);
revalidatePath("/admin/locations");
return { success: `${parsed.data.category[0]!.toUpperCase()}${parsed.data.category.slice(1)} added.` }; }
/** Hide (archive) or restore a tourist place. Admin and moderators. */ export async function adminSetPlaceStatusAction(id: string, status: "published" | "archived") {
const user = await guard("places:edit");
const updated = await updateAdminRow("places", id, { status });
if (!updated) return { ok: false, error: "Place not found." };
await audit(user, `place:${status}`, "place", id);
revalidatePath("/admin/places");
revalidatePath("/admin/tourism");
revalidatePath("/places"); }
/** Hide (archive) or restore an institution. Admin and moderators with institution access. */
export async function adminSetInstitutionStatusAction(id: string, status: "published" | "archived") {
const user = await guard("institutions:edit");
const updated = await updateAdminRow("institutions", id, { status });
if (!updated) return { ok: false, error: "Institution not found." };
await audit(user, `institution:${status}`, "institution", id);
revalidatePath("/admin/institutions");
revalidatePath("/admin/hospitals");
revalidatePath("/institutions");
revalidatePath("/hospitals"); }
/** Hide (archive) or restore a business. Admin and moderators. */ export async function adminSetBusinessStatusAction(id: string, status: "published" | "archived") {
const user = await guard("businesses:edit");
const updated = await updateAdminRow("businesses", id, { status });
if (!updated) return { ok: false, error: "Business not found." };
await audit(user, `business:${status}`, "business", id);
revalidatePath("/admin/businesses");
revalidatePath("/businesses"); }
/** Hide (archive) or restore a government service. Admin and moderators. */ export async function adminSetServiceStatusAction(id: string, status: "published" | "archived") {
const user = await guard("services:edit");
const updated = await updateAdminRow("government_services", id, { status });
if (!updated) return { ok: false, error: "Service not found." };
await audit(user, `service:${status}`, "government_service", id);
revalidatePath("/admin/government-services");
revalidatePath("/government-services"); }
/** Delete a government service. Admin and moderators. */ export async function adminDeleteServiceAction(id: string) {
const user = await guard("services:edit");
const deleted = await deleteAdminRow("government_services", id);
if (!deleted) return { ok: false, error: "Service not found." };
await audit(user, "service:delete", "government_service", id);
revalidatePath("/admin/government-services");
revalidatePath("/government-services"); }
/** Update an existing tourist place. Admin and moderators. */ export async function adminUpdatePlaceAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("places:edit");
const id = String(formData.get("id") ?? "");
const imageChanged = formData.get("imageChanged") === "true";
const parsed = placeSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
summary: formData.get("summary"),
description: formData.get("description"),
address: formData.get("address"),
entryFee: formData.get("entryFee") || undefined,
openingHours: formData.get("openingHours") || undefined,
bestTime: formData.get("bestTime") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!(await isContentCategory("place", parsed.data.category))) return { error: "Please choose a valid place category." };
if (imageChanged && parsed.data.image && !isValidAdminPlaceImageUrl(parsed.data.image, user.id)) {
return { error: "The selected place image could not be verified. Please upload it again." };
}
let updated;
try {
updated = await updateAdminRow("places", id, { name: sanitizeText(parsed.data.name, 200), category: parsed.data.category, summary: sanitizeText(parsed.data.summary, 10_000), description: sanitizeMultiline(parsed.data.description), address: sanitizeText(parsed.data.address, 300), opening_hours: parsed.data.openingHours ?? null, entry_fee: parsed.data.entryFee ?? null, best_time: parsed.data.bestTime ?? null, ...(imageChanged ? { image: parsed.data.image || "/images/places/p1.svg" } : {}), division_id: parsed.data.divisionId ?? null, district_id: parsed.data.districtId ?? null, upazila_id: parsed.data.upazilaId ?? null });
} catch (error) {
console.error("Place update failed.", error instanceof Error ? error.message : "Unknown error");
return { error: "Could not save this place. Please try again." };
}
if (!updated) return { error: "Place not found." };
await audit(user, "place:update", "place", id);
revalidatePath("/admin/places");
revalidatePath("/admin/tourism");
revalidatePath("/places");
return { success: "Place updated." }; }
/** Update an existing hospital or educational institution. */
export async function adminUpdateInstitutionAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("institutions:edit");
const id = String(formData.get("id") ?? "");
const imageChanged = formData.get("imageChanged") === "true";
const parsed = institutionSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
address: formData.get("address"),
phone: formData.get("phone") || undefined,
email: formData.get("email") || undefined,
website: formData.get("website") || undefined,
emergencyPhone: formData.get("emergencyPhone") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!(await isContentCategory("institution", parsed.data.category))) return { error: "Please choose a valid institution category." };
if (imageChanged && parsed.data.image && !isValidAdminDirectoryImageUrl(parsed.data.image, user.id, "institutions")) {
return { error: "The selected institution image could not be verified. Please upload it again." };
}
let updated;
try {
const values = {
name: sanitizeText(parsed.data.name, 200),
category: parsed.data.category,
description: sanitizeMultiline(parsed.data.description),
address: sanitizeText(parsed.data.address, 300),
phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null,
email: parsed.data.email ? sanitizeText(parsed.data.email, 200) : null,
website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null,
emergency_phone: parsed.data.emergencyPhone ? sanitizeText(parsed.data.emergencyPhone, 50) : null,
...(imageChanged ? { image: parsed.data.image || "/images/places/p1.svg" } : {}),
division_id: parsed.data.divisionId ?? null,
district_id: parsed.data.districtId ?? null,
upazila_id: parsed.data.upazilaId ?? null,
};
if (process.env.NODE_ENV === "development" && id.startsWith("inst_")) {
const result = await insforgeUpdate("institutions", id, values);
updated = result.data?.[0] ? { id: result.data[0].id } : null;
} else {
updated = await updateAdminRow("institutions", id, values);
}
} catch (error) {
console.error("Institution update failed.", error instanceof Error ? error.message : "Unknown error");
return { error: "Could not save this institution. Please try again." };
}
if (!updated) return { error: "Institution not found." };
await audit(user, "institution:update", "institution", id);
revalidatePath("/admin/institutions");
revalidatePath("/admin/hospitals");
revalidatePath("/institutions");
revalidatePath("/hospitals");
return { success: "Institution updated." };
}
/** Update an existing business. Admin and moderators. */ export async function adminUpdateBusinessAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("businesses:edit");
const id = String(formData.get("id") ?? "");
const parsed = businessSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
address: formData.get("address"),
phone: formData.get("phone") || undefined,
website: formData.get("website") || undefined,
image: formData.get("image") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const updated = await updateAdminRow("businesses", id, { name: sanitizeText(parsed.data.name, 200), slug: slugify(parsed.data.name), category: parsed.data.category, description: sanitizeMultiline(parsed.data.description), address: sanitizeText(parsed.data.address, 300), phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null, website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null, ...(parsed.data.image ? { image: parsed.data.image } : {}), division_id: parsed.data.divisionId ?? null, district_id: parsed.data.districtId ?? null, upazila_id: parsed.data.upazilaId ?? null });
if (!updated) return { error: "Business not found." };
await audit(user, "business:update", "business", id);
revalidatePath("/admin/businesses");
revalidatePath("/businesses");
return { success: "Business updated." }; }
/** Update an existing government service. Admin and moderators. */ export async function adminUpdateServiceAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const user = await guard("services:edit");
const id = String(formData.get("id") ?? "");
const parsed = serviceSchema.safeParse({
name: formData.get("name"),
category: formData.get("category"),
description: formData.get("description"),
officeAddress: formData.get("officeAddress"),
phone: formData.get("phone") || undefined,
emergencyPhone: formData.get("emergencyPhone") || undefined,
website: formData.get("website") || undefined,
hours: formData.get("hours") || undefined,
requiredDocuments: formData.get("requiredDocuments") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const updated = await updateAdminRow("government_services", id, { name: sanitizeText(parsed.data.name, 200), slug: slugify(parsed.data.name), category: parsed.data.category, description: sanitizeMultiline(parsed.data.description), office_address: sanitizeText(parsed.data.officeAddress, 300), phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 50) : null, emergency_phone: parsed.data.emergencyPhone ? sanitizeText(parsed.data.emergencyPhone, 50) : null, website: parsed.data.website ? sanitizeText(parsed.data.website, 200) : null, hours: parsed.data.hours ?? null, required_documents: parsed.data.requiredDocuments ? parsed.data.requiredDocuments.split(",").map((item) => item.trim()).filter(Boolean) : [], division_id: parsed.data.divisionId ?? null, district_id: parsed.data.districtId ?? null, upazila_id: parsed.data.upazilaId ?? null });
if (!updated) return { error: "Service not found." };
await audit(user, "service:update", "government_service", id);
revalidatePath("/admin/government-services");
revalidatePath("/government-services");
return { success: "Service updated." }; }
/** Update a member profile. Role/status changes are restricted to admins. */ export async function adminUpdateUserAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
const actor = await requireUser("/admin");
if (actor.role !== "admin") return { error: "Only an admin can update user accounts." };
const id = String(formData.get("id") ?? "");
const fullName = sanitizeText(String(formData.get("fullName") ?? ""), 120);
const phone = sanitizeText(String(formData.get("phone") ?? ""), 30);
const role = String(formData.get("role") ?? "user") as Role;
const status = String(formData.get("status") ?? "active") as "active" | "suspended" | "pending";
if (!id || !fullName) return { error: "Name is required." };
if (!["user", "moderator", "admin"].includes(role) || !["active", "suspended", "pending"].includes(status)) return { error: "Invalid role or status." };
if (actor.id === id && role !== actor.role) return { error: "You cannot change your own role." };
const client = createServerClient({ cookies: await cookies() });
const { data: target, error: readError } = await client.database.from("profiles").select("id,role").eq("id", id).maybeSingle();
if (readError || !target) return { error: "User not found." };
if (actor.role !== "admin" && (target.role !== role || target.role === "admin" || role === "admin")) return { error: "Only an admin can change account roles." };
const update: Record<string, unknown> = { full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() };
if (actor.role === "admin") { update.role = role; update.status = status; }
const { error } = await client.database.from("profiles").update(update).eq("id", id);
if (error) return { error: `Could not update user: ${error.message}` };
await audit(actor, "user:update", "user", id);
revalidatePath("/admin/users");
return { success: "User updated." };
}
