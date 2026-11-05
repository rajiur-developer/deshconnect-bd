import Link from "next/link";
import type { PublicUser } from "@/types/auth";
import { PRIMARY_NAV, SITE } from "@/config/site";
import { unreadNotificationCount } from "@/services/notifications";
import {
  listConversations,
  listUnreadMessageCounts,
} from "@/services/messaging";
import {
  MessageRealtimeNotifications,
  type UnreadConversation,
} from "@/components/messaging/message-realtime-notifications";
import { MobileNav } from "./mobile-nav";
import { DesktopNav } from "./desktop-nav";
import { UserMenu } from "./user-menu";
import { TranslatedText } from "@/components/i18n/translated-text";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SearchTrigger } from "@/components/search/search-trigger";
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
          className="dc-header-logo hidden shrink-0 items-center gap-2 font-bold text-brand-700 logoSize lg:flex"
        >
          <span className="grid h-14 w-14 place-items-center rounded-lg text-white">
            <img
              src={MainLogo.src}
              alt={SITE.name}
              className="h-full w-full object-contain"
            />
          </span>
        </Link>

        <DesktopNav
          entries={PRIMARY_NAV}
          unreadMessages={unreadMessageTotal}
          initialUnreadMessages={unreadMessages}
        />

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
          <LanguageSwitcher />

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
                <TranslatedText text="Login" />
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                <TranslatedText text="Create account" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
