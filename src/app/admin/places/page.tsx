import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { getDirectoryLocationOptions } from "@/services/locations"; import { listContentCategories } from "@/services/content-categories"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { PlaceForm } from "@/components/admin/place-form"; import { RecordActions } from "@/components/admin/record-actions"; import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/current-user";
import { BulkActions } from "@/components/admin/bulk-actions";
export const metadata = { title: "Places" };
export default async function AdminPlacesPage() {
const [{ data }, options, categories, user] = await Promise.all([insforgeSelectMany("places", { order: "updated_at.desc", limit: "500" }), getDirectoryLocationOptions(), listContentCategories("place"), requireUser("/admin/places")]);
const places = mapDbRow(data || []);
const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
return (
<>
<PageHeader title="Places" description="Create, edit and delete tourist-place records." />
<div className="mb-8">
<PlaceForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} categories={categories} userId={user.id} />
</div>
<BulkActions entity="place" records={places.map((place) => ({ id: place.id, label: place.name, status: place.status }))} />
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
{places.map((place) => (
<tr key={place.id}>
<td className="px-4 py-3">
<Link href={`/places/${place.slug}`} className="font-medium text-slate-900 hover:text-brand-700">{place.name}</Link>
</td>
<td className="px-4 py-3 text-slate-600">{categoryNames.get(place.category) ?? place.category}</td>
<td className="px-4 py-3">
<Badge tone={place.status === "published" ? "success" : "neutral"}>{place.status}</Badge>
</td>
<td className="px-4 py-3">
<Badge tone={place.verification === "verified" ? "success" : "neutral"}>{place.verification}</Badge>
</td>
<td className="px-4 py-3 text-slate-500">{formatDate(place.updatedAt)}</td>
<td className="px-4 py-3">
<RecordActions entity="place" id={place.id} status={place.status}>
<PlaceForm
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={categories}
record={place.image?.startsWith("data:image/") ? { ...place, image: "" } : place}
userId={user.id}
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
