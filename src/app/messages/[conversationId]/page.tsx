import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getConversationForUser } from "@/services/messaging";
import { listUsers } from "@/services/users";
export const metadata = { title: "Conversation", robots: { index: false, follow: false } };
export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
const { conversationId } = await params;
const user = await requireUser("/messages");
const conversation = await getConversationForUser(conversationId, user.id);
if (!conversation) redirect("/messages");
const users = await listUsers();
const otherId = conversation.participantIds.find((id) => id !== user.id) ?? conversation.participantIds[0];
const other = users.find((item) => item.id === otherId);
if (!other) redirect("/messages");
redirect(`/messages?to=${encodeURIComponent(other.username)}`);
}
