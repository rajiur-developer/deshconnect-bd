import { DEFAULT_ROLE_PERMISSIONS, type PermissionAction } from "@/config/permissions"; import type { Role } from "@/types/auth";
const KNOWN_ACTIONS = new Set<string>(Object.values(DEFAULT_ROLE_PERMISSIONS).flat());
/**
* Resolve the role's effective permissions. User and moderator selections replace
* their defaults once an administrator saves explicit choices; admin stays full-access.
*/ export function rolePermissions(role: Role, overrides: Record<string, string[]> = {}): PermissionAction[] {
const defaults = DEFAULT_ROLE_PERMISSIONS[role] ?? [];
if (role === "admin" || !Object.prototype.hasOwnProperty.call(overrides, role)) return defaults;
return Array.from(new Set((overrides[role] ?? []).filter((a): a is PermissionAction => KNOWN_ACTIONS.has(a)))); }
export function can(role: Role, action: PermissionAction, overrides: Record<string, string[]> = {}): boolean {
return rolePermissions(role, overrides).includes(action); }
export function isStaff(role: Role): boolean {
return role === "admin" || role === "moderator"; }
