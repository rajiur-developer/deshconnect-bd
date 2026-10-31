"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icons";

type NavItem = { href: string; label: string; icon: IconName };
type NavGroup = { title: string; items: NavItem[] };

export function AdminShell({
  children,
  groups,
  role,
}: {
  children: React.ReactNode;
  groups: NavGroup[];
  role: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return groups.flatMap((group) =>
      group.items.filter((item) => item.label.toLowerCase().includes(value)),
    ).slice(0, 6);
  }, [groups, query]);

  const nav = (
    <div className="dc-admin-sidebar-inner">
      <div className="dc-admin-sidebar-brand">
        <span className="dc-admin-brand-mark"><Icon name="shield" className="h-5 w-5" /></span>
        {!collapsed && <div className="min-w-0"><p className="text-sm font-extrabold tracking-tight text-white">DeshConnect</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-200/55">Admin workspace</p></div>}
        <button type="button" onClick={() => setCollapsed((value) => !value)} className="dc-admin-collapse hidden lg:grid" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}><Icon name="chevron-down" className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} /></button>
      </div>
      <nav className="dc-admin-nav" aria-label="Admin navigation">
        {groups.map((group) => {
          const items = group.items;
          return (
            <section key={group.title} className="dc-admin-nav-group">
              {!collapsed && <p className="dc-admin-nav-heading">{group.title}</p>}
              <div className="grid gap-1">
                {items.map((item) => {
                  const [target, queryString] = item.href.split("?");
                  const queryMatches = queryString
                    ? Array.from(new URLSearchParams(queryString).entries()).every(([key, value]) => searchParams.get(key) === value)
                    : !groups.some((entry) => entry.items.some((candidate) => candidate.href.startsWith(target + "?")));
                  const active = (pathname === target && queryMatches) || (!queryString && target !== "/admin" && pathname.startsWith(target + "/"));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={`dc-admin-nav-link ${active ? "is-active" : ""} ${target.startsWith("/admin/blood") ? "is-blood" : ""} ${collapsed ? "is-collapsed" : ""}`}>
                      <Icon name={item.icon} className="h-[17px] w-[17px] shrink-0" />
                      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      {!collapsed && active && <span className="dc-admin-active-dot" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
      <div className="dc-admin-sidebar-footer">
        <Link href="/blood-donation" title={collapsed ? "Blood donation page" : undefined} className={`dc-admin-blood-link ${collapsed ? "justify-center" : ""}`}>
          <Icon name="heart" className="h-4 w-4 shrink-0" />
          {!collapsed && <><span className="flex-1">Blood donation page</span><span aria-hidden="true">↗</span></>}
        </Link>
        {!collapsed && <p className="mt-4 px-2 text-[10px] text-slate-500">Signed in as <span className="font-bold capitalize text-slate-300">{role}</span></p>}
      </div>
    </div>
  );

  return (
    <div className={`dc-admin-app min-h-[calc(100vh-4rem)] ${collapsed ? "is-sidebar-collapsed" : ""}`} data-no-translate>
      <aside className="dc-admin-sidebar-desktop hidden lg:block">{nav}</aside>
      {mobileOpen && <button type="button" aria-label="Close navigation" className="dc-admin-mobile-backdrop lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`dc-admin-sidebar-mobile lg:hidden ${mobileOpen ? "is-open" : ""}`}>{nav}</aside>

      <div className="dc-admin-main min-w-0">
        <header className="dc-admin-topbar sticky top-0 z-30">
          <div className="flex min-h-[4.5rem] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button type="button" className="dc-admin-mobile-toggle lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open admin navigation"><Icon name="menu" className="h-5 w-5" /></button>
            <div className="hidden sm:block"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p><p className="text-sm font-bold text-slate-800">Platform management</p></div>
            <div className="relative ml-auto w-full max-w-[22rem]">
              <label className="dc-admin-search">
                <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
                <input value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 140)} placeholder="Search admin pages..." aria-label="Search admin pages" />
                <kbd>⌘ K</kbd>
              </label>
              {searchOpen && query.trim() && <div className="dc-admin-search-results">{matches.length ? matches.map((item) => <Link key={item.href} href={item.href} onMouseDown={() => setSearchOpen(false)}><Icon name={item.icon} className="h-4 w-4 text-emerald-700" /><span>{item.label}</span><span className="ml-auto text-[10px] text-slate-400">Open ↗</span></Link>) : <p>No matching admin pages</p>}</div>}
            </div>
            <Link href="/admin/notifications" className="dc-admin-notification" aria-label="Open notifications" title="Notifications"><Icon name="bell" className="h-[18px] w-[18px]" /></Link>
            <Link href="/admin/news?view=requests" className="dc-admin-review hidden sm:inline-flex"><Icon name="alert" className="h-4 w-4" />Review news</Link>
            <Link href="/" className="dc-admin-visit hidden md:inline-flex"><Icon name="external" className="h-4 w-4" />Visit website</Link>
          </div>
        </header>
        <main className="dc-admin-content min-w-0 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
