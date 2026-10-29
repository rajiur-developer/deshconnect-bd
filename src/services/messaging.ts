import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { insforge } from "@/lib/insforge";

export async function insforgeListConversations(userId: string) {
  const { data } = await insforgeSelectMany("conversations", { participant_ids: `cs.{${userId}}`, conversation_type: "eq.connection" });
  return (data || []).map((r: any) => ({
    id: r.id,
    participantIds: r.participant_ids,
    updatedAt: r.updated_at,
  }));
}

export async function listUnreadMessageCounts() {
  const { data, error } = await insforge.database.rpc("get_unread_message_counts");
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    conversationId: row.conversation_id,
    count: Number(row.unread_count ?? 0),
  }));
}

export type ConversationPreview = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentType: "image" | "audio" | null;
  createdAt: string;
};

export async function listConversationPreviews(conversationIds: string[]): Promise<ConversationPreview[]> {
  const ids = [...new Set(conversationIds.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))];
  if (ids.length === 0) return [];
  const results = await Promise.all(ids.map(async (conversationId) => {
    const { data, error } = await insforge.database
      .from("messages")
      .select("id,conversation_id,sender_id,body,attachment_type,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      body: data.body ?? "",
      attachmentType: data.attachment_type ?? null,
      createdAt: data.created_at,
    } satisfies ConversationPreview;
  }));
  return results.filter((preview): preview is ConversationPreview => preview !== null);
}

export async function insforgeGetConversationForUser(conversationId: string, userId: string) {
  const data = await insforgeSelectOne("conversations", { id: `eq.${conversationId}`, participant_ids: `cs.{${userId}}`, conversation_type: "eq.connection" });
  if (!data) return null;
  const otherId = (data.participant_ids ?? []).find((id: string) => id !== userId);
  if (!otherId || data.participant_ids.length !== 2) return null;
  const { data: connection } = await insforgeSelectOne("connections", { status: "eq.accepted", or: `(and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId}))` });
  if (!connection) return null;
  return {
    id: data.id,
    participantIds: data.participant_ids,
    updatedAt: data.updated_at,
  };
}

export async function insforgeListMessages(conversationId: string, userId: string) {
  if (!(await insforgeGetConversationForUser(conversationId, userId))) return [];
  const { data } = await insforgeSelectMany("messages", { conversation_id: `eq.${conversationId}`, order: "created_at.asc" });
  return (data || []).map((r: any) => ({
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    body: r.body,
    attachmentKey: r.attachment_key ?? null,
    attachmentUrl: r.attachment_url ?? null,
    attachmentMimeType: r.attachment_mime_type ?? null,
    attachmentType: r.attachment_type ?? null,
    createdAt: r.created_at,
  }));
}

export async function insforgeSendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const { data, error } = await insforgeInsert("messages", {
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    body: input.body,
  });
  if (error) throw error;
  return data;
}

export async function insforgeRequestConnection(requesterId: string, addresseeId: string) {
  const { data, error } = await insforgeInsert("connections", {
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  });
  if (error) throw error;
  return { ok: true, id: data.id };
}

export async function insforgeRespondConnection(connectionId: string, userId: string, action: "accepted" | "rejected") {
  const { error } = await insforgeUpdate("connections", connectionId, {
    status: action,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { ok: true };
}

export async function insforgeCancelConnection(connectionId: string) {
  await insforgeDelete("connections", connectionId);
}

export const listConversations = insforgeListConversations;
export const getConversationForUser = insforgeGetConversationForUser;
export const listMessages = insforgeListMessages;
export const sendMessage = insforgeSendMessage;
export const requestConnection = insforgeRequestConnection;
export const cancelConnection = insforgeCancelConnection;
export const respondToConnection = insforgeRespondConnection;
export async function getOrCreateConversation(userId: string, otherUserId: string) {
  const { data } = await insforgeSelectMany("conversations", { participant_ids: `cs.{${userId}}`, conversation_type: "eq.connection" });
  const existing = data.find((row: any) => Array.isArray(row.participant_ids) && row.participant_ids.includes(otherUserId));
  if (existing) return existing;
  const { data: created, error } = await insforgeInsert("conversations", { participant_ids: [userId, otherUserId], conversation_type: "connection" });
  if (error) throw error;
  return created;
}
export async function listPendingRequests(userId: string) {
  const { data } = await insforgeSelectMany("connections", { addressee_id: `eq.${userId}`, status: "eq.pending", order: "created_at.desc" });
  return data.map((row: any) => ({ id: row.id, requesterId: row.requester_id, addresseeId: row.addressee_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
}
export async function listSentRequests(userId: string) {
  const { data } = await insforgeSelectMany("connections", { requester_id: `eq.${userId}`, status: "eq.pending", order: "created_at.desc" });
  return data.map((row: any) => ({ id: row.id, requesterId: row.requester_id, addresseeId: row.addressee_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
}
export async function listIncomingRequests(userId: string) {
  const { data } = await insforgeSelectMany("connections", { addressee_id: `eq.${userId}`, status: "eq.pending", order: "created_at.desc" });
  return data.map((row: any) => ({ id: row.id, requesterId: row.requester_id, addresseeId: row.addressee_id, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
}
