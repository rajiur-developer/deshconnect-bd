import Image from "next/image";
import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { getDirectoryLocationOptions } from "@/services/locations"; import { listContentCategories } from "@/services/content-categories"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header"; import { PlaceForm } from "@/components/admin/place-form"; import { RecordActions } from "@/components/admin/record-actions"; import { BulkActions, BulkSelectCheckbox } from "@/components/admin/bulk-actions"; import { requireUser } from "@/lib/auth/current-user";
export const metadata = { title: "Tourism" };
export default async function AdminTourismPage() {
const [{ data }, options, categories, user] = await Promise.all([insforgeSelectMany("places", { order: "rating.desc", limit: "500" }), getDirectoryLocationOptions(), listContentCategories("place"), requireUser("/admin/tourism")]);
const places = mapDbRow(data || []);
const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
return (
<>
<PageHeader title="Tourism" description="Manage the tourism directory and destination content." />
<BulkActions entity="place" records={places.map((place) => ({ id: place.id, label: place.name, status: place.status }))}>
<Card className="overflow-x-auto p-0">
<table className="min-w-full divide-y divide-slate-100 text-sm">
<thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
<tr>
<th className="w-10 px-4 py-3" aria-label="Select records"></th>
              <th className="px-4 py-3">Destination</th>
<th className="px-4 py-3">Category</th>
<th className="px-4 py-3">Rating</th>
<th className="px-4 py-3">Reviews</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-100">
{places.map((place) => (
<tr key={place.id}>
              <td className="px-4 py-3"><BulkSelectCheckbox id={place.id} label={place.name} /></td>
<td className="px-4 py-3">
<div className="flex min-w-[14rem] items-center gap-3"><div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">{place.image ? <Image src={place.image} alt={place.name} fill sizes="40px" unoptimized className="object-cover" /> : <span className="grid h-full w-full place-items-center text-xs font-bold text-slate-500">{place.name.trim().charAt(0).toUpperCase()}</span>}</div><Link href={`/places/${place.slug}`} className="font-semibold text-slate-900 transition hover:text-brand-700">{place.name}</Link></div>
</td>
<td className="px-4 py-3 text-slate-600">{categoryNames.get(place.category) ?? place.category}</td>
<td className="px-4 py-3"><Badge tone="amber">{place.rating.toFixed(1)}</Badge></td>
<td className="px-4 py-3 text-slate-600">{place.reviewCount}</td>
<td className="px-4 py-3">
<RecordActions entity="place" id={place.id} status={place.status}>
<PlaceForm
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
categories={categories}
record={place}
userId={user.id}
/>
</RecordActions>
</td>
</tr>
))}
</tbody>
</table>
</Card>
      </BulkActions>
</>
); }
