import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { getDirectoryLocationOptions } from "@/services/locations"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { BusinessForm } from "@/components/admin/business-form"; import { RecordActions } from "@/components/admin/record-actions"; import { businessCategoryLabel } from "@/components/cards/business-card"; import { formatDate } from "@/lib/utils"; import { BulkActions } from "@/components/admin/bulk-actions";
export const metadata = { title: "Businesses" };
export default async function AdminBusinessesPage() {
const [{ data }, options, user] = await Promise.all([insforgeSelectMany("businesses", { order: "updated_at.desc", limit: "500" }), getDirectoryLocationOptions(), getCurrentUser()]);
const businesses = mapDbRow(data || []);
return (
<>
<PageHeader title="Businesses" description="Manage business listings." />
<div className="mb-8">
<BusinessForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} userId={user?.id} />
</div>
<BulkActions entity="business" records={businesses.map((business) => ({ id: business.id, label: business.name, status: business.status }))} />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Name</th>
<th className="px-4 py-3">Category</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Verified</th>
<th className="px-4 py-3">Updated</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{businesses.map((business) => (
<tr key={business.id}>
<td className="px-4 py-3">
<Link href={`/businesses/${business.slug}`} className="font-medium text-slate-900 hover:text-brand-700">{business.name}</Link>
</td>
<td className="px-4 py-3 text-slate-600">{businessCategoryLabel(business.category)}</td>
<td className="px-4 py-3"><Badge tone={business.status === "published" ? "success" : "neutral"}>{business.status}</Badge></td>
<td className="px-4 py-3"><Badge tone={business.verification === "verified" ? "success" : "neutral"}>{business.verification}</Badge></td>
<td className="px-4 py-3 text-slate-500">{formatDate(business.updatedAt)}</td>
<td className="px-4 py-3">
<RecordActions entity="business" id={business.id} status={business.status}>
<BusinessForm
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
userId={user?.id}
record={business}
/>
</RecordActions>
</td>
</tr>
))}
</tbody>
</table>
</Card>
</>
); }
