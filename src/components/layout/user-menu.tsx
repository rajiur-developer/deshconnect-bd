"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useEffect, useRef, useState } from "react";
import type { PublicUser } from "@/types/auth"; import { Icon } from "@/components/ui/icons"; import { ProfileAvatar } from "@/components/ui/profile-avatar"; import { signOutAction } from "@/features/auth/actions";
import { FormPendingButton } from "@/components/ui/form-pending-button";
const LINKS = [
{ href: "/dashboard", label: "Dashboard" },
{ href: "/profile", label: "My Profile" },
{ href: "/settings", label: "Settings" },
];
export function UserMenu({ user, unread }: { user: PublicUser; unread?: number }) {
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDetailsElement>(null);
const pathname = usePathname();
useEffect(() => {
if (ref.current) ref.current.open = false;
setOpen(false);
}, [pathname]);
useEffect(() => {
function onClick(event: MouseEvent) {
if (ref.current && !ref.current.contains(event.target as Node)) {
ref.current.open = false;
setOpen(false);
}
}
document.addEventListener("pointerdown", onClick);
return () => document.removeEventListener("pointerdown", onClick);
}, []);
const isStaff = user.role === "admin" || user.role === "moderator";
return (
<details
ref={ref}
className="user-menu-details relative"
onToggle={(event) => setOpen(event.currentTarget.open)}
>
<summary
aria-expanded={open}
aria-haspopup="menu"
className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 [&::-webkit-details-marker]:hidden"
>
<ProfileAvatar name={user.fullName} src={user.avatar} storageKey={user.avatarKey} className="h-7 w-7 text-xs" textClassName="text-xs" />
<span className="hidden max-w-[10rem] truncate sm:inline">{user.fullName}</span>
<Icon name="chevron-down" className="h-4 w-4 text-slate-400" />
</summary>
<div className="user-menu-panel absolute right-0 z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10">
<div className="border-b border-slate-100 px-4 py-3">
<p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
<p className="truncate text-xs text-slate-500">@{user.username}</p>
</div>
<div className="max-h-[70vh] overflow-y-auto p-1.5" role="menu">
{isStaff && (
<MenuLink href="/admin" label="Admin panel" onSelect={() => setOpen(false)} />
)}
{LINKS.map((link) => (
<MenuLink key={link.href} href={link.href} label={link.label} badge={link.href === "/notifications" ? unread : undefined} onSelect={() => setOpen(false)} />
))}
<form action={signOutAction} className="mt-1 border-t border-slate-100 p-1.5 pt-2">
<FormPendingButton variant="outline" pendingLabel="Logging out…" className="flex w-full items-center gap-2 border-rose-100 bg-rose-50 px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:border-rose-200 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
Logout
</FormPendingButton>
</form>
</div>
</div>
</details>
); }
function MenuLink({
href,
label,
badge,
onSelect, }: {
href: string;
label: string;
badge?: number;
onSelect: () => void; }) {
return (
<Link href={href} onClick={onSelect} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
<span>{label}</span>
{badge ? <span className="rounded-full bg-accent-500 px-1.5 text-xs font-semibold text-white">{badge}</span> : null}
</Link>
); }
