"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import type { Message } from "@/types/community";
import { relativeTime } from "@/lib/utils";
import { deleteMessageForMeAction, deleteOwnMessageAction, editOwnMessageAction, toggleMessageReactionAction } from "@/features/account/actions";
import type { PublicUser } from "@/types/auth";
import { Spinner } from "@/components/ui/spinner";

type ForwardTarget = Pick<PublicUser, "id" | "username" | "fullName">;
type RenderMessage = Message & { deliveryState?: "sending"; optimisticAttachmentType?: "image" | "audio" | null };
const REACTION_CHOICES = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function RealtimeMessageList({ conversationId, viewerId, participantId, initialMessages, forwardTargets = [], onForward }: { conversationId: string; viewerId: string; participantId: string; initialMessages: Message[]; forwardTargets?: ForwardTarget[]; onForward?: (message: Message, target: ForwardTarget) => Promise<void> }) {
  const [messages, setMessages] = useState<RenderMessage[]>(initialMessages);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [mediaErrors, setMediaErrors] = useState<Record<string, boolean>>({});
  const [retryMedia, setRetryMedia] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [forwardingId, setForwardingId] = useState<string | null>(null);
  const [touchMenuMessageId, setTouchMenuMessageId] = useState<string | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [customReaction, setCustomReaction] = useState("");
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTriggered = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cancelTouchTimer = () => { if (touchTimer.current) clearTimeout(touchTimer.current); touchTimer.current = null; };
  useEffect(() => () => { if (touchTimer.current) clearTimeout(touchTimer.current); }, []);
  const addMessage = useCallback((message: RenderMessage) => setMessages((current) => {
    const existing = current.findIndex((item) => item.id === message.id);
    if (existing < 0) return [...current, message];
    return current.map((item, index) => index === existing ? { ...item, ...message } : item);
  }), []);
  useEffect(() => {
    const handleSent = (event: Event) => {
      const detail = (event as CustomEvent<RenderMessage & { clientMessageId?: string }>).detail;
      if (detail?.conversationId !== conversationId) return;
      if (!detail.clientMessageId) {
        addMessage(detail);
        return;
      }
      setMessages((current) => [...current.filter((item) => item.id !== detail.clientMessageId && item.id !== detail.id), detail]);
    };
    const handleOptimistic = (event: Event) => {
      const message = (event as CustomEvent<RenderMessage>).detail;
      if (message?.conversationId === conversationId) addMessage(message);
    };
    const handleSendFailed = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; conversationId: string }>).detail;
      if (detail?.conversationId === conversationId) setMessages((current) => current.filter((item) => item.id !== detail.id));
    };
    window.addEventListener("chat-message-optimistic", handleOptimistic);
    window.addEventListener("chat-message-sent", handleSent);
    window.addEventListener("chat-message-received", handleSent);
    window.addEventListener("chat-message-send-failed", handleSendFailed);
    return () => {
      window.removeEventListener("chat-message-optimistic", handleOptimistic);
      window.removeEventListener("chat-message-sent", handleSent);
      window.removeEventListener("chat-message-received", handleSent);
      window.removeEventListener("chat-message-send-failed", handleSendFailed);
    };
  }, [conversationId, addMessage]);
  useEffect(() => {
    const update = (event: Event) => {
      const message = (event as CustomEvent<Message>).detail;
      if (message?.conversationId === conversationId) setMessages((current) => current.map((item) => item.id === message.id ? { ...item, ...message } : item));
    };
    const remove = (event: Event) => {
      const message = (event as CustomEvent<Message>).detail;
      if (message?.conversationId === conversationId) setMessages((current) => current.filter((item) => item.id !== message.id));
    };
    window.addEventListener("chat-message-updated", update);
    window.addEventListener("chat-message-deleted", remove);
    return () => { window.removeEventListener("chat-message-updated", update); window.removeEventListener("chat-message-deleted", remove); };
  }, [conversationId]);
  useEffect(() => {
    if (!menu && !touchMenuMessageId) return;
    const dismiss = () => {
      setMenu(null);
      setTouchMenuMessageId(null);
      setForwardingId(null);
    };
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && (menuRef.current?.contains(event.target) || (event.target instanceof Element && event.target.closest('[aria-label="Message options"]')))) return;
      dismiss();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("pointerdown", dismissOutside);
    window.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("pointerdown", dismissOutside);
      window.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [menu, touchMenuMessageId]);
  useLayoutEffect(() => {
    if (!menu) return;
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(8, Math.min(menu.x, window.innerWidth - rect.width - 8));
    const y = Math.max(8, Math.min(menu.y, window.innerHeight - rect.height - 8));
    if (x !== menu.x || y !== menu.y) setMenu({ ...menu, x, y });
  }, [menu, forwardingId]);
  useEffect(() => {
    let active = true;
    const client = getInsForgeBrowserClient();
    const refresh = async () => {
      if (!active || document.visibilityState !== "visible") return;
      const { data, error } = await client.database.from("messages").select("id,conversation_id,sender_id,body,attachment_key,attachment_url,attachment_mime_type,attachment_type,created_at,read_by,delivered_to,edited_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error || !active) return;
      const current = (data ?? []).map((row: any) => ({ id: row.id, conversationId: row.conversation_id, senderId: row.sender_id, body: row.body, attachmentKey: row.attachment_key ?? null, attachmentUrl: row.attachment_url ?? null, attachmentMimeType: row.attachment_mime_type ?? null, attachmentType: row.attachment_type ?? null, replyToMessageId: row.reply_to_message_id ?? null, reactions: row.reactions ?? [], createdAt: row.created_at, readBy: row.read_by ?? [], deliveredTo: row.delivered_to ?? [], editedAt: row.edited_at ?? null }));
      setMessages((existing) => [
        ...current,
        ...existing.filter((message) => message.deliveryState === "sending" && !current.some((loaded) => loaded.id === message.id)),
      ]);
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [conversationId]);
  useEffect(() => {
    let active = true;
    const client = getInsForgeBrowserClient();
    const keys = messages.filter((message) => message.attachmentKey).map((message) => message.attachmentKey!);
    const unresolvedKeys = [...new Set(keys)].filter((key) => !mediaUrls[key]);
    if (!unresolvedKeys.length) return () => { active = false; };
    void Promise.all(unresolvedKeys.map(async (key) => {
      try {
        const { data, error } = await client.storage.from("record-attachments").createSignedUrl(key, 3600);
        return data?.signedUrl ? { key, url: data.signedUrl } : { key, failed: Boolean(error) };
      } catch {
        return { key, failed: true };
      }
    })).then((results) => {
      if (!active) return;
      setMediaUrls((current) => ({ ...current, ...Object.fromEntries(results.filter((result): result is { key: string; url: string } => "url" in result).map(({ key, url }) => [key, url])) }));
      setMediaErrors((current) => ({ ...current, ...Object.fromEntries(results.filter((result) => "failed" in result && result.failed).map(({ key }) => [key, true])) }));
    });
    return () => { active = false; };
  }, [messages, mediaUrls, retryMedia]);
  return <div className="space-y-3 pr-1" aria-live="polite">
    {messages.length === 0 && <p className="text-sm text-slate-600">No messages yet. Say hello!</p>}
    {actionError && <p role="alert" className="text-xs text-red-700">{actionError}</p>}
    {messages.map((message) => {
      const mine = message.senderId === viewerId;
      const media = message.attachmentKey ? mediaUrls[message.attachmentKey] : null;
      const menuOpen = menu?.messageId === message.id || touchMenuMessageId === message.id;
      const openMenuAt = (x: number, y: number) => { setMenu({ messageId: message.id, x: Math.max(8, x), y: Math.max(8, y) }); setTouchMenuMessageId(message.id); setForwardingId(null); };
      const replyTarget = message.replyToMessageId ? messages.find((candidate) => candidate.id === message.replyToMessageId) : null;
      const groupedReactions = Object.entries((message.reactions ?? []).reduce<Record<string, string[]>>((groups, reaction) => { (groups[reaction.emoji] ??= []).push(reaction.userId); return groups; }, {}));
      return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"} ${message.deliveryState ? "message-enter" : ""}`}><div onContextMenu={(event) => { if (message.deliveryState) return; event.preventDefault(); openMenuAt(event.clientX, event.clientY); }} onTouchStart={(event) => { if (message.deliveryState) return; touchTriggered.current = false; const touch = event.touches[0]; if (!touch) return; const x = touch.clientX; const y = touch.clientY; cancelTouchTimer(); touchTimer.current = setTimeout(() => { touchTriggered.current = true; openMenuAt(x, y); }, 550); }} onTouchMove={cancelTouchTimer} onTouchEnd={cancelTouchTimer} onTouchCancel={cancelTouchTimer} onClick={(event) => { if (touchTriggered.current) { event.preventDefault(); event.stopPropagation(); touchTriggered.current = false; } }} className={`relative max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"} ${message.deliveryState ? "opacity-80" : ""}`}>
        <button type="button" disabled={Boolean(message.deliveryState)} aria-label="Message options" title="Message options" aria-haspopup="menu" aria-expanded={menuOpen} onPointerDown={(event) => { event.stopPropagation(); }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (menuOpen) { setMenu(null); setTouchMenuMessageId(null); setForwardingId(null); return; } const rect = event.currentTarget.getBoundingClientRect(); openMenuAt(Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)), rect.bottom + 6); }} className={`absolute -top-3 ${mine ? "right-2" : "right-2"} z-30 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-lg leading-none text-slate-600 shadow-md transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-40`}>⋯</button>
        <button type="button" disabled={Boolean(message.deliveryState) || pendingMessage === message.id} aria-label="React to message" title="React to message" aria-expanded={reactionPickerMessageId === message.id} onClick={(event) => { event.stopPropagation(); setReactionPickerMessageId((current) => current === message.id ? null : message.id); }} className="absolute -top-3 right-11 z-20 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-base text-slate-600 shadow-md transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-40">☺</button>
        {reactionPickerMessageId === message.id && <div role="group" aria-label="Choose a message reaction" className="absolute -top-12 right-2 z-30 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg" onClick={(event) => event.stopPropagation()}>{REACTION_CHOICES.map((emoji) => <button key={emoji} type="button" aria-label={`React ${emoji}`} disabled={pendingMessage === message.id} onClick={async () => { setPendingMessage(message.id); setActionError(""); const result = await toggleMessageReactionAction(message.id, emoji); if (result.ok && result.reactions) { const updated = { ...message, reactions: result.reactions }; setMessages((current) => current.map((item) => item.id === message.id ? updated : item)); window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: updated })); setReactionPickerMessageId(null); } else setActionError(result.error || "Could not save reaction."); setPendingMessage(null); }} className="grid h-8 w-8 place-items-center rounded-full text-lg transition hover:scale-110 hover:bg-violet-50 disabled:opacity-40">{emoji}</button>)}</div>}
        {replyTarget && <div className={`mb-2 rounded-lg border-l-2 px-2 py-1 text-xs ${mine ? "border-white/60 bg-white/10 text-brand-50" : "border-brand-500 bg-white/70 text-slate-600"}`}><span className="font-semibold">Reply to {replyTarget.senderId === viewerId ? "you" : "member"}</span><p className="truncate">{replyTarget.body || (replyTarget.attachmentType === "image" ? "Image" : "Voice message")}</p></div>}
        {editing === message.id ? <form className="space-y-2" onSubmit={async (event) => { event.preventDefault(); setPendingMessage(message.id); setActionError(""); const result = await editOwnMessageAction(message.id, editBody); if (result.ok && result.message) { setMessages((current) => current.map((item) => item.id === message.id ? { ...item, ...result.message } as Message : item)); setEditing(null); window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: result.message })); } else setActionError(result.error || "Could not update message."); setPendingMessage(null); }}><textarea aria-label="Edit message" className="w-full rounded-lg border border-white/30 bg-white/10 p-2 text-sm text-inherit" value={editBody} onChange={(event) => setEditBody(event.target.value)} maxLength={2000} /><div className="flex gap-2"><button disabled={pendingMessage === message.id} className="text-xs font-semibold underline">Save</button><button type="button" onClick={() => setEditing(null)} className="text-xs underline">Cancel</button></div></form> : message.body && <p className="whitespace-pre-line">{message.body}</p>}
        {message.deliveryState === "sending" && message.optimisticAttachmentType && <p className="mt-1 text-xs opacity-75">Sending {message.optimisticAttachmentType}…</p>}
        {media && message.attachmentType === "image" && <img src={media} alt="Image shared in chat" className="mt-2 max-h-72 max-w-full rounded-lg object-contain" />}
        {media && message.attachmentType === "audio" && <audio src={media} controls className="mt-2 max-w-full" aria-label="Voice message" />}
        {message.attachmentKey && !media && (mediaErrors[message.attachmentKey]
          ? <button type="button" onClick={() => { setMediaErrors((current) => { const next = { ...current }; delete next[message.attachmentKey!]; return next; }); setRetryMedia((value) => value + 1); }} className="mt-1 text-xs underline opacity-80">Attachment unavailable. Retry</button>
          : <p className="mt-1 text-xs opacity-70">Loading attachment…</p>)}
        <div className={`mt-1 flex items-center gap-2 text-[10px] ${mine ? "text-brand-100" : "text-slate-400"}`}><span>{relativeTime(message.createdAt)}{message.editedAt ? " · Edited" : ""}</span>{mine && <span className="inline-flex items-center gap-1 font-medium">{message.deliveryState === "sending" ? <><Spinner className="h-3 w-3 border" /> Sending…</> : message.readBy?.includes(participantId) ? "Seen" : message.deliveredTo?.includes(participantId) ? "Delivered" : "Sent"}</span>}</div>
        {groupedReactions.length > 0 && <div className="mt-1 flex flex-wrap gap-1" aria-label="Message reactions">{groupedReactions.map(([emoji, userIds]) => <button key={emoji} type="button" title={`${userIds.length} reaction${userIds.length === 1 ? "" : "s"}`} aria-label={`${emoji}, ${userIds.length} reaction${userIds.length === 1 ? "" : "s"}`} aria-pressed={userIds.includes(viewerId)} onClick={async (event) => { event.stopPropagation(); const result = await toggleMessageReactionAction(message.id, emoji); if (result.ok && result.reactions) { const updated = { ...message, reactions: result.reactions }; setMessages((current) => current.map((item) => item.id === message.id ? updated : item)); window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: updated })); } else setActionError(result.error || "Could not save reaction."); }} className={`rounded-full border px-1.5 py-0.5 text-xs ${userIds.includes(viewerId) ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-white/80"}`}>{emoji} {userIds.length}</button>)}</div>}
        {menuOpen && menu && createPortal(<div ref={menuRef} role="menu" aria-label="Message actions" onClick={(event) => event.stopPropagation()} className="fixed z-[1000] max-h-[80vh] min-w-52 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl" style={{ left: menu.x, top: menu.y }}>
          {!forwardingId ? <>
            <div className="border-b border-slate-100 px-2 pb-1.5"><p className="px-1 py-1 text-xs font-medium text-slate-500">React</p><div className="flex justify-between gap-1">{REACTION_CHOICES.map((emoji) => <button key={emoji} type="button" aria-label={`React ${emoji}`} disabled={pendingMessage === message.id} onClick={async () => { setPendingMessage(message.id); setActionError(""); const result = await toggleMessageReactionAction(message.id, emoji); if (result.ok && result.reactions) { const updated = { ...message, reactions: result.reactions }; setMessages((current) => current.map((item) => item.id === message.id ? updated : item)); window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: updated })); setMenu(null); setTouchMenuMessageId(null); } else setActionError(result.error || "Could not save reaction."); setPendingMessage(null); }} className="rounded-lg px-1.5 py-1 text-lg hover:bg-slate-100 disabled:opacity-50">{emoji}</button>)}</div></div><form className="border-b border-slate-100 px-2 py-2" onSubmit={async (event) => { event.preventDefault(); const emoji = customReaction.trim(); if (!emoji) return; setPendingMessage(message.id); setActionError(""); const result = await toggleMessageReactionAction(message.id, emoji); if (result.ok && result.reactions) { const updated = { ...message, reactions: result.reactions }; setMessages((current) => current.map((item) => item.id === message.id ? updated : item)); window.dispatchEvent(new CustomEvent("chat-message-updated", { detail: updated })); setCustomReaction(""); setMenu(null); setTouchMenuMessageId(null); } else setActionError(result.error || "Could not save reaction."); setPendingMessage(null); }}><label className="mb-1 block px-1 text-xs text-slate-500" htmlFor={`custom-reaction-${message.id}`}>More emoji (type or paste)</label><div className="flex gap-1"><input id={`custom-reaction-${message.id}`} value={customReaction} onChange={(event) => setCustomReaction(event.target.value)} maxLength={16} placeholder="Type emoji 😀" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400" /><button type="submit" disabled={!customReaction.trim() || pendingMessage === message.id} className="rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50">React</button></div></form>
            {mine && message.body?.trim() && <button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={() => { setEditBody(message.body); setEditing(message.id); setActionError(""); setMenu(null); setTouchMenuMessageId(null); }}>Edit message</button>}
            {mine && <button type="button" role="menuitem" disabled={pendingMessage === message.id} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50" onClick={async () => { if (!window.confirm("Delete this message for everyone? This cannot be undone.")) return; setPendingMessage(message.id); setActionError(""); const result = await deleteOwnMessageAction(message.id); if (result.ok) { setMessages((current) => current.filter((item) => item.id !== message.id)); window.dispatchEvent(new CustomEvent("chat-message-deleted", { detail: message })); } else setActionError(result.error || "Could not delete message for everyone."); setPendingMessage(null); setMenu(null); setTouchMenuMessageId(null); }}>Delete for everyone</button>}
            <button type="button" role="menuitem" disabled={pendingMessage === message.id} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50" onClick={async () => { setPendingMessage(message.id); setActionError(""); const result = await deleteMessageForMeAction(message.id); if (result.ok) { setMessages((current) => current.filter((item) => item.id !== message.id)); window.dispatchEvent(new CustomEvent("chat-message-deleted", { detail: message })); } else setActionError(result.error || "Could not delete message for you."); setPendingMessage(null); setMenu(null); setTouchMenuMessageId(null); }}>Delete for me</button>
            <button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={() => { window.dispatchEvent(new CustomEvent("chat-reply-requested", { detail: { conversationId, messageId: message.id, senderName: mine ? "yourself" : "this member", body: message.body || (message.attachmentType === "image" ? "Image" : "Voice message") } })); setMenu(null); setTouchMenuMessageId(null); }}>Reply</button>
            <button type="button" role="menuitem" disabled={(!message.body?.trim() && !message.attachmentKey) || !forwardTargets.length || !onForward} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setForwardingId(message.id)}>Forward</button>
          </> : <><div className="px-3 py-2 text-xs font-semibold text-slate-500">Forward to…</div><button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-100" onClick={() => setForwardingId(null)}>← Back</button>{forwardTargets.map((target) => <button key={target.id} type="button" disabled={pendingMessage === message.id} role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-50" onClick={async () => { if (!onForward) return; setPendingMessage(message.id); setActionError(""); try { await onForward(message, target); setMenu(null); setTouchMenuMessageId(null); } catch (error) { setActionError(error instanceof Error ? error.message : "Could not forward message."); } finally { setPendingMessage(null); } }}>{target.fullName}</button>)}</>}
          </div>, document.body)}
      </div></div>;
    })}
  </div>;
}
