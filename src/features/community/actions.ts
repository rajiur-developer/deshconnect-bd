"use server";
import { revalidatePath } from "next/cache";
import { COMMUNITY_POST_IMAGE_BUCKET, PROFILE_IMAGE_BUCKET } from "@/features/account/constants";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { requireUser } from "@/lib/auth/current-user"; import { insforgeDelete, insforgeSelectOne, insforgeUpdate } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import type { Report } from "@/types/community"; import { formatZodError, commentSchema, postSchema, reportSchema } from "@/lib/validation/schemas"; import { sanitizeMultiline, sanitizeText } from "@/lib/security/sanitize"; import { rateLimit } from "@/lib/security/rate-limit"; import { RATES } from "@/lib/constants"; import { can } from "@/lib/auth/permissions"; import { getRolePermissionOverrides } from "@/services/role-permissions";
export type CommunityFormState = { error?: string; success?: string };
export async function createPostAction(_prev: CommunityFormState, formData: FormData): Promise<CommunityFormState> {
const user = await requireUser();
const imageKey = String(formData.get("imageKey") ?? "");
const imageMimeType = String(formData.get("imageMimeType") ?? "");
const imageSize = Number(formData.get("imageSize") ?? 0);
const imageUrl = String(formData.get("image") ?? "");
let validImageUrl = false;
try {
const parsedImageUrl = new URL(imageUrl);
const expectedImagePrefix = `/api/storage/buckets/${COMMUNITY_POST_IMAGE_BUCKET}/objects/`;
validImageUrl = parsedImageUrl.origin === new URL(process.env.NEXT_PUBLIC_INSFORGE_URL!).origin
&& parsedImageUrl.pathname.startsWith(expectedImagePrefix)
&& decodeURIComponent(parsedImageUrl.pathname.slice(expectedImagePrefix.length)) === imageKey;
} catch {}
if (Boolean(imageKey) !== Boolean(imageUrl) || (imageKey && (!imageKey.startsWith(`${user.id}/`) || !["image/jpeg", "image/png", "image/webp"].includes(imageMimeType) || !Number.isSafeInteger(imageSize) || imageSize < 1 || imageSize > 3 * 1024 * 1024 || !validImageUrl))) {
return { error: "The image is invalid. Please choose an image up to 3 MB and try again." };
}
const parsed = postSchema.safeParse({
body: formData.get("body"),
image: imageUrl || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const limit = rateLimit(`post:${user.id}`, RATES.postPerMinute, 60_000);
if (!limit.ok) return { error: `Too many posts. Try again in ${limit.retryAfterSeconds}s.` };
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database
.from("posts")
.insert([{
author_id: user.id,
body: sanitizeMultiline(parsed.data.body),
image: parsed.data.image ?? null,
image_key: imageKey || null,
division_id: parsed.data.divisionId,
district_id: parsed.data.districtId,
upazila_id: parsed.data.upazilaId,
status: "visible",
}])
.select()
.single();
if (error) {
console.error("Community post insert failed", {
code: error.code,
message: error.message,
details: error.details,
hint: error.hint,
raw: error instanceof Error
? { name: error.name, message: error.message, stack: error.stack }
: JSON.stringify(error, Object.getOwnPropertyNames(error)),
});
if (imageKey) {
try { await client.storage.from(COMMUNITY_POST_IMAGE_BUCKET).remove([imageKey]); }
catch (cleanupError) { console.error("Failed to remove unused community post image", cleanupError); }
}
const errorText = error instanceof Error
? `${error.name}: ${error.message}`
: JSON.stringify(error, Object.getOwnPropertyNames(error));
const diagnostic = process.env.NODE_ENV === "development"
? ` (${String(error.code || errorText || "InsForge returned an empty error object").slice(0, 200)})`
: "";
return { error: `Your post could not be published${diagnostic}. Please try again.` };
}
revalidatePath("/community");
return { success: "Your post has been published." }; }
export async function createCommentAction(_prev: CommunityFormState, formData: FormData): Promise<CommunityFormState> {
const user = await requireUser();
const postId = String(formData.get("postId") ?? "");
const parsed = commentSchema.safeParse({ body: formData.get("body") });
if (!parsed.success) return { error: formatZodError(parsed.error) };
const client = createServerClient({ cookies: await cookies() });
const { data, error } = await client.database
.from("comments")
.insert([{
post_id: postId,
author_id: user.id,
body: sanitizeText(parsed.data.body, 2000),
status: "visible",
}])
.select()
.single();
if (error) throw error;
revalidatePath(`/community/${postId}`);
return { success: "Comment added." }; }
export async function reactToPostAction(postId: string): Promise<{ count: number }> {
await requireUser();
const client = createServerClient({ cookies: await cookies() });
const { data: post } = await client.database.from("posts").select("reactions").eq("id", postId).single();
if (!post) throw new Error("Post not found");
const newCount = (post.reactions ?? 0) + 1;
const { error } = await client.database.from("posts").update({ reactions: newCount }).eq("id", postId);
if (error) throw error;
revalidatePath(`/community/${postId}`);
return { count: newCount }; }
export async function reportAction(_prev: CommunityFormState, formData: FormData): Promise<CommunityFormState> {
const user = await requireUser();
const targetType = String(formData.get("targetType") ?? "post");
const targetId = String(formData.get("targetId") ?? "");
const parsed = reportSchema.safeParse({
reason: formData.get("reason"),
details: formData.get("details") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
if (!targetId) return { error: "Missing target." };
const limit = rateLimit(`report:${user.id}`, RATES.reportPerMinute, 60_000);
if (!limit.ok) return { error: `Too many reports. Try again in ${limit.retryAfterSeconds}s.` };
const client = createServerClient({ cookies: await cookies() });
const { error } = await client.database.from("reports").insert([{
target_type: targetType as Report["targetType"],
target_id: targetId,
reporter_id: user.id,
reason: sanitizeText(parsed.data.reason, 200),
details: parsed.data.details ? sanitizeText(parsed.data.details, 2000) : undefined,
}]);
if (error) throw error;
return { success: "Thanks — our moderators will review this." }; }
function getPostStorageKey(imageUrl: string | null | undefined): string | null {
if (!imageUrl) return null;
try {
const url = new URL(imageUrl);
const base = new URL(process.env.NEXT_PUBLIC_INSFORGE_URL!);
const bucket = getPostStorageBucket(imageUrl);
if (url.origin !== base.origin || !bucket) return null;
const prefix = `/api/storage/buckets/${bucket}/objects/`;
if (!url.pathname.startsWith(prefix)) return null;
const key = decodeURIComponent(url.pathname.slice(prefix.length));
return key && !key.split("/").some((part) => !part || part === "." || part === "..") ? key : null;
} catch { return null; }
}
function getPostStorageBucket(imageUrl: string | null | undefined): string | null {
if (!imageUrl) return null;
try {
const url = new URL(imageUrl);
const match = url.pathname.match(/^\/api\/storage\/buckets\/([^/]+)\/objects\//);
if (!match) return null;
const bucket = decodeURIComponent(match[1]);
return [PROFILE_IMAGE_BUCKET, COMMUNITY_POST_IMAGE_BUCKET].includes(bucket) ? bucket : null;
} catch { return null; }
}
export async function deleteOwnPostAction(postId: string): Promise<{ deleted: boolean; error?: string }> {
const user = await requireUser();
const post = await insforgeSelectOne("posts", { id: `eq.${postId}`, select: "id,author_id,image,image_key" });
const overrides = await getRolePermissionOverrides();
if (!post || (post.author_id !== user.id && !can(user.role, "moderation:posts", overrides))) {
return { deleted: false, error: "You do not have permission to delete this post." };
}
const storageKey = post.image_key || getPostStorageKey(post.image);
const storageBucket = getPostStorageBucket(post.image) || PROFILE_IMAGE_BUCKET;
const client = createServerClient({ cookies: await cookies() });
if (storageKey) {
const { error: storageError } = await client.storage.from(storageBucket).remove([storageKey]);
if (storageError) return { deleted: false, error: "The post image could not be deleted, so the post was kept." };
}
try {
await insforgeDelete("posts", postId);
} catch (error) {
console.error("Community post delete failed", error);
return { deleted: false, error: "The post could not be deleted. Please check the database permissions." };
}
revalidatePath("/community");
revalidatePath("/my-posts");
revalidatePath("/admin/community");
return { deleted: true }; }
export async function moderatePostAction(postId: string, status: string): Promise<{ ok: boolean; error?: string }> {
const user = await requireUser();
const overrides = await getRolePermissionOverrides();
if (!can(user.role, "moderation:posts", overrides)) return { ok: false, error: "You do not have permission to moderate posts." };
if (!["visible", "hidden"].includes(status)) return { ok: false, error: "Invalid post status." };
try {
const { data, error } = await insforgeUpdate("posts", postId, { status, updated_at: new Date().toISOString() });
if (error) return { ok: false, error: "The post could not be updated. Check the database permissions." };
if (!data?.length) return { ok: false, error: "The post was not found or your account cannot update it." };
} catch (error) {
console.error("Community post moderation failed", error);
return { ok: false, error: "The post could not be updated. Check the database permissions." };
}
revalidatePath("/community");
revalidatePath("/admin/community");
revalidatePath("/profile", "layout");
return { ok: true }; }
