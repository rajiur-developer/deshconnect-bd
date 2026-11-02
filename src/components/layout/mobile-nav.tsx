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
  const moreActive = routeReady && moreItems.some((item) => isNavPathActive(pathname, item.href));

  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/90 bg-white/95 px-1 pt-2 shadow-[0_-8px_28px_-22px_rgba(15,61,46,.45)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-2xl grid-cols-7 items-center gap-0">
        <MobileNavLink href="/" label="Home" icon="home" pathname={pathname} routeReady={routeReady} />
        <MobileNavLink href="/places" label="Place" icon="mountain" pathname={pathname} routeReady={routeReady} />
        <MobileNavLink href="/government-services" label="Services" icon="landmark" pathname={pathname} routeReady={routeReady} />
        <MobileNavLink href="/blood-donation" label="Blood" icon="droplet" pathname={pathname} routeReady={routeReady} />
        <MobileNavLink
          href="/messages"
          label="Messages"
          icon="message"
          pathname={pathname}
          routeReady={routeReady}
          badge={unreadTotal}
        />
        <MobileNavLink href="/news" label="News" icon="globe" pathname={pathname} routeReady={routeReady} />
        <button
          type="button"
          onClick={() => setMoreOpen((value) => !value)}
          aria-expanded={moreOpen}
          aria-controls="dc-mobile-more-menu"
          aria-label="More navigation options"
          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${moreOpen || moreActive ? "text-brand-700" : "text-slate-500 hover:text-brand-700"}`}
        >
          <Icon name={moreOpen ? "close" : "menu"} className="h-6 w-6" />
          <span>More</span>
        </button>
      </div>

      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Close more navigation"
            className="fixed inset-0 -z-10 bg-slate-950/20"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id="dc-mobile-more-menu"
            className="absolute inset-x-3 bottom-[calc(100%+0.6rem)] mx-auto max-h-[min(65dvh,34rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_-18px_rgba(15,45,30,.35)]"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-bold text-slate-800">More from DeshConnect</p>
              {user && <UserMenu user={user} unread={unread} />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const active = routeReady && isNavPathActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${active ? "border-brand-200 bg-brand-50 text-brand-800" : "border-slate-100 bg-slate-50 text-slate-700 hover:border-brand-100 hover:bg-brand-50"}`}
                  >
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
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
                  Search
                </button>
              </div>
            </form>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <Link href="/dashboard" className="flex-1 rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Login
                  </Link>
                  <Link href="/register" className="flex-1 rounded-xl border border-brand-200 px-3 py-2.5 text-center text-sm font-semibold text-brand-700">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  icon,
  pathname,
  routeReady,
  badge = 0,
}: {
  href: string;
  label: string;
  icon: "home" | "mountain" | "landmark" | "droplet" | "message" | "globe";
  pathname: string;
  routeReady: boolean;
  badge?: number;
}) {
  const active = routeReady && isNavPathActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={`${label}${badge > 0 ? `, ${badge} unread` : ""}`}
      className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-brand-700"}`}
    >
      <span className="relative">
        <Icon name={icon} className="h-6 w-6" />
        {badge > 0 && (
          <span className="absolute -right-2 -top-1">
            <UnreadMessageBadge count={badge} />
          </span>
        )}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
