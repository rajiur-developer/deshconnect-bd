"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
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
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const routeReady = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const pathname = usePathname();
  const unreadTotal = useUnreadMessageTotal(initialUnreadMessages);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Link
        href="/blood-donation"
        aria-label="Blood Donation"
        aria-current={routeReady && isNavPathActive(pathname, "/blood-donation") ? "page" : undefined}
        title="Blood Donation"
        className={`grid h-10 w-10 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 ${routeReady && isNavPathActive(pathname, "/blood-donation") ? "bg-rose-50" : "bg-white"}`}
      >
        <Icon name="droplet" className="h-5 w-5" />
      </Link>
      <Link
        href="/messages"
        aria-label={`Messages${unreadTotal > 0 ? `, ${unreadTotal} unread` : ""}`}
        aria-current={routeReady && isNavPathActive(pathname, "/messages") ? "page" : undefined}
        title="Messages"
        className={`relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 ${routeReady && isNavPathActive(pathname, "/messages") ? "bg-slate-100" : "bg-white"}`}
      >
        <Icon name="message" className="h-5 w-5" />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1">
            <UnreadMessageBadge count={unreadTotal} />
          </span>
        )}
      </Link>
      {user && <UserMenu user={user} unread={unread} />}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Show or hide navigation"
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700"
      >
        <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
      </button>
      {open && (
        <div className="dc-mobile-menu absolute inset-x-0 top-16 z-40 border-b border-slate-200 bg-white shadow-lg">
          <nav className="container-x flex flex-col gap-1 py-4">
            {PRIMARY_NAV.filter((entry) => isNavGroup(entry) || (entry.href !== "/blood-donation" && entry.href !== "/messages")).map((entry) => {
              if (isNavGroup(entry)) {
                const isExpanded = openGroup === entry.label;
                const isGroupActive = routeReady && entry.items.some((item) => isNavPathActive(pathname, item.href));
                return (
                  <div key={entry.label}>
                    <button
                      type="button"
                      onClick={() => setOpenGroup((current) => current === entry.label ? null : entry.label)}
                      aria-expanded={isExpanded}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${isGroupActive ? "bg-brand-50 text-brand-700" : "text-slate-400 hover:bg-slate-50"}`}
                    >
                      {entry.label}
                      <Icon
                        name="chevron-down"
                        aria-hidden="true"
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-1 flex flex-col gap-1">
                        {entry.items.map((item) => {
                          const isActive = routeReady && isNavPathActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              aria-current={isActive ? "page" : undefined}
                              className={`rounded-lg py-2 pl-6 pr-3 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = routeReady && isNavPathActive(pathname, entry.href);
              const itemClass = `text-slate-700 hover:bg-slate-100${isActive ? " bg-slate-100 text-slate-900" : ""}`;

              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${itemClass}`}
                >
                  {entry.label}
                </Link>
              );
            })}
            <form action="/search" className="mt-2 px-3">
              <input
                name="q"
                placeholder="Search DeshConnect"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              />
            </form>
            <div className="mt-2 flex gap-2 px-3">
              {user ? (
                <Link href="/dashboard" className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white">
                    Login
                  </Link>
                  <Link href="/register" className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-center text-sm font-medium text-brand-700">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
