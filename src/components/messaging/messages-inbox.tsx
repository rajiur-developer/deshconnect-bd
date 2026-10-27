"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import type { PublicUser } from "@/types/auth";
import type { Message } from "@/types/community";
import { markConversationMessagesReadAction, openConversationAction, sendMessageAction } from "@/features/account/actions";
import { MessageForm } from "@/components/account/account-forms";
import { RealtimeMessageList } from "@/components/messaging/realtime-message-list";
import { UnreadMessageBadge, type UnreadConversation } from "@/components/messaging/message-realtime-notifications";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Icon } from "@/components/ui/icons";

type Member = Pick<PublicUser, "id" | "username" | "fullName" | "avatar" | "avatarKey">;
type Chat = { id: string; member: Member };
type MessagePreview = { id: string; conversationId: string; senderId: string; body: string; attachmentType: "image" | "audio" | null; createdAt: string };
export function MessagesInbox({ userId, chats, initialUsername, initialUnreadMessages = [], initialPreviews = [] }: { userId: string; chats: Chat[]; initialUsername?: string; initialUnreadMessages?: UnreadConversation[]; initialPreviews?: MessagePreview[] }) {
  const [chatList, setChatList] = useState(chats);
  const [active, setActive] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewByConversation, setPreviewByConversation] = useState<Record<string, MessagePreview>>(() => Object.fromEntries(initialPreviews.map((preview) => [preview.conversationId, preview])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [listFilter, setListFilter] = useState<"all" | "unread">("all");
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>(() => Object.fromEntries(initialUnreadMessages.map(({ conversationId, count }) => [conversationId, count])));
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    setPortalTarget(document.body);
    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
    const media = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }
    try {
      setNotificationError("");
      setNotificationPermission(await Notification.requestPermission());
    } catch (cause) {
      console.error("Could not enable browser message notifications:", cause);
      setNotificationError("Could not enable browser notifications. Check your browser settings.");
    }
  }

  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add("mobile-chat-open");
    return () => document.documentElement.classList.remove("mobile-chat-open");
  }, [active]);

  useEffect(() => setChatList(chats), [chats]);
  useEffect(() => setPreviewByConversation(Object.fromEntries(initialPreviews.map((preview) => [preview.conversationId, preview]))), [initialPreviews]);
  useEffect(() => {
    setUnreadByConversation((current) => ({ ...Object.fromEntries(initialUnreadMessages.map(({ conversationId, count }) => [conversationId, count])), ...current }));
  }, [initialUnreadMessages]);

  useEffect(() => {
    const handleUnreadChange = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string; unreadCount: number | null }>).detail;
      if (!detail?.conversationId) return;
      if (detail.unreadCount !== null) {
        setUnreadByConversation((current) => ({ ...current, [detail.conversationId]: Math.max(0, detail.unreadCount ?? 0) }));
        return;
      }
      if (active?.id === detail.conversationId) {
        void markConversationMessagesReadAction(detail.conversationId).then(() => {
          setUnreadByConversation((current) => ({ ...current, [detail.conversationId]: 0 }));
          window.dispatchEvent(new CustomEvent("message-unread-change", { detail: { conversationId: detail.conversationId, unreadCount: 0 } }));
        });
        return;
      }
      setUnreadByConversation((current) => ({ ...current, [detail.conversationId]: (current[detail.conversationId] ?? 0) + 1 }));
    };
    window.addEventListener("message-unread-change", handleUnreadChange);
    return () => window.removeEventListener("message-unread-change", handleUnreadChange);
  }, [active?.id]);

  useEffect(() => {
    const updatePreview = (event: Event) => {
      const message = (event as CustomEvent<MessagePreview>).detail;
      if (!message?.id || !message.conversationId) return;
      setPreviewByConversation((current) => {
        const previous = current[message.conversationId];
        if (previous && previous.createdAt > message.createdAt) return current;
        return { ...current, [message.conversationId]: message };
      });
    };
    const discoverChat = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string; memberId: string }>).detail;
      if (!detail?.conversationId || !detail.memberId) return;
      setChatList((current) => current.map((chat) => chat.member.id === detail.memberId ? { ...chat, id: detail.conversationId } : chat));
    };
    const clearDeletedPreview = (event: Event) => {
      const message = (event as CustomEvent<MessagePreview>).detail;
      if (!message?.id || !message.conversationId) return;
      setPreviewByConversation((current) => current[message.conversationId]?.id === message.id
        ? Object.fromEntries(Object.entries(current).filter(([conversationId]) => conversationId !== message.conversationId))
        : current);
    };
    window.addEventListener("chat-message-sent", updatePreview);
    window.addEventListener("chat-message-received", updatePreview);
    window.addEventListener("chat-message-updated", updatePreview);
    window.addEventListener("chat-message-deleted", clearDeletedPreview);
    window.addEventListener("chat-conversation-discovered", discoverChat);
    return () => {
      window.removeEventListener("chat-message-sent", updatePreview);
      window.removeEventListener("chat-message-received", updatePreview);
      window.removeEventListener("chat-message-updated", updatePreview);
      window.removeEventListener("chat-message-deleted", clearDeletedPreview);
      window.removeEventListener("chat-conversation-discovered", discoverChat);
    };
  }, []);

  const openChat = useCallback(async (chat: Chat) => {
    setActive({ ...chat, id: "" });
    setMessages([]);
    setError("");
    setLoading(true);
    try {
      const result = await openConversationAction(chat.member.username);
      if (!result.ok) throw new Error(result.error || "This conversation is unavailable.");
      chat = { ...chat, id: result.conversationId };
      setChatList((current) => current.map((item) => item.member.id === chat.member.id ? chat : item));
      setActive(chat);
      setMessages(result.messages as Message[]);
      setUnreadByConversation((current) => ({ ...current, [result.conversationId]: 0 }));
      window.dispatchEvent(new CustomEvent("message-unread-change", { detail: { conversationId: result.conversationId, unreadCount: 0 } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  const forwardMessage = useCallback(async (message: Message, target: Pick<Member, "id" | "username" | "fullName">) => {
    const conversation = await openConversationAction(target.username);
    if (!conversation.ok) throw new Error(conversation.error || "Could not open the recipient conversation.");
    const client = getInsForgeBrowserClient();
    let uploadedKey: string | null = null;
    try {
      let attachment: { key: string; url: string; mimeType: string; type: "image" | "audio" } | undefined;
      if (message.attachmentKey) {
        const { data: signed, error: signedError } = await client.storage.from("record-attachments").createSignedUrl(message.attachmentKey, 300);
        if (signedError || !signed?.signedUrl) throw new Error("Could not prepare the attachment for forwarding.");
        const response = await fetch(signed.signedUrl);
        if (!response.ok) throw new Error("Could not download the attachment for forwarding.");
        const blob = await response.blob();
        if (blob.size < 1 || blob.size > 5 * 1024 * 1024) throw new Error("Attachments larger than 5 MB cannot be forwarded.");
        const mimeType = message.attachmentMimeType || blob.type;
        const type = message.attachmentType;
        if (!type || !mimeType) throw new Error("The attachment type is unavailable.");
        const extension = message.attachmentKey.split(".").pop()?.toLowerCase() || (type === "image" ? "jpg" : "webm");
        const key = `${userId}/${conversation.conversationId}/${crypto.randomUUID()}.${extension}`;
        const file = new File([blob], `forwarded.${extension}`, { type: mimeType });
        const { data: uploaded, error: uploadError } = await client.storage.from("record-attachments").upload(key, file);
        if (uploadError) throw new Error(uploadError.message || "Could not upload the forwarded attachment.");
        uploadedKey = key;
        if (!uploaded?.url) throw new Error("The attachment uploaded, but its link could not be saved.");
        attachment = { key, url: uploaded.url, mimeType, type };
      }
      const body = message.body.trim() ? `Forwarded message:\n\n${message.body.trim()}` : message.attachmentType === "image" ? "Forwarded image" : "Forwarded voice message";
      const result = await sendMessageAction(conversation.conversationId, body, attachment);
      if (!result.ok || !result.message) throw new Error(result.error || "Could not forward this message.");
      window.dispatchEvent(new CustomEvent("chat-message-sent", { detail: result.message }));
      uploadedKey = null;
    } finally {
      if (uploadedKey) await client.storage.from("record-attachments").remove(uploadedKey);
    }
  }, [userId]);

  useEffect(() => {
    const target = initialUsername ? chats.find((chat) => chat.member.username === initialUsername) : undefined;
    if (target) void openChat(target);
  }, [chats, initialUsername, openChat]);

  const visibleChats = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return chatList
      .filter((chat) => !query || chat.member.fullName.toLocaleLowerCase().includes(query) || chat.member.username.toLocaleLowerCase().includes(query))
      .filter((chat) => listFilter === "all" || (chat.id ? (unreadByConversation[chat.id] ?? 0) > 0 : false))
      .sort((a, b) => {
        const aUnread = a.id ? unreadByConversation[a.id] ?? 0 : 0;
        const bUnread = b.id ? unreadByConversation[b.id] ?? 0 : 0;
        if (bUnread !== aUnread) return bUnread - aUnread;
        const aTime = a.id ? previewByConversation[a.id]?.createdAt ?? "" : "";
        const bTime = b.id ? previewByConversation[b.id]?.createdAt ?? "" : "";
        return bTime.localeCompare(aTime);
      });
  }, [chatList, searchQuery, listFilter, unreadByConversation, previewByConversation]);

  const conversationContent = active ? <>
    <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
      <ProfileAvatar name={active.member.fullName} src={active.member.avatar} storageKey={active.member.avatarKey} className="h-11 w-11" textClassName="text-sm" />
      <h2 className="min-w-0 flex-1 truncate font-semibold text-slate-900">{active.member.fullName}</h2>
      <Link href={`/profile/${active.member.username}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">View profile</Link>
      <button type="button" onClick={() => setActive(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-ring" aria-label="Close conversation">
        <Icon name="close" className="h-4 w-4" />
      </button>
    </header>
    <div className="chat-message-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p> : loading ? <div className="flex h-full min-h-56 flex-col items-center justify-center gap-4 px-4 py-10" role="status" aria-live="polite" aria-label="Loading conversation"><span className="relative grid h-16 w-16 place-items-center"><span className="absolute inset-0 animate-ping rounded-full bg-violet-400/20"></span><span className="absolute inset-1 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600 border-r-cyan-500"></span><span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25"><Icon name="message-circle" className="h-5 w-5" /></span></span><div className="text-center"><p className="text-sm font-semibold text-slate-800">Opening your chat</p><p className="mt-1 text-xs text-slate-500">Getting your messages ready…</p></div><span className="flex items-center gap-1" aria-hidden="true"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]"></span><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]"></span><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500"></span></span></div> : active.id ? <RealtimeMessageList key={active.id} conversationId={active.id} viewerId={userId} participantId={active.member.id} initialMessages={messages} forwardTargets={chats.filter((chat) => chat.member.id !== active.member.id).map(({ member }) => ({ id: member.id, username: member.username, fullName: member.fullName }))} onForward={forwardMessage} /> : <p className="text-sm text-slate-500">Say hello to start this conversation.</p>}</div>
    {!loading && !error && active.id && <div className="chat-composer shrink-0 border-t border-slate-100 bg-white p-4"><MessageForm conversationId={active.id} viewerId={userId} /></div>}
  </> : <div className="grid flex-1 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700" aria-hidden="true">✉</span><p className="mt-3 font-medium text-slate-800">Your messages</p><p className="mt-1 text-sm text-slate-500">Select a friend to open your inbox.</p></div></div>;

  return <>
  <div className="h-[min(70vh,42rem)] min-h-[30rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
    <aside className={`flex h-full min-h-0 flex-col overflow-hidden md:border-r md:border-slate-200 ${active ? "hidden md:flex" : ""}`} aria-label="Friends">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between gap-2"><div><h2 className="font-semibold text-slate-900">Messages</h2><p className="mt-1 text-xs text-slate-500">Your conversations</p></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{chatList.length}</span></div>
        <label className="relative mt-3 block"><span className="sr-only">Search conversations</span><Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search people…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" /></label>
        <div className="mt-3 flex gap-2" aria-label="Conversation filters"><button type="button" onClick={() => setListFilter("all")} aria-pressed={listFilter === "all"} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${listFilter === "all" ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button><button type="button" onClick={() => setListFilter("unread")} aria-pressed={listFilter === "unread"} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${listFilter === "unread" ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Unread</button></div>
        {notificationPermission === "default" && <button type="button" onClick={() => void enableBrowserNotifications()} className="mt-2 text-xs font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900">Enable browser notifications</button>}
        {notificationPermission === "granted" && <p className="mt-2 text-xs text-emerald-700" role="status">Browser notifications enabled</p>}
        {notificationPermission === "denied" && <p className="mt-2 text-xs text-slate-500">Allow notifications in your browser settings.</p>}
        {notificationError && <p className="mt-2 text-xs text-red-700" role="alert">{notificationError}</p>}
      </div>
      {chatList.length > 0 && <div className="shrink-0 border-b border-slate-100 px-3 py-3 md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Quick access to friends">
          {chatList.map((chat) => <button key={chat.member.id} type="button" onClick={() => void openChat(chat)} className="flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-lg p-1 text-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600" aria-label={`Message ${chat.member.fullName}`}>
            <ProfileAvatar name={chat.member.fullName} src={chat.member.avatar} storageKey={chat.member.avatarKey} className="h-12 w-12" textClassName="text-sm" />
            <span className="w-full truncate text-[11px] text-slate-600">{chat.member.fullName}</span>
          </button>)}
        </div>
      </div>}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {chatList.length ? visibleChats.length ? visibleChats.map((chat) => { const preview = chat.id ? previewByConversation[chat.id] : undefined; const previewText = preview?.body?.trim() || (preview?.attachmentType === "image" ? "📷 Image" : preview?.attachmentType === "audio" ? "🎙 Voice message" : "Start a conversation"); const previewTime = preview?.createdAt ? new Date(preview.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""; return <button key={chat.member.id} type="button" onClick={() => void openChat(chat)} aria-current={active?.member.id === chat.member.id ? "true" : undefined} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${active?.member.id === chat.member.id ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50"}`}>
        <ProfileAvatar name={chat.member.fullName} src={chat.member.avatar} storageKey={chat.member.avatarKey} className="h-11 w-11" textClassName="text-sm" />
        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="block min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{chat.member.fullName}</span>{previewTime && <time className="shrink-0 text-[10px] text-slate-400">{previewTime}</time>}</span><span className="mt-1 block truncate text-xs text-slate-500">{preview ? `${preview.senderId === userId ? "You: " : ""}${previewText || "Attachment"}` : previewText}</span></span><UnreadMessageBadge count={chat.id ? unreadByConversation[chat.id] ?? 0 : 0} />
      </button>;}) : <div className="px-4 py-10 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon name="search" className="h-4 w-4" /></span><p className="mt-3 text-sm font-medium text-slate-700">{listFilter === "unread" ? "No unread messages" : "No people found"}</p><p className="mt-1 text-xs text-slate-500">{listFilter === "unread" ? "You’re all caught up." : "Try another name or username."}</p><button type="button" onClick={() => { setSearchQuery(""); setListFilter("all"); }} className="mt-3 text-xs font-semibold text-brand-700 hover:underline">Clear filters</button></div> : <div className="px-4 py-10 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700">✉</span><p className="mt-3 text-sm font-medium text-slate-800">No conversations yet</p><p className="mt-1 text-xs text-slate-500">Accepted connections will appear here.</p></div>}
      </div>
    </aside>
    <section className="hidden min-h-0 min-w-0 flex-col overflow-hidden bg-white md:flex" aria-label="Conversation">{conversationContent}</section>
  </div>
  {active && isMobile && portalTarget && createPortal(
    <section className="mobile-conversation fixed inset-x-0 bottom-0 top-16 z-30 flex min-h-0 flex-col overflow-hidden bg-white shadow-xl" aria-label="Conversation">
      {conversationContent}
    </section>,
    portalTarget
  )}
  </>;
}
