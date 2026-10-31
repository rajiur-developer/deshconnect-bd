import Link from "next/link";
import type { PublicUser } from "@/types/auth";
import { PageHeader } from "@/components/layout/page-header";
const NAV = [
{ href: "/dashboard", label: "Overview" },
{ href: "/profile", label: "My Profile" },
{ href: "/profile/edit", label: "Edit Profile" },
{ href: "/settings", label: "Settings" },
{ href: "/my-posts", label: "My Posts" },
{ href: "/my-comments", label: "My Comments" },
{ href: "/my-reviews", label: "My Reviews" },
{ href: "/my-news", label: "My News" },
{ href: "/saved", label: "Saved" },
{ href: "/messages", label: "Messages" },
{ href: "/connections", label: "Connections" },
{ href: "/friend-requests", label: "Friend Requests" },
{ href: "/notifications", label: "Notifications" },
{ href: "/my-blood-requests", label: "My Blood Requests" },
{ href: "/my-reports", label: "My Reports" },
];
export function AccountShell({
user,
title,
description,
messagesOnly = false,
minimalDashboard = false,
children,
}: {
user: PublicUser;
title: string;
description?: string;
messagesOnly?: boolean;
minimalDashboard?: boolean;
children: React.ReactNode;
}) {
const navItems = messagesOnly ? NAV.filter((item) => item.href === "/friend-requests") : NAV;
return (
<>
<PageHeader title={title} description={description} variant={messagesOnly ? "messages" : "default"} />
{minimalDashboard ? (
<div className="container-x py-5 sm:py-7">
  <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Your account</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{user.fullName || user.username}</p>
      <p className="truncate text-xs text-slate-500">@{user.username}</p>
    </div>
    <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:pb-0" aria-label="Account shortcuts">
      {[
        { href: "/profile", label: "Profile" },
        { href: "/messages", label: "Messages" },
        { href: "/saved", label: "Saved" },
        { href: "/notifications", label: "Notifications" },
        { href: "/settings", label: "Settings" },
      ].map((item) => (
        <Link key={item.href} href={item.href} className="shrink-0 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-sm">
          {item.label}
        </Link>
      ))}
    </nav>
  </div>
  <main className="min-w-0">{children}</main>
</div>
) : (
<div className={`container-x grid gap-8 py-8 ${messagesOnly ? "lg:grid-cols-[12rem_minmax(0,1fr)]" : "lg:grid-cols-4"}`}>
  <aside>
    {!messagesOnly && <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4"><p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p><p className="truncate text-xs text-slate-500">@{user.username}</p></div>}
    <nav className="rounded-2xl border border-slate-200 bg-white p-2" aria-label="Account">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} aria-current={messagesOnly && item.href === "/friend-requests" ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm ${messagesOnly ? "border border-brand-100 bg-brand-50 font-semibold text-brand-800 shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
  <div className={messagesOnly ? "min-w-0" : "lg:col-span-3"}>{children}</div>
</div>
)}
</>
);
}
