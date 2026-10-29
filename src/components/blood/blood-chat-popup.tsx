"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeConversation } from "@/components/messaging/use-realtime-conversation";
import { Icon } from "@/components/ui/icons"; import {
getBloodChatMessagesAction,
sendBloodChatMessageAction,
startBloodChatAction, } from "@/features/blood/actions"; import type { Message } from "@/types/community";
export function BloodChatLauncher({
targetType,
targetId,
viewerId,
recipientName, }: {
targetType: "donor" | "request";
targetId: string;
viewerId: string;
recipientName: string; }) {
const [conversationId, setConversationId] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [pending, setPending] = useState(false);
const openChat = async () => {
setPending(true);
setError(null);
try {
const result = await startBloodChatAction(targetType, targetId);
if (!result.conversationId) {
setError(result.error ?? "Could not open this chat.");
return;
}
setConversationId(result.conversationId);
} catch (cause) {
setError(cause instanceof Error ? cause.message : "Could not open this chat.");
} finally {
setPending(false);
}
};
return (
<>
<button
type="button"
onClick={openChat}
disabled={pending}
className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-800 hover:bg-brand-50 disabled:opacity-60"
>
<Icon name="message" className="h-3.5 w-3.5" />
{pending ? "Opening…" : "Chat"}
</button>
{error && <p role="alert" className="mt-2 text-xs text-accent-600">{error}</p>}
{conversationId && (
<BloodChatPopup
conversationId={conversationId}
viewerId={viewerId}
recipientName={recipientName}
onClose={() => setConversationId(null)}
/>
)}
</>
); }
function BloodChatPopup({
conversationId,
viewerId,
recipientName,
onClose, }: {
conversationId: string;
viewerId: string;
recipientName: string;
onClose: () => void; }) {
const [messages, setMessages] = useState<Message[]>([]);
const [body, setBody] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
const endOfMessages = useRef<HTMLDivElement>(null);
const addMessage = useCallback((message: Message) => setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]), []);
useRealtimeConversation(conversationId, addMessage);
const refreshMessages = useCallback(async () => {
const result = await getBloodChatMessagesAction(conversationId);
if (result.error) {
setError(result.error);
setLoading(false);
return;
}
setMessages((current) => {
const merged = [...current];
for (const message of result.messages ?? []) if (!merged.some((item) => item.id === message.id)) merged.push(message);
return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
});
setError(null);
setLoading(false);
}, [conversationId]);
useEffect(() => {
let active = true;
const refresh = async () => {
try {
if (!active) return;
await refreshMessages();
} catch (cause) {
if (active) {
setError(cause instanceof Error ? cause.message : "Could not load messages.");
setLoading(false);
}
}
};
void refresh();
return () => {
active = false;
};
}, [refreshMessages]);
useEffect(() => {
endOfMessages.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
const send = async (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();
const text = body.trim();
if (!text || sending) return;
setSending(true);
setError(null);
try {
const result = await sendBloodChatMessageAction(conversationId, text);
if (!result.message) {
setError(result.error ?? "Could not send your message.");
return;
}
setMessages((current) =>
current.some((message) => message.id === result.message?.id)
? current
: [...current, result.message!]
);
setBody("");
} catch (cause) {
setError(cause instanceof Error ? cause.message : "Could not send your message.");
} finally {
setSending(false);
}
};
return (
<section
aria-label={`Chat with ${recipientName}`}
className="fixed bottom-4 right-4 z-50 flex h-[min(32rem,calc(100dvh-2rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
>
<header className="flex items-center justify-between bg-brand-800 px-4 py-3 text-white">
<div className="min-w-0">
<p className="truncate text-sm font-semibold">{recipientName}</p>
<p className="text-xs text-brand-100">Blood donation chat</p>
</div>
<button
type="button"
onClick={onClose}
aria-label="Close chat"
className="rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
>
<Icon name="close" className="h-4 w-4" />
</button>
</header>
<div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
{loading && <p className="text-center text-sm text-slate-500">Loading messages…</p>}
{!loading && messages.length === 0 && (
<p className="text-center text-sm text-slate-500">No messages yet. Say hello.</p>
)}
{messages.map((message) => {
const mine = message.senderId === viewerId;
return (
<div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
<p
className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${                   mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"                 }`}
>
{message.body}
</p>
</div>
);
})}
<div ref={endOfMessages} />
</div>
{error && <p role="alert" className="px-4 pb-2 text-xs text-accent-600">{error}</p>}
<form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3">
<input
value={body}
onChange={(event) => setBody(event.target.value)}
maxLength={2000}
aria-label="Message"
placeholder="Write a message…"
className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
/>
<button
type="submit"
disabled={sending || !body.trim()}
className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
>
{sending ? "…" : "Send"}
</button>
</form>
</section>
); }
