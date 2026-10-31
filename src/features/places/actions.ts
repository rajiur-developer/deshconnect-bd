"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user"; import { insforge } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { formatZodError, reviewSchema } from "@/lib/validation/schemas"; import { rateLimit } from "@/lib/security/rate-limit"; import { RATES } from "@/lib/constants";
export async function toggleSaveAction(placeId: string): Promise<{ saved: boolean }> {
const user = await requireUser();
const existing = await insforge.database
.from("saved_places")
.select("id")
.eq("user_id", user.id)
.eq("place_id", placeId)
.maybeSingle();
if (existing?.data) {
const { error } = await insforge.database.from("saved_places").delete().eq("user_id", user.id).eq("place_id", placeId);
if (error) throw error;
revalidatePath("/saved");
revalidatePath(`/places/${placeId}`);
return { saved: false };
} else {
const { error } = await insforge.database.from("saved_places").insert([{ user_id: user.id, place_id: placeId }]);
if (error) throw error;
revalidatePath("/saved");
revalidatePath(`/places/${placeId}`);
return { saved: true };
} }
export type ReviewFormState = { error?: string; success?: string };
export async function createReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
const user = await requireUser();
const slug = String(formData.get("slug") ?? "").trim();
const placeId = String(formData.get("placeId") ?? "").trim();

// FormData values are strings. Convert the selected rating before Zod validation;
// otherwise z.number() rejects every normal form submission.
const parsed = reviewSchema.safeParse({
rating: Number(formData.get("rating")),
title: String(formData.get("title") ?? "").trim(),
body: String(formData.get("body") ?? "").trim(),
});
if (!placeId || !slug) return { error: "Place information is missing. Refresh the page and try again." };
if (!parsed.success) {
return { error: formatZodError(parsed.error) };
}
const limit = rateLimit(`review:${user.id}`, RATES.postPerMinute, 60_000);
if (!limit.ok) {
return { error: `Too many reviews. Try again in ${limit.retryAfterSeconds}s.` };
}
try {
const { error } = await insforge.database
.from("reviews")
.insert([{
place_id: placeId,
author_id: user.id,
rating: parsed.data.rating,
title: parsed.data.title,
body: parsed.data.body,
status: "visible",
}]);
if (error) {
const dbError = error as { code?: string; message?: string };
if (dbError.code === "23505") {
return { error: "You have already reviewed this place." };
}
return { error: dbError.message || "Your review could not be published. Please try again." };
}
} catch (error) {
const dbError = error as { code?: string; message?: string };
if (dbError.code === "23505") {
return { error: "You have already reviewed this place." };
}
return { error: dbError.message || "Your review could not be published. Please try again." };
}
revalidatePath(`/places/${slug}`);
revalidatePath("/my-reviews");
revalidatePath("/admin/reviews");
return { success: "Thanks! Your review has been published." };
}
