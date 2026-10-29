"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { createId } from "@/lib/utils";
import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import { requireUser } from "@/lib/auth/current-user"; import { formatZodError, newsSchema } from "@/lib/validation/schemas"; import { sanitizeMultiline, sanitizeText } from "@/lib/security/sanitize"; import { rateLimit } from "@/lib/security/rate-limit"; import { RATES } from "@/lib/constants"; import { notify } from "@/services/notifications";
import { isContentCategory } from "@/services/content-categories";
export type NewsFormState = { error?: string; success?: string };
export async function submitNewsAction(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
const user = await requireUser();
const imageKey = String(formData.get("imageKey") ?? "");
const imageUrl = String(formData.get("image") ?? "");
let validImageUrl = false;
if (imageKey || imageUrl) {
try {
const parsedImageUrl = new URL(imageUrl);
const expectedPrefix = `/api/storage/buckets/${COMMUNITY_POST_IMAGE_BUCKET}/objects/`;
validImageUrl = parsedImageUrl.origin === new URL(process.env.NEXT_PUBLIC_INSFORGE_URL!).origin
&& parsedImageUrl.pathname.startsWith(expectedPrefix)
&& decodeURIComponent(parsedImageUrl.pathname.slice(expectedPrefix.length)) === imageKey;
} catch {}
if (!imageKey.startsWith(`${user.id}/news/`) || !validImageUrl) return { error: "The selected image could not be verified. Please choose it again." };
}
const parsed = newsSchema.safeParse({
title: formData.get("title"),
excerpt: formData.get("excerpt"),
body: formData.get("body"),
category: formData.get("category"),
source: formData.get("source") || undefined,
image: formData.get("image") || undefined,
});
if (!parsed.success) {
return { error: formatZodError(parsed.error) };
}
if (!(await isContentCategory("news", parsed.data.category))) return { error: "Please choose a valid news category." };
const limit = rateLimit(`news:${user.id}`, RATES.postPerMinute, 60_000);
if (!limit.ok) {
return { error: `Too many submissions. Try again in ${limit.retryAfterSeconds}s.` };
}
let error: any = null;
try {
const client = createServerClient({ cookies: await cookies() });
const { error: insertError } = await client.database
.from("news")
.insert([{
slug: createId("news").replace("news_", "news-"),
author_id: user.id,
title: sanitizeText(parsed.data.title, 200),
excerpt: sanitizeText(parsed.data.excerpt, 300),
body: sanitizeMultiline(parsed.data.body),
category: parsed.data.category,
source: parsed.data.source ? sanitizeText(parsed.data.source, 200) : undefined,
image: parsed.data.image || "/images/news/user.svg",
status: "pending_review",
division_id: user.divisionId ?? null,
district_id: user.districtId ?? null,
upazila_id: user.upazilaId ?? null,
}])
.select()
.single();
error = insertError;
} catch (insertError) {
console.error("News submission request failed", insertError instanceof Error ? { name: insertError.name, message: insertError.message } : JSON.stringify(insertError));
return { error: "Your news could not be submitted. Please try again." };
}
if (error) {
console.error("News submission failed", { code: error.code, message: error.message });
return { error: "Your news could not be submitted. Please try again." };
}
try { await notify(user.id, {
title: "News submitted",
body: "Your article is pending review.",
href: "/my-news",
}); } catch (notificationError) { console.error("News submitted but notification failed.", notificationError); }
revalidatePath("/my-news");
return { success: "Submitted for review. It will stay private until an editor approves it." }; }
