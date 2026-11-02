"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { PublicUser } from "@/types/auth";
import { isNavGroup, isNavPathActive, PRIMARY_NAV } from "@/config/site";
import { Icon } from "@/components/ui/icons";
import { UnreadMessageBadge, useUnreadMessageTotal, type UnreadConversation } from "@/components/messaging/message-realtime-notifications";
import { UserMenu } from "@/components/layout/user-menu";

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
  const activeIndex = moreOpen || moreActive ? PRIMARY_LINKS.length : Math.max(0, directIndex);

  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-2 top-[10px] z-[60] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/65 bg-white/55 px-1.5 py-1.5 shadow-[0_14px_44px_-14px_rgba(15,61,46,.28),0_3px_12px_-4px_rgba(15,23,42,.12)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/35 supports-[backdrop-filter]:bg-white/45 dark:border-white/10 dark:bg-slate-950/45 dark:ring-white/10">
        <div className="relative grid grid-cols-7 items-stretch gap-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100/80 shadow-[0_3px_12px_-5px_rgba(5,150,105,.35),inset_0_0_0_1px_rgba(5,150,105,.12)] transition-[transform,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
            style={{ left: 0, width: "14.285714%", transform: `translateX(${activeIndex * 100}%)` }}
          />
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
            className={`relative z-10 flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[9px] font-semibold leading-tight transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-90 sm:text-[10px] ${moreOpen || moreActive ? "text-violet-800" : "text-slate-500 hover:text-violet-700"}`}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-xl bg-violet-50 shadow-[inset_0_0_0_1px_rgba(139,92,246,.10)] transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${moreOpen ? "rotate-90 scale-95 bg-violet-100" : "rotate-0 group-hover:scale-105"}`}><Icon name={moreOpen ? "close" : "menu"} className="h-[19px] w-[19px] text-violet-600" /></span>
            <span>More</span>
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
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
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
      className={`group relative z-10 flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[9px] font-semibold leading-tight transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-90 sm:text-[10px] ${active ? "text-emerald-900" : "text-slate-500 hover:text-slate-800"}`}
    >
      <span className={`relative grid h-8 w-8 place-items-center rounded-xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${active ? "scale-105 bg-white/90 shadow-[0_3px_10px_-4px_rgba(15,23,42,.22),inset_0_0_0_1px_rgba(15,23,42,.04)]" : "bg-transparent group-hover:scale-105 group-hover:bg-white/70"}`}>
        <Icon name={icon} className={`h-[20px] w-[20px] transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${iconColor[icon]} ${active ? "-translate-y-0.5 scale-110 drop-shadow-[0_2px_4px_rgba(15,23,42,.18)]" : "scale-100 opacity-85 group-hover:-translate-y-0.5 group-hover:opacity-100"}`} />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1">
            <UnreadMessageBadge count={badge} />
          </span>
        )}
      </span>
      <span className="max-w-full text-center">{label === "Blood Donation" ? "Blood" : label}</span>
    </Link>
  );
}
