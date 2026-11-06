"use client";

import { useEffect, useRef } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import type { Message } from "@/types/community";

function toMessage(row: any): Message | null {
  if (!row?.id || !row?.conversation_id) return null;
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    attachmentKey: row.attachment_key ?? null,
    attachmentUrl: row.attachment_url ?? null,
    attachmentMimeType: row.attachment_mime_type ?? null,
    attachmentType: row.attachment_type ?? null,
    replyToMessageId: row.reply_to_message_id ?? null,
    reactions: row.reactions ?? [],
    createdAt: row.created_at,
    readBy: row.read_by ?? [],
    deliveredTo: row.delivered_to ?? [],
    editedAt: row.edited_at ?? null,
  };
}

export function useRealtimeConversation(conversationId: string, onMessage: (message: Message) => void) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    const client = getInsForgeBrowserClient();
    const channel = client
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: any) => {
        const message = toMessage(payload.new);
        if (message) onMessageRef.current(message);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: any) => {
        const message = toMessage(payload.new);
        if (message) window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: message }));
      })
      .subscribe((status: string, error?: Error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`Supabase realtime subscription failed for chat:${conversationId}`, error);
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [conversationId]);
}
