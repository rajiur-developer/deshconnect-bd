import Link from "next/link";
import type { PublicUser } from "@/types/auth";
import { isNavGroup, PRIMARY_NAV, SITE } from "@/config/site";
import { unreadNotificationCount } from "@/services/notifications";
import {
  listConversations,
  listUnreadMessageCounts,
} from "@/services/messaging";
import {
  MessageRealtimeNotifications,
  type UnreadConversation,
} from "@/components/messaging/message-realtime-notifications";
import { Icon } from "@/components/ui/icons";
import { MobileNav } from "./mobile-nav";
import { NavMenu } from "./nav-menu";
import { UserMenu } from "./user-menu";
import MainLogo from "../../../public/logo/Main-Logo.webp";

export async function Header({
  user,
}: {
  user: PublicUser | null;
}) {
  let unread = 0;

  let messageConversations: {
    id: string;
    memberId: string;
  }[] = [];

  let unreadMessages: UnreadConversation[] = [];

  if (user) {
    const notificationPromise = unreadNotificationCount(user.id).catch(
      (error) => {
        console.error(
          "Could not load unread notification count:",
          error
        );
        return 0;
      }
    );

    // Load each header badge independently: one failing query must not blank
    // out the others, and the failure is still surfaced in the server log.
    const [conversations, unreadCounts] = await Promise.all([
      listConversations(user.id).catch((error: unknown) => {
        console.error("Could not load conversations:", error);
        return [] as { id: string; participantIds: string[] }[];
      }),
      listUnreadMessageCounts().catch((error: unknown) => {
        console.error("Could not load unread message counts:", error);
        return [] as UnreadConversation[];
      }),
    ]);

    const notificationCount = await Promise.race([
      notificationPromise,
      new Promise<number>((resolve) =>
        setTimeout(() => resolve(0), 1200)
      ),
    ]);

    unread = notificationCount;

    messageConversations = conversations.flatMap((conversation) => {
      const memberId = conversation.participantIds.find(
        (id: string) => id !== user.id
      );

      return memberId
        ? [
            {
              id: conversation.id,
              memberId,
            },
          ]
        : [];
    });

    unreadMessages = unreadCounts;
  }

  const unreadMessageTotal = unreadMessages.reduce(
    (total, item) => total + item.count,
    0
  );

  return (
    <header className="dc-header sticky top-0 z-40 border-b border-gray-200/50 bg-white/70 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl">
      {user && (
        <MessageRealtimeNotifications
          userId={user.id}
          conversations={messageConversations}
          pollSince={new Date().toISOString()}
          initialUnreadMessages={unreadMessages}
        />
      )}

      <div className="dc-header-inner container-x flex h-[4.5rem] items-center gap-4">
        <Link
          href="/"
          className="dc-header-logo flex shrink-0 items-center gap-2 font-bold text-brand-700 logoSize"
        >
          <span className="grid h-14 w-14 place-items-center rounded-lg text-white">
            <img
              src={MainLogo.src}
              alt={SITE.name}
              className="h-full w-full object-contain"
            />
          </span>
        </Link>

        <nav
          className="ml-2 hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((entry) => (
            <NavMenu
              key={isNavGroup(entry) ? entry.label : entry.href}
              entry={entry}
              unreadMessages={
                !isNavGroup(entry) && entry.href === "/messages"
                  ? unreadMessageTotal
                  : 0
              }
              initialUnreadMessages={unreadMessages}
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/search" className="hidden md:block">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />

              <input
                name="q"
                placeholder="Search places and services…"
                aria-label="Search DeshConnect"
                className="dc-header-search w-52 rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus-ring lg:w-64"
              />
            </div>
          </form>

          <MobileNav
            user={user}
            unread={unread}
            unreadMessages={unreadMessageTotal}
            initialUnreadMessages={unreadMessages}
          />

          {user ? (
            <div className="hidden lg:block">
              <UserMenu user={user} unread={unread} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
