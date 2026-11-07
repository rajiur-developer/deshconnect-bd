import { requireUser } from "@/lib/auth/current-user";
import { listConversationPreviews, listConversations, listPendingRequests, listUnreadMessageCounts } from "@/services/messaging";
import { listConnections, listUsers } from "@/services/users";
import { AccountShell } from "@/components/layout/account-shell";
import { MessagesInbox } from "@/components/messaging/messages-inbox";

export const metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const user = await requireUser("/messages");
  const [conversations, friends, incomingRequests, users, unreadMessages] = await Promise.all([listConversations(user.id), listConnections(user.id), listPendingRequests(user.id), listUsers(), listUnreadMessageCounts().catch(() => [])]);
  const userById = new Map(users.map((item) => [item.id, item]));
  const friendRequests = incomingRequests.flatMap((request) => {
    const requester = userById.get(request.requesterId);
    return requester ? [{ id: request.id, requesterId: request.requesterId, createdAt: request.createdAt, member: { id: requester.id, username: requester.username, fullName: requester.fullName, avatar: requester.avatar, avatarKey: requester.avatarKey } }] : [];
  });
  const previews = await listConversationPreviews(conversations.map(({ id }) => id)).catch((error) => {
    console.error("Could not load conversation previews:", error);
    return [];
  });
  const conversationByMember = new Map(conversations.flatMap((conversation) => {
    const otherId = conversation.participantIds.find((id) => id !== user.id);
    return otherId ? [[otherId, conversation.id] as const] : [];
  }));
  const chats = friends.map((member) => ({ id: conversationByMember.get(member.id) ?? "", member }));
  return <AccountShell user={user} title="Messages" description="Chat with members who accepted your connection request." messagesOnly>
    <MessagesInbox userId={user.id} chats={chats} friendRequests={friendRequests} initialUsername={to} initialUnreadMessages={unreadMessages} initialPreviews={previews} />
  </AccountShell>;
}
