"use client";
import { useRouter } from "next/navigation"; import { useState, useTransition } from "react";
import {
cancelConnectionAction,
markAllNotificationsReadAction,
markNotificationReadAction,
requestConnectionAction,
respondConnectionAction,
} from "@/features/account/actions";
import { useLanguage } from "@/components/i18n/language-provider";
export function ConnectButton({ username, pendingConnectionId }: { username: string; pendingConnectionId?: string }) {
const { t } = useLanguage();
const [state, setState] = useState<"idle" | "sent">("idle");
const [error, setError] = useState("");
const [pending, startTransition] = useTransition();
const router = useRouter();
if (pendingConnectionId) {
return (
<button type="button" disabled className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60">
{t("Request sent")}
</button>
);
}
return (
<>
<button
type="button"
disabled={pending || state === "sent"}
onClick={() =>
startTransition(async () => {
setError("");
try {
const result = await requestConnectionAction(username);
if (result.ok) {
setState("sent");
router.refresh();
} else {
setError(result.error ?? "Could not send the request.");
}
} catch {
setError("Could not send the request. Please try again.");
}
})
}
className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
>
{state === "sent" ? t("Request sent") : pending ? t("Sending…") : t("Connect")}
</button>
{error && <p role="alert" className="basis-full text-xs text-accent-600">{t(error)}</p>}
</>
); }
export function RespondButtons({ connectionId }: { connectionId: string }) {
const { t } = useLanguage();
const [pending, startTransition] = useTransition();
const router = useRouter();
const respond = (action: "accepted" | "rejected") =>
startTransition(async () => {
const result = await respondConnectionAction(connectionId, action);
if (result.ok) router.refresh();
});
return (
<div className="flex gap-2">
<button
type="button"
disabled={pending}
onClick={() => respond("accepted")}
className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
>
{t("Accept")}
</button>
<button
type="button"
disabled={pending}
onClick={() => respond("rejected")}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
{t("Decline")}
</button>
</div>
); }
export function CancelRequestButton({ connectionId }: { connectionId: string }) {
const { t } = useLanguage();
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
const result = await cancelConnectionAction(connectionId);
if (result.ok) router.refresh();
})
}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
{t("Cancel request")}
</button>
); }
export function StartConversationButton({ username }: { username: string }) {
const { t } = useLanguage();
const [pending, startTransition] = useTransition();
const [error, setError] = useState("");
const router = useRouter();
return (
<>
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
setError("");
router.push(`/messages?to=${encodeURIComponent(username)}`);
})
}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
{t("Message")}
</button>
{error && <p role="alert" className="basis-full text-xs text-accent-600">{t(error)}</p>}
</>
); }
export function MarkAllReadButton() {
const { t } = useLanguage();
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await markAllNotificationsReadAction();
router.refresh();
})
}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
{t("Mark all as read")}
</button>
); }
export function MarkReadButton({ id }: { id: string }) {
const { t } = useLanguage();
const [pending, startTransition] = useTransition();
const router = useRouter();
return (
<button
type="button"
disabled={pending}
onClick={() =>
startTransition(async () => {
await markNotificationReadAction(id);
router.refresh();
})
}
className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
>
{t("Mark as read")}
</button>
); }
