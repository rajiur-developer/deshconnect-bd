import { getRolePermissionOverrides } from "@/services/role-permissions"; import { PageHeader } from "@/components/layout/page-header"; import { PermissionsForm } from "@/components/admin/admin-client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
export const metadata = { title: "Permissions" };
export default async function AdminPermissionsPage() {
const user = await getCurrentUser();
if (user?.role !== "admin") redirect("/admin");
const overrides = await getRolePermissionOverrides();
return (
<>
<PageHeader
title="Permissions"
description="Control which actions each role can perform. Enforced on the server, not only in the UI."
/>
<PermissionsForm overrides={overrides} />
</>
); }
