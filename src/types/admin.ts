import type { Review } from "./content"; import type { BloodDonor, BloodRequest } from "./blood"; import type { Comment, Connection, Conversation, Message, Notification, Post, Report } from "./community";
export interface AuditLog {
id: string;
actorId: string;
actorName: string;
action: string;
entity: string;
entityId: string;
outcome: "success" | "denied" | "error";
detail?: string | null;
createdAt: string; }
export interface CorrectionRequest {
id: string;
targetType: "place" | "institution" | "business" | "service";
targetId: string;
targetName: string;
submittedBy: string;
message: string;
status: "open" | "approved" | "rejected";
createdAt: string;
updatedAt: string; }
export interface PlatformSettings {
siteName: string;
allowPublicPosts: boolean;
requireNewsApproval: boolean;
donorDirectoryEnabled: boolean;
/** roleId -> allowed action ids, merged over the defaults in config/permissions. */
rolePermissionOverrides: Record<string, string[]>; }
/** Root shape of the file-backed store. */ export interface Database {
users: import("./auth").User[];
passwordResets: import("./auth").PasswordReset[];
divisions: import("./location").Division[];
districts: import("./location").District[];
upazilas: import("./location").Upazila[];
unions: import("./location").Union[];
places: import("./content").Place[];
institutions: import("./content").Institution[];
businesses: import("./content").Business[];
governmentServices: import("./content").GovernmentService[];
news: import("./content").News[];
reviews: import("./content").Review[];
posts: Post[];
comments: Comment[];
reports: Report[];
connections: Connection[];
conversations: Conversation[];
messages: Message[];
notifications: Notification[];
donors: BloodDonor[];
bloodRequests: BloodRequest[];
saved: { userId: string; placeId: string; createdAt: string }[];
auditLogs: AuditLog[];
corrections: CorrectionRequest[];
settings: PlatformSettings; }
