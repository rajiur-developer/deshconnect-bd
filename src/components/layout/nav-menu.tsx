"use client";
import Link from "next/link"; import { useSyncExternalStore, useState } from "react"; import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icons"; import { isNavGroup, isNavPathActive, type NavEntry } from "@/config/site";
import { UnreadMessageBadge, useUnreadMessageTotal, type UnreadConversation } from "@/components/messaging/message-realtime-notifications";
const linkClass =
"block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-brand-50 hover:text-brand-700";
const subscribeToHydration = () => () => {};
const useHydratedPathname = () => useSyncExternalStore(subscribeToHydration, () => true, () => false);
/** Renders one top-level nav entry: a plain link, or a hover-triggered sub-menu. */ export function NavMenu({ entry, unreadMessages = 0, initialUnreadMessages = [] }: { entry: NavEntry; unreadMessages?: number; initialUnreadMessages?: UnreadConversation[] }) {
const [open, setOpen] = useState(false);
const routeReady = useHydratedPathname();
const pathname = usePathname();
const unreadTotal = useUnreadMessageTotal(!isNavGroup(entry) && entry.href === "/messages" ? initialUnreadMessages : []);
if (!isNavGroup(entry)) {
const isBloodDonation = entry.href === "/blood-donation";
const isActive = routeReady && isNavPathActive(pathname, entry.href);
return (
<Link
href={entry.href}
aria-current={isActive ? "page" : undefined}
className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.04] ${isBloodDonation ? `blood-nav-link text-accent-600 hover:bg-accent-50 hover:text-accent-700${isActive ? " bg-accent-50 text-accent-700" : ""}` : `text-slate-600 hover:bg-brand-50 hover:text-brand-700${isActive ? " bg-brand-50 text-brand-700" : ""}`}`}
>
{isBloodDonation && <Icon name="droplet" aria-hidden="true" className="mr-1 inline h-4 w-4" />}
{entry.label}{entry.href === "/messages" && <UnreadMessageBadge count={unreadTotal} />}
</Link>
);
}
const isGroupActive = routeReady && entry.items.some((item) => isNavPathActive(pathname, item.href));
return (
<div
className="group relative"
onMouseEnter={() => setOpen(true)}
onMouseLeave={() => setOpen(false)}
>
<button
type="button"
aria-haspopup="menu"
aria-expanded={open}
 onClick={() => setOpen((value) => !value)}
aria-current={isGroupActive ? "page" : undefined}
className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.04] hover:bg-brand-50 hover:text-brand-700 ${isGroupActive ? "bg-brand-50 text-brand-700" : "text-slate-600"}`}
>
{entry.label}
<Icon
name="chevron-down"
aria-hidden="true"
className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
/>
</button>
<div className={`dropdown-in absolute left-0 top-full z-50 w-64 pt-1 transition-[opacity,visibility] duration-150 ${open ? "visible opacity-100" : "invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"}`}>
<div className="rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
{entry.items.map((item) => {
const isActive = routeReady && isNavPathActive(pathname, item.href);
return (
<Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={isActive ? "page" : undefined} className={`${linkClass}${isActive ? " bg-brand-50 text-brand-700" : ""}`}>
{item.label}
{item.description ? (
<span className="block text-xs font-normal text-slate-500">{item.description}</span>
) : null}
</Link>
);})}
</div>
</div>
</div>
); }
