"use client";
import { useEffect, useRef } from "react";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import type { Message } from "@/types/community";

export function useRealtimeConversation(conversationId: string, onMessage: (message: Message) => void) {
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    const client = getInsForgeBrowserClient();
    const channel = `chat:${conversationId}`;
    let active = true;
    const subscribe = async () => {
      try {
        // subscribe() connects automatically and preserves this subscription
        // across socket reconnects; manually subscribing on `connect` races it.
        const result = await client.realtime.subscribe(channel) as { ok?: boolean; error?: { message?: string } };
        if (active && result.ok === false) {
          console.error(`Realtime subscription failed for ${channel}:`, result.error?.message);
        }
      } catch (error) {
        if (active) console.error(`Realtime subscription failed for ${channel}:`, error);
      }
    };
    const handler = (event: any, operation?: "UPDATE" | "DELETE") => {
      const candidates: any[] = [];
      const visited = new Set<object>();
      const collect = (value: any, depth = 0) => {
        if (!value || typeof value !== "object" || visited.has(value) || depth > 5) return;
        visited.add(value);
        candidates.push(value);
        for (const key of ["payload", "data", "message", "record", "new", "row"]) collect(value[key], depth + 1);
      };
      collect(event);
      const row = candidates.find((candidate) =>
        (candidate?.conversation_id ?? candidate?.conversationId) === conversationId && candidate?.id,
      );
      const eventChannel = candidates.map((candidate) => candidate?.meta?.channel ?? candidate?.channel).find(Boolean);
      if ((eventChannel && eventChannel !== channel) || !row) return;
      const message: Message = {
        id: row.id,
        conversationId: row.conversation_id ?? row.conversationId,
        senderId: row.sender_id ?? row.senderId,
        body: row.body,
        attachmentKey: row.attachment_key ?? row.attachmentKey ?? null,
        attachmentUrl: row.attachment_url ?? row.attachmentUrl ?? null,
        attachmentMimeType: row.attachment_mime_type ?? row.attachmentMimeType ?? null,
        attachmentType: row.attachment_type ?? row.attachmentType ?? null,
        replyToMessageId: row.reply_to_message_id ?? row.replyToMessageId ?? null,
        reactions: row.reactions ?? [],
        createdAt: row.created_at ?? row.createdAt,
        readBy: row.read_by ?? row.readBy ?? [],
        deliveredTo: row.delivered_to ?? row.deliveredTo ?? [],
        editedAt: row.edited_at ?? row.editedAt ?? null,
      };
      if (operation === "DELETE") window.dispatchEvent(new CustomEvent("chat-message-deleted", { detail: message }));
      else {
        onMessageRef.current(message);
        if (operation === "UPDATE") window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: message }));
      }
    };
    const updateHandler = (event: any) => handler(event, "UPDATE");
    const deleteHandler = (event: any) => handler(event, "DELETE");
    client.realtime.on("new_message", handler);
    client.realtime.on("message_updated", updateHandler);
    client.realtime.on("message_deleted", deleteHandler);
    void subscribe();
    return () => {
      active = false;
      client.realtime.off("new_message", handler);
      client.realtime.off("message_updated", updateHandler);
      client.realtime.off("message_deleted", deleteHandler);
      client.realtime.unsubscribe(channel);
    };
  }, [conversationId]);
}
