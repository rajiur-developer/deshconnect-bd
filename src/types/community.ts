export interface Post {
id: string;
authorId: string;
body: string;
image?: string | null;
divisionId?: string | null;
districtId?: string | null;
upazilaId?: string | null;
status: "visible" | "hidden" | "pending" | "deleted";
reactions: number;
createdAt: string;
updatedAt: string; }
export interface Comment {
id: string;
postId: string;
authorId: string;
body: string;
status: "visible" | "hidden" | "deleted";
createdAt: string; }
export type ReportTargetType = "post" | "comment" | "review" | "news" | "blood_request"; export type ReportStatus = "open" | "under_review" | "resolved" | "dismissed";
export interface Report {
id: string;
targetType: ReportTargetType;
targetId: string;
reporterId: string;
reason: string;
details?: string | null;
status: ReportStatus;
resolution?: string | null;
createdAt: string;
updatedAt: string; }
export type ConnectionStatus = "pending" | "accepted" | "rejected" | "cancelled";
export interface Connection {
id: string;
requesterId: string;
addresseeId: string;
status: ConnectionStatus;
createdAt: string;
updatedAt: string; }
export interface Conversation {
id: string;
participantIds: string[];
updatedAt: string; }
export interface Message {
id: string;
conversationId: string;
senderId: string;
body: string;
readBy: string[];
deliveredTo?: string[];
editedAt?: string | null;
attachmentKey?: string | null;
attachmentUrl?: string | null;
attachmentMimeType?: string | null;
attachmentType?: "image" | "audio" | null;
replyToMessageId?: string | null;
reactions?: Array<{ userId: string; emoji: string }>;
createdAt: string; }
export interface Notification {
id: string;
userId: string;
title: string;
body: string;
href?: string | null;
read: boolean;
createdAt: string; }
