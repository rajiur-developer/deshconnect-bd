import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { getDirectoryLocationOptions } from "@/services/locations"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { BulkActions } from "@/components/admin/bulk-actions"; import { ServiceForm } from "@/components/admin/service-form"; import { RecordActions } from "@/components/admin/record-actions"; import { serviceCategoryLabel } from "@/components/cards/service-card"; import { formatDate } from "@/lib/utils"; import { listContentCategories } from "@/services/content-categories";
export const metadata = { title: "Government Services" };
export default async function AdminGovernmentServicesPage() {
const [{ data }, options, categories] = await Promise.all([insforgeSelectMany("government_services", { order: "updated_at.desc", limit: "500" }), getDirectoryLocationOptions(), listContentCategories("government-service")]);
const services = mapDbRow(data || []);
return (
<>
<PageHeader title="Government Services" description="Manage government-service information." />
<div className="mb-8">
<ServiceForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} categories={categories} />
</div>
<BulkActions entity="service" records={services.map((service) => ({ id: service.id, label: service.name, status: service.status }))} />
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="px-4 py-3">Name</th>
<th className="px-4 py-3">Category</th>
<th className="px-4 py-3">Address</th>
<th className="px-4 py-3">Updated</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{services.map((service) => (
<tr key={service.id}>
<td className="px-4 py-3">
<Link href={`/government-services/${service.slug}`} className="font-medium text-slate-900 hover:text-brand-700">{service.name}</Link>
</td>
<td className="px-4 py-3 text-slate-600">{serviceCategoryLabel(service.category)}</td>
<td className="px-4 py-3 text-slate-600">{service.officeAddress}</td>
<td className="px-4 py-3 text-slate-500">{formatDate(service.updatedAt)}</td>
<td className="px-4 py-3">
<RecordActions entity="service" id={service.id} status={service.status}>
<ServiceForm
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={categories}
record={service}
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
