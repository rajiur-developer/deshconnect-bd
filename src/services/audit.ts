import type { AuditLog } from "@/types/admin";
import { insforgeAuditLog } from "@/services/users";
import { insforgeSelectMany } from "@/lib/insforge";
export async function recordAudit(input: {
actorId: string;
actorName: string;
action: string;
entity: string;
entityId: string;
outcome: AuditLog["outcome"];
detail?: string; }): Promise<void> {
await insforgeAuditLog({ ...input, detail: input.detail ?? null }); }
export async function listAuditLogs(limit = 100): Promise<AuditLog[]> {
const { data, error } = await insforgeSelectMany("audit_logs", { order: "created_at.desc", limit: String(limit) });
if (error) throw error;
return (data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, actorName: row.actor_name, action: row.action, entity: row.entity, entityId: row.entity_id, outcome: row.outcome, detail: row.detail, createdAt: row.created_at })); }
