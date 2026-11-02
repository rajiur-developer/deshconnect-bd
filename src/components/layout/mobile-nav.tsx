"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { PublicUser } from "@/types/auth";
import { isNavGroup, isNavPathActive, PRIMARY_NAV } from "@/config/site";
import { Icon } from "@/components/ui/icons";
import { UnreadMessageBadge, useUnreadMessageTotal, type UnreadConversation } from "@/components/messaging/message-realtime-notifications";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

const subscribeToHydration = () => () => {};
const PRIMARY_LINKS = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/places", label: "Place", icon: "mountain" as const },
  { href: "/government-services", label: "Services", icon: "landmark" as const },
  { href: "/blood-donation", label: "Blood Donation", icon: "droplet" as const },
  { href: "/messages", label: "Message", icon: "message" as const },
  { href: "/news", label: "News", icon: "globe" as const },
];

export function MobileNav({
  user,
  unread = 0,
  initialUnreadMessages = [],
}: {
  user: PublicUser | null;
  unread?: number;
  unreadMessages?: number;
  initialUnreadMessages?: UnreadConversation[];
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const routeReady = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const pathname = usePathname();
  const unreadTotal = useUnreadMessageTotal(initialUnreadMessages);

  const moreItems = useMemo(
    () =>
      [
        ...PRIMARY_NAV.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry])).filter(
          (item) => !["/", "/places", "/government-services", "/blood-donation", "/messages", "/news"].includes(item.href),
        ),
        { label: "Community", href: "/community" },
        { label: "Profile", href: user ? "/profile" : "/login" },
      ].filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index),
    [user],
  );

  const directIndex = routeReady
    ? PRIMARY_LINKS.findIndex((item) => isNavPathActive(pathname, item.href))
    : -1;
  const moreActive = routeReady && directIndex === -1;

  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-2 top-[10px] z-[60] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white px-1.5 py-1.5 shadow-[0_14px_44px_-14px_rgba(15,61,46,.20),0_3px_12px_-4px_rgba(15,23,42,.10)] ring-1 ring-white">
        <div className="relative grid grid-cols-7 items-stretch gap-0">

          {PRIMARY_LINKS.map((item, index) => (
            <MobileNavLink
              key={item.href}
              {...item}
              active={routeReady && directIndex === index}
              badge={item.href === "/messages" ? unreadTotal : 0}
            />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            aria-expanded={moreOpen}
            aria-controls="dc-mobile-more-menu"
            aria-label="More navigation options"
            className={`relative z-10 flex min-w-0 items-center justify-center rounded-xl px-0.5 py-2 transition-all duration-900 ease-[cubic-bezier(.25,.1,.25,1)] active:scale-[.94] motion-reduce:transition-none ${moreOpen || moreActive ? "text-violet-700" : "text-violet-600 hover:text-violet-800"}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl transition-transform duration-900 ease-[cubic-bezier(.25,.1,.25,1)] motion-reduce:transition-none ${moreOpen ? "rotate-90 scale-95" : "rotate-0 group-hover:scale-110"}`}><Icon name={moreOpen ? "close" : "menu"} className="h-[24px] w-[24px] text-violet-600" /></span>
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close more navigation"
        tabIndex={moreOpen ? 0 : -1}
        className={`fixed inset-0 -z-10 bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-200 ${moreOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMoreOpen(false)}
      />
      <div
        id="dc-mobile-more-menu"
        aria-hidden={!moreOpen}
        className={`absolute inset-x-1 top-[calc(100%+0.65rem)] z-20 mx-auto max-h-[min(65dvh,34rem)] max-w-2xl overflow-y-auto rounded-[1.35rem] border border-white/80 bg-white/95 p-3 shadow-[0_24px_70px_-20px_rgba(15,45,30,.4)] backdrop-blur-2xl ring-1 ring-slate-900/[0.04] transition-all duration-350 ease-[cubic-bezier(.16,1,.3,1)] ${moreOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-[.96] opacity-0"}`}
        style={{ visibility: moreOpen ? "visible" : "hidden" }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-bold text-slate-900">More from DeshConnect</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Explore all features</p>
          </div>
          {user && <UserMenu user={user} unread={unread} />}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {moreItems.map((item) => {
            const active = routeReady && isNavPathActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={moreOpen ? 0 : -1}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-12 items-center rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[.98] ${active ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm" : "border-slate-100 bg-slate-50/80 text-slate-700 hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50"}`}
              >
                <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <form action="/search" className="mt-3">
          <label className="sr-only" htmlFor="dc-mobile-search">Search DeshConnect</label>
          <div className="flex gap-2">
            <input
              id="dc-mobile-search"
              name="q"
              placeholder="Search DeshConnect"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              tabIndex={moreOpen ? 0 : -1}
            />
            <button type="submit" tabIndex={moreOpen ? 0 : -1} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95">
              Search
            </button>
          </div>
        </form>
        <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-3">\n          <span className="text-xs font-semibold text-slate-500">Language / ভাষা</span>\n          <LanguageSwitcher />\n        </div>\n        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
          {user ? (
            <Link href="/dashboard" tabIndex={moreOpen ? 0 : -1} className="flex-1 rounded-xl bg-emerald-700 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[.98]">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" tabIndex={moreOpen ? 0 : -1} className="flex-1 rounded-xl bg-emerald-700 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[.98]">
                Login
              </Link>
              <Link href="/register" tabIndex={moreOpen ? 0 : -1} className="flex-1 rounded-xl border border-emerald-200 px-3 py-2.5 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 active:scale-[.98]">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const iconColor: Record<MobileNavLinkIcon, string> = {
  home: "text-emerald-600",
  mountain: "text-amber-600",
  landmark: "text-blue-600",
  droplet: "text-rose-600",
  message: "text-indigo-600",
  globe: "text-sky-600",
};
type MobileNavLinkIcon = "home" | "mountain" | "landmark" | "droplet" | "message" | "globe";

function MobileNavLink({
  href,
  label,
  icon,
  active,
  badge = 0,
}: {
  href: string;
  label: string;
  icon: MobileNavLinkIcon;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={`${label}${badge > 0 ? `, ${badge} unread` : ""}`}
      className="group relative z-10 flex min-w-0 items-center justify-center rounded-xl px-0.5 py-1.5 transition-transform duration-900 ease-[cubic-bezier(.25,.1,.25,1)] active:scale-[.96] motion-reduce:transition-none"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-transparent transition-transform duration-900 ease-[cubic-bezier(.25,.1,.25,1)] group-hover:scale-110">
        <Icon name={icon} className={`h-[22px] w-[22px] transition-all duration-900 ease-[cubic-bezier(.25,.1,.25,1)] motion-reduce:transition-none ${iconColor[icon]} ${active ? "-translate-y-0.5 scale-110 drop-shadow-[0_2px_4px_rgba(15,23,42,.18)]" : "scale-100 opacity-100 group-hover:-translate-y-0.5"}`} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1">
            <UnreadMessageBadge count={badge} />
          </span>
        )}
      </span>
    </Link>
  );
}
