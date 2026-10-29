"use server";
import { revalidatePath } from "next/cache";
import { getDonationEligibility } from "@/lib/blood-donation";
import { requireUser } from "@/lib/auth/current-user"; import { insforge } from "@/lib/insforge"; import { formatZodError, bloodRequestSchema, donorSchema, messageSchema } from "@/lib/validation/schemas"; import { sanitizeMultiline, sanitizeText } from "@/lib/security/sanitize"; import { rateLimit } from "@/lib/security/rate-limit"; import { RATES } from "@/lib/constants"; import { notify } from "@/services/notifications"; import { createBloodRequest, upsertDonor } from "@/services/blood";
export type BloodFormState = { error?: string; success?: string };
export async function registerDonorAction(_prev: BloodFormState, formData: FormData): Promise<BloodFormState> {
const user = await requireUser();
const parsed = donorSchema.safeParse({
bloodGroup: formData.get("bloodGroup"),
availability: formData.get("availability"),
preferredContact: formData.get("preferredContact"),
contactValue: formData.get("contactValue") || formData.get("phone") || formData.get("whatsapp") || undefined,
phone: formData.get("phone") || undefined,
whatsapp: formData.get("whatsapp") || undefined,
lastDonationAt: formData.get("lastDonationAt") || undefined,
notes: formData.get("notes") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
consentListed: formData.get("consentListed"),
consentContact: formData.get("consentContact"),
});
if (!parsed.success) {
return { error: formatZodError(parsed.error) };
}
if (!parsed.data.consentListed) {
return { error: "You must consent to being listed as a donor." };
}
if (!parsed.data.consentContact) return { error: "Consent to showing your phone and WhatsApp publicly is required to list your contact details." };
if (parsed.data.availability === "available" && !getDonationEligibility(parsed.data.lastDonationAt)?.eligible) {
return { error: "You can mark yourself Ready only 75 days after your last donation." };
}
try {
await upsertDonor({
userId: user.id,
bloodGroup: parsed.data.bloodGroup,
availability: parsed.data.availability,
preferredContact: parsed.data.preferredContact,
contactValue: sanitizeText(parsed.data.contactValue, 200),
phone: sanitizeText(parsed.data.phone, 30),
whatsapp: sanitizeText(parsed.data.whatsapp, 30),
lastDonationAt: parsed.data.lastDonationAt,
notes: parsed.data.notes ? sanitizeText(parsed.data.notes, 500) : undefined,
consentListed: parsed.data.consentListed,
consentContact: parsed.data.consentContact,
divisionId: parsed.data.divisionId,
districtId: parsed.data.districtId,
upazilaId: parsed.data.upazilaId,
});
} catch (error) {
console.error("Could not save donor profile:", error);
return { error: "Your donor profile could not be saved. Please try again." };
}
revalidatePath("/blood-donation");
revalidatePath("/settings");
return { success: "Your donor profile has been saved." }; }
export async function archiveOwnDonorProfileAction(): Promise<{ ok: boolean; error?: string }> {
const user = await requireUser();
const { data, error } = await insforge.database
.from("blood_donors")
.update({
availability: "unavailable",
consent_listed: false,
consent_contact: false,
archived_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
})
.eq("user_id", user.id)
.is("archived_at", null)
.select("id")
.maybeSingle();
if (error) {
console.error("Could not archive donor profile:", error);
return { ok: false, error: "Your donor profile could not be removed. Please try again." };
}
if (!data) return { ok: false, error: "No active donor profile was found." };
revalidatePath("/blood-donation");
revalidatePath("/settings");
revalidatePath("/admin/blood-donors");
return { ok: true };
}
export async function createBloodRequestAction(_prev: BloodFormState, formData: FormData): Promise<BloodFormState> {
const user = await requireUser();
const parsed = bloodRequestSchema.safeParse({
bloodGroup: formData.get("bloodGroup"),
units: formData.get("units"),
patient: formData.get("patient") || undefined,
hospital: formData.get("hospital"),
neededBy: formData.get("neededBy"),
phone: formData.get("phone"),
whatsapp: formData.get("whatsapp"),
notes: formData.get("notes") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) {
return { error: formatZodError(parsed.error) };
}
const limit = rateLimit(`bloodrequest:${user.id}`, RATES.bloodRequestPerHour, 60 * 60_000);
if (!limit.ok) {
return { error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` };
}
try {
await createBloodRequest({
requesterId: user.id,
bloodGroup: parsed.data.bloodGroup,
units: parsed.data.units,
patient: sanitizeText(parsed.data.patient, 120),
hospital: sanitizeText(parsed.data.hospital, 200),
neededBy: parsed.data.neededBy,
    phone: sanitizeText(parsed.data.phone, 30),
    whatsapp: sanitizeText(parsed.data.whatsapp, 30),
notes: parsed.data.notes ? sanitizeText(parsed.data.notes, 1000) : undefined,
location: { divisionId: parsed.data.divisionId, districtId: parsed.data.districtId, upazilaId: parsed.data.upazilaId },
});
} catch (error) {
console.error("Could not submit blood request:", error);
return { error: "Your blood request could not be submitted. Please try again." };
}
try {
await notify(user.id, {
title: "Blood request submitted",
body: "Your request is under review and will be published once approved.",
href: "/my-blood-requests",
});
} catch (error) {
console.error("Blood request was submitted, but its confirmation notification failed:", error);
}
revalidatePath("/blood-donation");
return { success: "Your blood request has been submitted for review." }; }
export async function cancelBloodRequestAction(requestId: string): Promise<{ cancelled: boolean }> {
const user = await requireUser();
const { data, error } = await insforge.database
.from("blood_requests")
.update({ status: "cancelled", updated_at: new Date().toISOString() })
.eq("id", requestId)
.eq("requester_id", user.id)
.eq("status", "active")
.select();
if (error) throw error;
if (data?.length) revalidatePath("/blood-donation");
return { cancelled: (data?.length ?? 0) > 0 }; }
export async function releaseDonorContactAction(donorId: string) {
const user = await requireUser();
const { data: donor, error } = await insforge.database
.from("blood_donors")
.select("id,user_id,phone,whatsapp,blood_group,consent_listed,consent_contact,consent_expiry")
.eq("id", donorId)
.eq("consent_listed", true)
.eq("consent_contact", true)
.single();
if (error || !donor) return null;
const today = new Date().toISOString().slice(0, 10);
const consentExpiry = new Date(donor.consent_expiry).toISOString().slice(0, 10);
if (consentExpiry < today) return null;
const { data: requests } = await insforge.database
.from("blood_requests")
.select("id")
.eq("requester_id", user.id)
.eq("status", "active")
.eq("blood_group", donor.blood_group)
.gte("needed_by", today);
if (!requests?.length) return null;
return {
phone: donor.phone ?? donor.whatsapp ?? null,
whatsapp: donor.whatsapp ?? donor.phone ?? null,
}; }
export async function releaseRequesterContactAction(requestId: string) {
const user = await requireUser();
const { data: request, error } = await insforge.database
.from("blood_requests")
.select("*, profiles!inner(*)")
.eq("id", requestId)
.eq("status", "active")
.single();
if (error || !request) return null;
const requester = request.profiles;
if (!requester?.phone) return null;
const today = new Date().toISOString().slice(0, 10);
const { data: donor } = await insforge.database
.from("blood_donors")
.select("id")
.eq("user_id", user.id)
.eq("consent_listed", true)
.maybeSingle();
const { data: viewerRequest } = await insforge.database
.from("blood_requests")
.select("id")
.eq("requester_id", user.id)
.eq("status", "active")
.eq("blood_group", request.blood_group)
.gte("needed_by", today)
.maybeSingle();
if (!donor && !viewerRequest) return null;
return {
phone: request.phone ?? requester.phone ?? null,
whatsapp: request.whatsapp ?? requester.whatsapp ?? request.phone ?? requester.phone ?? null,
}; }
export async function startBloodChatAction(
targetType: "donor" | "request",
targetId: string ): Promise<{ conversationId?: string; error?: string }> {
const user = await requireUser();
if ((targetType !== "donor" && targetType !== "request") || !targetId) {
return { error: "Invalid blood listing." };
}
let targetUserId: string | null = null;
if (targetType === "donor") {
const { data: donor, error } = await insforge.database
.from("public_blood_donors")
.select("user_id")
.eq("id", targetId)
.maybeSingle();
if (error) {
console.error("Could not load donor for blood chat:", error);
return { error: "Could not open this donor chat. Please try again." };
}
targetUserId = donor?.user_id ?? null;
} else {
const { data: request, error } = await insforge.database
.from("blood_requests")
.select("requester_id")
.eq("id", targetId)
.eq("status", "active")
 .maybeSingle();
if (error) {
console.error("Could not load request for blood chat:", error);
return { error: "Could not open this request chat. Please try again." };
}
targetUserId = request?.requester_id ?? null;
}
if (!targetUserId || targetUserId === user.id) {
return { error: "This blood listing is no longer available for chat." };
}
// Check if conversation already exists
const { data: existingConv, error: existingError } = await insforge.database
.from("conversations")
.select("id")
.eq("conversation_type", "blood")
.eq("blood_target_type", targetType)
.eq("blood_target_id", targetId)
.filter("participant_ids", "cs", `{${user.id}}`)
.filter("participant_ids", "cs", `{${targetUserId}}`)
.maybeSingle();
if (existingError) {
console.error("Could not find existing blood chat:", existingError);
return { error: "Could not open this chat. Please try again." };
}
if (existingConv) {
return { conversationId: existingConv.id };
}
const { data: conv, error } = await insforge.database
.from("conversations")
.insert([{ participant_ids: [user.id, targetUserId], conversation_type: "blood", blood_target_type: targetType, blood_target_id: targetId }])
.select("id")
.single();
if (error || !conv) {
console.error("Could not create blood chat:", error);
return { error: "Could not create this chat. Please try again." };
}
return { conversationId: conv.id }; }
export async function getBloodChatMessagesAction(conversationId: string) {
const user = await requireUser();
const { data: conversation, error: conversationError } = await insforge.database
.from("conversations")
.select("*")
.eq("id", conversationId)
.eq("conversation_type", "blood")
.filter("participant_ids", "cs", `{${user.id}}`)
.maybeSingle();
if (conversationError) {
console.error("Could not verify blood chat participant:", conversationError);
return { error: "Could not load this chat. Please try again." };
}
if (!conversation) return { error: "You are not a participant in this conversation." };
const { data: messages, error } = await insforge.database
.from("messages")
.select("*")
.eq("conversation_id", conversationId)
.order("created_at", { ascending: true });
if (error) {
console.error("Could not load blood chat messages:", error);
return { error: "Could not load messages. Please try again." };
}
return { messages: (messages ?? []).map((message: any) => ({ id: message.id, conversationId: message.conversation_id, senderId: message.sender_id, body: message.body, createdAt: message.created_at, readBy: message.read_by ?? [] })) }; }
export async function sendBloodChatMessageAction(conversationId: string, body: string) {
const user = await requireUser();
const { data: conversation, error: conversationError } = await insforge.database.from("conversations").select("id").eq("id", conversationId).eq("conversation_type", "blood").filter("participant_ids", "cs", `{${user.id}}`).maybeSingle();
if (conversationError) {
console.error("Could not verify blood chat participant before sending:", conversationError);
return { error: "Could not send your message. Please try again." };
}
if (!conversation) return { error: "You are not a participant in this blood donation chat." };
const parsed = messageSchema.safeParse({ body });
if (!parsed.success) return { error: formatZodError(parsed.error) };
const limit = rateLimit(`bloodchat:${user.id}`, RATES.bloodChatPerMinute, 60_000);
if (!limit.ok) return { error: `Too many messages. Try again in ${limit.retryAfterSeconds}s.` };
const { data: message, error } = await insforge.database
.from("messages")
.insert([{
conversation_id: conversationId,
sender_id: user.id,
body: sanitizeMultiline(parsed.data.body, 2000),
}])
.select()
.single();
if (error || !message) {
console.error("Could not send blood chat message:", error);
return { error: "Could not send your message. Please try again." };
}
return { message: { id: message.id, conversationId: message.conversation_id, senderId: message.sender_id, body: message.body, createdAt: message.created_at, readBy: message.read_by ?? [] } }; }
