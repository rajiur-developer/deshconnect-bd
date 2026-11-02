"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getInsForgeBrowserClient } from "@/lib/insforge-browser";
import type { PublicUser } from "@/types/auth";
import type { Message } from "@/types/community";
import { markConversationMessagesReadAction, openConversationAction, sendMessageAction } from "@/features/account/actions";
import { MessageForm } from "@/components/account/account-forms";
import { RealtimeMessageList } from "@/components/messaging/realtime-message-list";
import { UnreadMessageBadge, type UnreadConversation } from "@/components/messaging/message-realtime-notifications";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Icon } from "@/components/ui/icons";

type Member = Pick<PublicUser, "id" | "username" | "fullName" | "avatar" | "avatarKey">;
type Chat = { id: string; member: Member };
type MessagePreview = { id: string; conversationId: string; senderId: string; body: string; attachmentType: "image" | "audio" | null; createdAt: string };
export function MessagesInbox({ userId, chats, initialUsername, initialUnreadMessages = [], initialPreviews = [] }: { userId: string; chats: Chat[]; initialUsername?: string; initialUnreadMessages?: UnreadConversation[]; initialPreviews?: MessagePreview[] }) {
  const [chatList, setChatList] = useState(chats);
  const [active, setActive] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewByConversation, setPreviewByConversation] = useState<Record<string, MessagePreview>>(() => Object.fromEntries(initialPreviews.map((preview) => [preview.conversationId, preview])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [listFilter, setListFilter] = useState<"all" | "unread">("all");
  const [unreadByConversation, setUnreadByConv...[truncated]