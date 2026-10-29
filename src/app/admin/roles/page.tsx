import { getRolePermissionOverrides } from "@/services/role-permissions"; import { rolePermissions } from "@/lib/auth/permissions"; import { ALL_ACTIONS, ROLE_LABELS } from "@/config/permissions"; import { Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import type { Role } from "@/types/auth";
export const metadata = { title: "Roles" };
export default async function AdminRolesPage() {
const overrides = await getRolePermissionOverrides();
const roles: Role[] = ["user", "moderator", "admin"];
return (
<>
<PageHeader title="Roles" description="Admin, Moderator and User roles with their effective permissions." />
<div className="grid gap-4 lg:grid-cols-3">
{roles.map((role) => {
const effective = rolePermissions(role, overrides);
const roleOverrides = overrides[role] ?? [];
return (
<Card key={role} className="p-5">
<h2 className="font-semibold text-slate-900">{ROLE_LABELS[role]}</h2>
<p className="mt-1 text-sm text-slate-600">{effective.length} effective permission{effective.length === 1 ? "" : "s"}</p>
{roleOverrides.length > 0 && (
<p className="mt-1 text-xs text-brand-700">{roleOverrides.length} override{roleOverrides.length === 1 ? "" : "s"}</p>
)}
<ul className="mt-3 flex flex-wrap gap-1">
{effective.map((action) => (
<li key={action} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{action}</li>
))}
</ul>
</Card>
);
})}
</div>
<Card className="mt-6 p-5">
<h2 className="font-semibold text-slate-900">All available actions</h2>
<ul className="mt-3 flex flex-wrap gap-1">
{ALL_ACTIONS.map((action) => (
<li key={action} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{action}</li>
))}
</ul>
</Card>
</>
); }
