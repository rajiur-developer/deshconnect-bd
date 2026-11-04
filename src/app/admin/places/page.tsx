import Image from "next/image";
import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge";
import { mapDbRow } from "@/lib/db/insforge";
import { getDirectoryLocationOptions } from "@/services/locations";
import { listContentCategories } from "@/services/content-categories";
import { Badge, Card } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceForm } from "@/components/admin/place-form";
import { RecordActions } from "@/components/admin/record-actions";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/current-user";
import { BulkActions, BulkSelectCheckbox } from "@/components/admin/bulk-actions";

export const metadata = { title: "Places" };

function PlaceThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {src ? (
        <Image src={src} alt={alt} fill sizes="40px" unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400" aria-label="No image">
          {alt.trim().charAt(0).toUpperCase() || "—"}
        </div>
      )}
    </div>
  );
}

export default async function AdminPlacesPage() {
  const [{ data }, options, categories, user] = await Promise.all([
    insforgeSelectMany("places", { order: "updated_at.desc", limit: "500" }),
    getDirectoryLocationOptions(),
    listContentCategories("place"),
    requireUser("/admin/places"),
  ]);
  const places = mapDbRow(data || []);
  const categoryNames = new Map(categories.map((category) => [category.value, category.name]));

  return (
    <>
      <PageHeader title="Places" description="Create, edit and delete tourist-place records." />
      <div className="mb-8">
        <PlaceForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} categories={categories} userId={user.id} />
      </div>
      <BulkActions entity="place" records={places.map((place) => ({ id: place.id, label: place.name, status: place.status }))}>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3" aria-label="Select records"></th>
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
              <td className="px-4 py-3"><BulkSelectCheckbox id={place.id} label={place.name} /></td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[14rem] items-center gap-3">
                    <PlaceThumbnail src={place.image} alt={place.name} />
                    <Link href={`/places/${place.slug}`} className="font-medium text-slate-900 hover:text-brand-700">
                      {place.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{categoryNames.get(place.category) ?? place.category}</td>
                <td className="px-4 py-3">
                  <Badge tone={place.status === "published" ? "success" : "neutral"}>
                    {place.status === "archived" ? "hidden" : place.status}
                  </Badge>
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
            {places.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No places found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      </BulkActions>
    </>
  );
}
