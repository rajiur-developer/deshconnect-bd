import type { Role } from "@/types/auth";
export type PermissionAction =
| "places:create"
| "places:edit"
| "places:delete"
| "institutions:edit"
| "businesses:edit"
| "services:edit"
| "news:approve"
| "news:publish"
| "news:edit"
| "moderation:posts"
| "moderation:comments"
| "moderation:reviews"
| "moderation:reports"
| "blood:manage"
| "users:manage"
| "roles:manage"
| "locations:manage"
| "settings:manage"
| "audit:read";
export const ALL_ACTIONS: PermissionAction[] = [
"places:create",
"places:edit",
"places:delete",
"institutions:edit",
"businesses:edit",
"services:edit",
"news:approve",
"news:publish",
"news:edit",
"moderation:posts",
"moderation:comments",
"moderation:reviews",
"moderation:reports",
"blood:manage",
"users:manage",
"roles:manage",
"locations:manage",
"settings:manage",
"audit:read", ];
/** Least-privilege defaults. Overridable from /admin/permissions. */ export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionAction[]> = {
user: [],
moderator: [
"moderation:posts",
"moderation:comments",
"moderation:reviews",
"moderation:reports",
"news:approve",
"news:publish",
"places:create",
"places:edit",
"businesses:edit",
"services:edit",
"blood:manage",
"users:manage",
],
admin: [...ALL_ACTIONS], };
export const ROLE_LABELS: Record<Role, string> = {
user: "User",
moderator: "Moderator",
admin: "Admin", };
