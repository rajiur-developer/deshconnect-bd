import { redirect } from "next/navigation";
import { insforgeSelectMany } from "@/lib/insforge";
import { mapDbRow } from "@/lib/db/insforge";
import { listAdminUsers } from "@/services/users";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";
import { getRolePermissionOverrides } from "@/services/role-permissions";
import { Badge, Card } from "@/components/ui/badge"; import { BulkActions } from "@/components/admin/bulk-actions"; import { PageHeader } from "@/components/layout/page-header"; import { BloodDonorActions } from "@/components/admin/admin-client";

export const metadata = { title: "Blood Donors" };

export default async function AdminBloodDonorsPage() {
  const user = await getCurrentUser();
  const overrides = user ? await getRolePermissionOverrides() : {};
  if (!user || !can(user.role, "blood:manage", overrides)) redirect("/admin");

  const [{ data }, users] = await Promise.all([insforgeSelectMany("blood_donors", { order: "updated_at.desc", limit: "500" }), listAdminUsers()]);
  const donors = mapDbRow(data || []);
  const userById = new Map(users.map((user) => [user.id, user]));

  return (
    <>
      <PageHeader
        title="Blood Donors"
        description="Manage donor records within authorised limits. Full contact numbers are visible to authorised blood-donation staff."
      />
      <BulkActions entity="donor" records={donors.map((donor) => ({ id: donor.id, label: `${userById.get(donor.userId)?.fullName ?? donor.userId} — ${donor.bloodGroup}`, status: donor.archivedAt ? "Archived" : (!donor.consentListed || !donor.consentContact ? "Hidden" : "Active") }))} />
<Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Profile status</th>
              <th className="px-4 py-3">Consent</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {donors.map((donor) => {
              const user = userById.get(donor.userId);
              return (
                <tr key={donor.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{user?.fullName ?? donor.userId}</p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                  </td>
                  <td className="px-4 py-3"><Badge tone="brand">{donor.bloodGroup}</Badge></td>
                  <td className="px-4 py-3 capitalize text-slate-600">{donor.availability}</td>
                  <td className="px-4 py-3">
                    <Badge tone={donor.archivedAt || !donor.consentListed || !donor.consentContact ? "amber" : "success"}>
                      {donor.archivedAt ? "Archived" : !donor.consentListed || !donor.consentContact ? "Hidden" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Badge tone={donor.consentListed ? "success" : "neutral"}>listed</Badge>
                      <Badge tone={donor.consentContact ? "success" : "neutral"}>contact</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{donor.phone || donor.contactValue || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{donor.whatsapp || "—"}</td>
                  <td className="px-4 py-3"><BloodDonorActions id={donor.id} archived={Boolean(donor.archivedAt)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
