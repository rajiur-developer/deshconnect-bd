"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NavMenu } from "./nav-menu";
import type { NavEntry } from "@/config/site";
import type { UnreadConversation } from "@/components/messaging/message-realtime-notifications";
import { useLanguage } from "@/components/i18n/language-provider";

export function DesktopNav({
  entries,
  unreadMessages = 0,
  initialUnreadMessages = [],
}: {
  entries: NavEntry[];
  unreadMessages?: number;
  initialUnreadMessages?: UnreadConversation[];
}) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    let frame = 0;
    const updateIndicator = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = nav.querySelector<HTMLElement>(
          ':scope > a[aria-current="page"], :scope > div > button[aria-current="page"]',
        );

        if (!active) {
          indicator.style.opacity = "0";
          return;
        }

        indicator.style.opacity = "1";
        indicator.style.width = `${active.offsetWidth}px`;
        indicator.style.height = `${active.offsetHeight}px`;
        indicator.style.transform = `translate3d(${active.offsetLeft}px, ${active.offsetTop}px, 0)`;
      });
    };

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);
    window.addEventListener("resize", updateIndicator);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [pathname, entries]);

  return (
    <nav
      ref={navRef}
      className="dc-desktop-nav relative ml-2 hidden items-center gap-1 lg:flex"
      aria-label={t("Primary")}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg border border-brand-200/80 bg-brand-50 shadow-[0_3px_12px_-7px_rgba(11,61,46,.22)] opacity-0"
        style={{
          transition:
            "transform 680ms cubic-bezier(.16,1,.3,1), width 520ms cubic-bezier(.16,1,.3,1), height 520ms cubic-bezier(.16,1,.3,1), opacity 180ms ease",
          willChange: "transform, width",
        }}
      />
      {entries.map((entry) => (
        <NavMenu
          key={"items" in entry ? entry.label : entry.href}
          entry={entry}
          unreadMessages={"href" in entry && entry.href === "/messages" ? unreadMessages : 0}
          initialUnreadMessages={initialUnreadMessages}
        />
      ))}
    </nav>
  );
}
