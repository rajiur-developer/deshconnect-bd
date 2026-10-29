"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { PROFILE_IMAGE_BUCKET, PROFILE_IMAGE_MAX_BYTES, PROFILE_IMAGE_TYPES } from "@/features/account/constants";
import { messageSchema } from "@/lib/validation/schemas";
import { sanitizeMultiline } from "@/lib/security/sanitize";
import { rateLimit } from "@/lib/security/rate-limit";
import { RATES } from "@/lib/constants";
import { requireUser } from "@/lib/auth/current-user"; import { insforge } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import {
cancelConnection,
getOrCreateConversation,
requestConnection,
respondToConnection,
sendMessage, } from "@/services/messaging"; import { markAllNotificationsRead, markNotificationRead } from "@/services/notifications"; import { deletePost } from "@/services/community"; import { formatZodError, profileSchema } from "@/lib/validation/schemas"; import { sanitizeText } from "@/lib/security/sanitize"; import { recordAudit } from "@/services/audit"; import type { PublicUser } from "@/types/auth";
import type { Message } from "@/types/community";
export type AccountFormState = { error?: string; success?: string };
export async function updateProfileAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
const user = await requireUser();
const avatarUrl = String(formData.get("avatar") ?? "").trim();
const avatarKey = String(formData.get("avatar_key") ?? "").trim();
const avatarMimeType = String(formData.get("avatar_mime_type") ?? "").trim();
const avatarSize = Number(formData.get("avatar_size") ?? 0);
const hasNewAvatar = Boolean(avatarUrl || avatarKey || avatarMimeType || avatarSize);
if (hasNewAvatar) {
let trustedUrl = false;
try { trustedUrl = new URL(avatarUrl).origin === new URL(process.env.NEXT_PUBLIC_INSFORGE_URL!).origin; } catch { trustedUrl = false; }
const parts = avatarKey.split("/");
const safeKey = avatarKey.startsWith(`${user.id}/`) && parts.length === 2 && /^[a-zA-Z0-9._-]{1,180}$/.test(parts[1] ?? "");
if (!trustedUrl || !safeKey || !PROFILE_IMAGE_TYPES.includes(avatarMimeType as (typeof PROFILE_IMAGE_TYPES)[number]) || !Number.isInteger(avatarSize) || avatarSize < 1 || avatarSize > PROFILE_IMAGE_MAX_BYTES) {
return { error: "The selected profile image is invalid. Choose a JPG, JPEG, or PNG image up to 5 MB." };
}
}
const parsed = profileSchema.safeParse({
fullName: formData.get("fullName"),
bio: formData.get("bio") || undefined,
phone: formData.get("phone") || undefined,
avatar: formData.get("avatar") || undefined,
divisionId: formData.get("divisionId") || undefined,
districtId: formData.get("districtId") || undefined,
upazilaId: formData.get("upazilaId") || undefined,
});
if (!parsed.success) return { error: formatZodError(parsed.error) };
const client = createServerClient({ cookies: await cookies() });
const { data: previousProfile, error: profileReadError } = await client.database.from("profiles").select("avatar_key").eq("id", user.id).maybeSingle();
if (profileReadError) return { error: "Could not load your profile. Please try again." };
const update: Record<string, unknown> = {
full_name: sanitizeText(parsed.data.fullName, 120),
bio: parsed.data.bio ? sanitizeText(parsed.data.bio, 500) : undefined,
phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 30) : undefined,
division_id: parsed.data.divisionId,
district_id: parsed.data.districtId,
upazila_id: parsed.data.upazilaId,
updated_at: new Date().toISOString(),
};
if (hasNewAvatar) { update.avatar = avatarUrl; update.avatar_key = avatarKey; }
const { error } = await client.database.from("profiles").update(update).eq("id", user.id);
if (error) {
if (hasNewAvatar) await client.storage.from(PROFILE_IMAGE_BUCKET).remove(avatarKey);
return { error: "Could not save profile changes. Please try again." };
}
if (hasNewAvatar && previousProfile?.avatar_key && previousProfile.avatar_key !== avatarKey) {
await client.storage.from(PROFILE_IMAGE_BUCKET).remove(previousProfile.avatar_key);
}
revalidatePath("/profile");
revalidatePath("/profile/edit");
revalidatePath("/", "layout");
revalidatePath(`/profile/${user.username}`);
try {
await recordAudit({
actorId: user.id,
actorName: parsed.data.fullName,
action: "update_profile",
entity: "user",
entityId: user.id,
outcome: "success",
});
} catch (error) {
console.error("Profile updated, but its audit log could not be recorded.", error);
return { success: "Profile updated, but the activity log could not be saved." };
}
return { success: "Profile updated." }; }
export async function requestConnectionAction(username: string): Promise<{ ok: boolean; error?: string }> {
const user = await requireUser();
const client = createServerClient({ cookies: await cookies() });
const { data: target, error: targetError } = await client.database.from("public_profiles")
.select("id").eq("username", username).maybeSingle();
if (targetError) throw targetError;
if (!target) return { ok: false, error: "User not found." };
if (target.id === user.id) return { ok: false, error: "You cannot connect with yourself." };
const { data: existingEdges, error: lookupError } = await client.database.from("connections")
.select("id,status,requester_id,addressee_id")
.or(`and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`)
.limit(1);
if (lookupError) throw lookupError;
const existing = existingEdges?.[0];
if (existing) return { ok: false, error: existing.status === "accepted" ? "You are already connected." : existing.status === "pending" ? "A connection request already exists." : "A previous connection request already exists." };
const { data: inserted, error: insertError } = await client.database.from("connections")
.insert([{ requester_id: user.id, addressee_id: target.id, status: "pending" }])
.select("id,status,requester_id,addressee_id").maybeSingle();
if (insertError) {
if (insertError.code === "23505") return { ok: false, error: "A connection request already exists." };
throw insertError;
}
if (!inserted || inserted.status !== "pending" || inserted.requester_id !== user.id || inserted.addressee_id !== target.id) return { ok: false, error: "Could not confirm the connection request. Please try again." };
revalidatePath(`/profile/${username}`);
revalidatePath("/friend-requests");
return { ok: true }; }
export async function respondConnectionAction(connectionId: string, action: "accepted" | "rejected"): Promise<{ ok: boolean }> {
if (action !== "accepted" && action !== "rejected") return { ok: false };
const user = await requireUser();
const client = createServerClient({ cookies: await cookies() });
const { data: updated, error } = await client.database.from("connections")
.update({ status: action, updated_at: new Date().toISOString() })
.eq("id", connectionId).eq("addressee_id", user.id).eq("status", "pending")
.select("id,status,addressee_id").maybeSingle();
if (error) throw error;
if (!updated || updated.addressee_id !== user.id || updated.status !== action) return { ok: false };
revalidatePath("/connections");
revalidatePath("/friend-requests");
revalidatePath("/community");
return { ok: true }; }
export async function cancelConnectionAction(connectionId: string): Promise<{ ok: boolean }> {
const user = await requireUser();
const client = createServerClient({ cookies: await cookies() });
const { data: deleted, error } = await client.database.from("connections").delete()
.eq("id", connectionId).eq("requester_id", user.id).eq("status", "pending")
.select("id").maybeSingle();
if (error) throw error;
if (!deleted) return { ok: false };
revalidatePath("/friend-requests");
revalidatePath("/community");
return { ok: true }; }
export async function sendMessageAction(
conversationId: string,
body: string,
attachment?: { key: string; url: string; mimeType: string; type: "image" | "audio" },
replyToMessageId?: string | null ): Promise<{ ok: boolean; error?: string; message?: { id: string; conversationId: string; senderId: string; body: string; attachmentKey: string | null; attachmentUrl: string | null; attachmentMimeType: string | null; attachmentType: "image" | "audio" | null; replyToMessageId: string | null; createdAt: string; readBy: string[]; deliveredTo: string[]; editedAt: string | null; reactions: Array<{ userId: string; emoji: string }> } }> {
const user = await requireUser();
const { data: conv } = await insforge.database
.from("conversations")
.select("participant_ids")
.eq("id", conversationId)
.eq("conversation_type", "connection")
.filter("participant_ids", "cs", `{${user.id}}`)
.single();
if (!conv) return { ok: false, error: "You are not a participant in this conversation." };
const otherId = (conv.participant_ids ?? []).find((id: string) => id !== user.id);
if (!otherId || (conv.participant_ids ?? []).length !== 2) return { ok: false, error: "This conversation is unavailable." };
if (replyToMessageId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(replyToMessageId)) return { ok: false, error: "The message you are replying to is unavailable." };
  const { data: replyTarget } = await insforge.database.from("messages").select("id").eq("id", replyToMessageId).eq("conversation_id", conversationId).maybeSingle();
  if (!replyTarget) return { ok: false, error: "The message you are replying to is unavailable." };
}
const { data: connection } = await insforge.database.from("connections").select("id").eq("status", "accepted").or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`).maybeSingle();
if (!connection) return { ok: false, error: "Accept each other's connection request before messaging." };
const cleanBody = String(body ?? "").trim();
if (cleanBody.length > 2000) return { ok: false, error: "Messages can be up to 2,000 characters." };
if (!cleanBody && !attachment) return { ok: false, error: "Write a message or attach an image or voice message." };
if (cleanBody) {
const safeMessage = messageSchema.safeParse({ body: cleanBody });
if (!safeMessage.success) return { ok: false, error: formatZodError(safeMessage.error) };
}
const attachmentTypes = new Set(["image/jpeg", "image/png", "image/webp", "audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac", "audio/x-wav"]);
if (attachment) {
const keyParts = attachment.key.split("/");
let validUrl = false;
try {
const url = new URL(attachment.url);
validUrl = url.origin === new URL(process.env.NEXT_PUBLIC_INSFORGE_URL!).origin && decodeURIComponent(url.pathname).includes("record-attachments") && decodeURIComponent(url.pathname).includes(attachment.key);
} catch { validUrl = false; }
if (keyParts.length !== 3 || keyParts[0] !== user.id || keyParts[1] !== conversationId || !/^[a-zA-Z0-9-]{12,80}\.[a-z0-9]{2,6}$/i.test(keyParts[2]) || !validUrl || !attachmentTypes.has(attachment.mimeType) || !["image", "audio"].includes(attachment.type) || (attachment.type === "image") !== attachment.mimeType.startsWith("image/")) {
return { ok: false, error: "The selected image or voice message is invalid. Please select it again." };
}
}
const limit = rateLimit(`message:${user.id}`, RATES.bloodChatPerMinute, 60_000);
if (!limit.ok) return { ok: false, error: `Too many messages. Try again in ${limit.retryAfterSeconds}s.` };
const { data: message, error } = await insforge.database
.from("messages")
.insert([{
conversation_id: conversationId,
sender_id: user.id,
body: sanitizeMultiline(cleanBody, 2000),
attachment_key: attachment?.key ?? null,
attachment_url: attachment?.url ?? null,
attachment_mime_type: attachment?.mimeType ?? null,
attachment_type: attachment?.type ?? null,
reply_to_message_id: replyToMessageId ?? null,
}])
.select()
.single();
if (error || !message) return { ok: false, error: "Could not send this message. Check the connection and try again." };
revalidatePath(`/messages/${conversationId}`);
  return { ok: true, message: { id: message.id, conversationId: message.conversation_id, senderId: message.sender_id, body: message.body, attachmentKey: message.attachment_key ?? null, attachmentUrl: message.attachment_url ?? null, attachmentMimeType: message.attachment_mime_type ?? null, attachmentType: message.attachment_type ?? null, replyToMessageId: message.reply_to_message_id ?? null, createdAt: message.created_at, readBy: message.read_by ?? [], deliveredTo: message.delivered_to ?? [], editedAt: message.edited_at ?? null, reactions: message.reactions ?? [] } }; }
export async function startConversationAction(username: string): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
const user = await requireUser();
const { data: target } = await insforge.database.from("public_profiles").select("id").eq("username", username).single();
if (!target) return { ok: false, error: "User not found." };
const { data: connection } = await insforge.database.from("connections").select("id").eq("status", "accepted").or(`and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`).maybeSingle();
if (!connection) return { ok: false, error: "You can message this member after they accept your connection request." };
const { data: conv } = await insforge.database
.from("conversations")
.select("id")
.eq("conversation_type", "connection")
.filter("participant_ids", "cs", `{${user.id}}`)
.filter("participant_ids", "cs", `{${target.id}}`)
.maybeSingle();
if (conv) return { ok: true, conversationId: conv.id };
const { data: conversation, error } = await insforge.database
.from("conversations")
.insert([{ participant_ids: [user.id, target.id], conversation_type: "connection" }])
.select()
.single();
if (!error && conversation?.id) return { ok: true, conversationId: conversation.id };
const { data: existing, error: retryError } = await insforge.database.from("conversations").select("id").eq("conversation_type", "connection").filter("participant_ids", "cs", `{${user.id}}`).filter("participant_ids", "cs", `{${target.id}}`).maybeSingle();
if (!retryError && existing?.id) return { ok: true, conversationId: existing.id };
return { ok: false, error: "Could not open this conversation. Please try again." }; }
export async function openConversationAction(username: string) {
const user = await requireUser();
const { data: target, error: targetError } = await insforge.database.from("public_profiles").select("id").eq("username", username).maybeSingle();
if (targetError || !target) return { ok: false as const, error: "This member could not be found." };
if (target.id === user.id) return { ok: false as const, error: "You cannot message yourself." };
const { data: connection, error: connectionError } = await insforge.database.from("connections").select("id").eq("status", "accepted").or(`and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`).maybeSingle();
if (connectionError || !connection) return { ok: false as const, error: "Messaging is available after the connection request is accepted." };
let { data: conversation, error: conversationError } = await insforge.database.from("conversations").select("id,participant_ids").eq("conversation_type", "connection").filter("participant_ids", "cs", `{${user.id}}`).filter("participant_ids", "cs", `{${target.id}}`).maybeSingle();
if (conversationError) return { ok: false as const, error: "Could not open this conversation. Please try again." };
if (!conversation) {
const result = await insforge.database.from("conversations").insert([{ participant_ids: [user.id, target.id], conversation_type: "connection" }]).select("id,participant_ids").single();
conversation = result.data;
conversationError = result.error;
if (conversationError) {
const retry = await insforge.database.from("conversations").select("id,participant_ids").eq("conversation_type", "connection").filter("participant_ids", "cs", `{${user.id}}`).filter("participant_ids", "cs", `{${target.id}}`).maybeSingle();
if (!retry.error && retry.data) { conversation = retry.data; conversationError = null; }
}
}
if (conversationError || !conversation?.id || !(conversation.participant_ids ?? []).includes(user.id) || !(conversation.participant_ids ?? []).includes(target.id)) return { ok: false as const, error: "Could not open this conversation. Please try again." };
  const { data: rows, error: messageError } = await insforge.database.from("messages").select("id,conversation_id,sender_id,body,attachment_key,attachment_url,attachment_mime_type,attachment_type,reply_to_message_id,reactions,created_at,read_by,delivered_to,edited_at").eq("conversation_id", conversation.id).order("created_at", { ascending: true });
if (messageError) return { ok: false as const, error: "Could not load messages. Please try again." };
const { data: unreadClearedCount, error: markReadError } = await insforge.database.rpc("mark_conversation_messages_read", { target_conversation_id: conversation.id });
if (markReadError) console.error("Could not mark conversation messages as read:", markReadError.message);
  const messages = (rows ?? []).map((message: any) => ({ id: message.id, conversationId: message.conversation_id, senderId: message.sender_id, body: message.body, attachmentKey: message.attachment_key ?? null, attachmentUrl: message.attachment_url ?? null, attachmentMimeType: message.attachment_mime_type ?? null, attachmentType: message.attachment_type ?? null, replyToMessageId: message.reply_to_message_id ?? null, reactions: message.reactions ?? [], createdAt: message.created_at, readBy: message.read_by ?? [], deliveredTo: message.delivered_to ?? [], editedAt: message.edited_at ?? null }));
return { ok: true as const, conversationId: conversation.id, messages, unreadClearedCount: markReadError ? 0 : Number(unreadClearedCount ?? 0) };
}
export async function markConversationMessagesReadAction(conversationId: string): Promise<{ ok: boolean; count: number }> {
const user = await requireUser();
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) return { ok: false, count: 0 };
const { data, error } = await insforge.database.rpc("mark_conversation_messages_read", { target_conversation_id: conversationId });
if (error) { console.error("Could not mark conversation messages as read:", error.message); return { ok: false, count: 0 }; }
revalidatePath("/messages");
return { ok: true, count: Number(data ?? 0) };
}
export async function markConversationMessagesDeliveredAction(conversationId: string): Promise<void> {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error: authError } = await client.auth.getCurrentUser();
  if (authError || !data?.user) return;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) return;
  const { error } = await client.database.rpc("mark_conversation_messages_delivered", { target_conversation_id: conversationId });
  if (error) console.error(`Could not mark messages delivered for ${data.user.id}:`, error.message);
}

export async function getMessageNotificationSnapshotAction(since: string) {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error: authError } = await client.auth.getCurrentUser();
  if (authError || !data?.user) {
    return { authenticated: false as const, conversations: [], unreadMessages: [], messages: [] };
  }
  const user = data.user;
  const cursor = Number.isNaN(Date.parse(since)) ? new Date().toISOString() : since;
  const { data: conversations, error: conversationsError } = await client.database
    .from("conversations")
    .select("id,participant_ids")
    .eq("conversation_type", "connection")
    .filter("participant_ids", "cs", `{${user.id}}`)
    .limit(200);
  if (conversationsError) throw new Error(`Could not load message conversations: ${conversationsError.message}`);

  const conversationIds = (conversations ?? []).map((conversation: any) => conversation.id);
  const [unreadResult, messageResult] = await Promise.all([
    client.database.rpc("get_unread_message_counts"),
    conversationIds.length
      ? client.database
          .from("messages")
          .select("id,conversation_id,sender_id,body,attachment_key,attachment_url,attachment_mime_type,attachment_type,reply_to_message_id,reactions,created_at,read_by,delivered_to,edited_at")
          .in("conversation_id", conversationIds)
          .gt("created_at", cursor)
          .order("created_at", { ascending: true })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (unreadResult.error) throw new Error(`Could not refresh unread message counts: ${unreadResult.error.message}`);
  if (messageResult.error) throw new Error(`Could not load recent messages: ${messageResult.error.message}`);

  return {
    authenticated: true as const,
    conversations: (conversations ?? []).flatMap((conversation: any) => {
      const memberId = (conversation.participant_ids ?? []).find((id: string) => id !== user.id);
      return memberId ? [{ id: conversation.id, memberId }] : [];
    }),
    unreadMessages: (unreadResult.data ?? []).map((row: any) => ({
      conversationId: row.conversation_id,
      count: Number(row.unread_count ?? 0),
    })),
    messages: (messageResult.data ?? []).map((message: any) => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      body: message.body ?? "",
      attachmentKey: message.attachment_key ?? null,
      attachmentUrl: message.attachment_url ?? null,
      attachmentMimeType: message.attachment_mime_type ?? null,
      attachmentType: message.attachment_type ?? null,
      replyToMessageId: message.reply_to_message_id ?? null,
      reactions: message.reactions ?? [],
      createdAt: message.created_at,
      readBy: message.read_by ?? [],
      deliveredTo: message.delivered_to ?? [],
      editedAt: message.edited_at ?? null,
    })),
  };
}

async function canManageOwnMessage(messageId: string, userId: string) {
  const { data: message } = await insforge.database.from("messages").select("id,conversation_id,sender_id,attachment_key").eq("id", messageId).eq("sender_id", userId).maybeSingle();
  if (!message) return null;
  const { data: conversation } = await insforge.database.from("conversations").select("participant_ids,conversation_type").eq("id", message.conversation_id).maybeSingle();
  if (!conversation || conversation.conversation_type !== "connection" || !(conversation.participant_ids ?? []).includes(userId)) return null;
  const otherId = conversation.participant_ids.find((id: string) => id !== userId);
  if (!otherId) return null;
  const { data: connection } = await insforge.database.from("connections").select("id").eq("status", "accepted").or(`and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`).maybeSingle();
  return connection ? { ...message, conversationId: message.conversation_id } : null;
}

export async function editOwnMessageAction(messageId: string, body: string): Promise<{ ok: boolean; error?: string; message?: Partial<Message> }> {
  const user = await requireUser();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) return { ok: false, error: "This message is unavailable." };
  const cleanBody = String(body ?? "").trim();
  if (!cleanBody || cleanBody.length > 2000) return { ok: false, error: "Messages must contain 1–2,000 characters." };
  const parsed = messageSchema.safeParse({ body: cleanBody });
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) };
  const owned = await canManageOwnMessage(messageId, user.id);
  if (!owned) return { ok: false, error: "You can only edit your own message in an active connection." };
  const editedAt = new Date().toISOString();
  const { data, error } = await insforge.database.from("messages").update({ body: sanitizeMultiline(cleanBody, 2000), edited_at: editedAt }).eq("id", messageId).eq("sender_id", user.id).select("id,conversation_id,sender_id,body,read_by,delivered_to,edited_at").maybeSingle();
  if (error || !data) return { ok: false, error: "Could not update this message. Please try again." };
  revalidatePath(`/messages/${owned.conversationId}`);
  return { ok: true, message: { id: data.id, conversationId: data.conversation_id, senderId: data.sender_id, body: data.body, readBy: data.read_by ?? [], deliveredTo: data.delivered_to ?? [], editedAt: data.edited_at } };
}

export async function deleteOwnMessageAction(messageId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) return { ok: false, error: "This message is unavailable." };
  const owned = await canManageOwnMessage(messageId, user.id);
  if (!owned) return { ok: false, error: "You can only delete your own message in an active connection." };
  const { error } = await insforge.database.from("messages").delete().eq("id", messageId).eq("sender_id", user.id);
  if (error) return { ok: false, error: "Could not delete this message. Please try again." };
  if (owned.attachment_key) {
    const { error: storageError } = await insforge.storage.from("record-attachments").remove(owned.attachment_key);
    if (storageError) console.warn("Could not remove deleted chat attachment:", storageError.message);
  }
  revalidatePath(`/messages/${owned.conversationId}`);
  return { ok: true };
}

export async function deleteMessageForMeAction(messageId: string): Promise<{ ok: boolean; error?: string }> {
  await requireUser();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
    return { ok: false, error: "This message is unavailable." };
  }

  const { data, error } = await insforge.database.rpc("hide_chat_message_for_current_user", {
    target_message_id: messageId,
  });
  if (error || data !== true) {
    if (error) console.error("Could not hide chat message for current user:", error.message);
    return { ok: false, error: "Could not delete this message for you. Please try again." };
  }

  return { ok: true };
}

export async function toggleMessageReactionAction(messageId: string, emoji: string): Promise<{ ok: boolean; error?: string; reactions?: Array<{ userId: string; emoji: string }> }> {
  const user = await requireUser();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) return { ok: false, error: "This message is unavailable." };
  const allowed = new Set(["👍", "❤️", "😂", "😮", "😢", "🙏"]);
  if (!allowed.has(emoji)) return { ok: false, error: "Choose a supported reaction." };
  const { data, error } = await insforge.database.rpc("toggle_message_reaction", { target_message_id: messageId, target_emoji: emoji });
  if (error) {
    console.error(`Could not react to message for ${user.id}:`, error.message);
    return { ok: false, error: "Could not save your reaction. Please try again." };
  }
  revalidatePath("/messages");
  return { ok: true, reactions: Array.isArray(data) ? data : [] };
}
export async function markNotificationReadAction(id: string): Promise<void> {
const user = await requireUser();
await insforge.database.from("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id);
revalidatePath("/notifications"); }
export async function markAllNotificationsReadAction(): Promise<void> {
const user = await requireUser();
await insforge.database.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
revalidatePath("/notifications"); }
export async function deleteOwnPostAction(postId: string): Promise<{ deleted: boolean }> {
const user = await requireUser();
const { data: post } = await insforge.database.from("posts").select("author_id").eq("id", postId).single();
if (!post || post.author_id !== user.id) return { deleted: false };
const { error } = await insforge.database.from("posts").delete().eq("id", postId);
if (error) throw error;
revalidatePath("/my-posts");
revalidatePath("/community");
return { deleted: true }; }
export type { PublicUser };
