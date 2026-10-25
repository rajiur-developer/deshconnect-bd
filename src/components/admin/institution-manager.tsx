import Link from "next/link";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import type { PageMeta } from "@/lib/utils";
import { InstitutionForm } from "@/components/admin/institution-form";
import { RecordActions } from "@/components/admin/record-actions";
import { formatDate } from "@/lib/utils";
import type { LocationOption, DistrictOption, UpazilaOption } from "@/components/search/directory-filters";
import type { Institution } from "@/types/content";

type Props = {
  title: string;
  description: string;
  isHospital: boolean;
  records: Institution[];
  adminPath: string;
  query: string;
  meta: PageMeta & { pageSize: number };
  categories: { value: string; label: string }[];
  divisions: LocationOption[];
  districts: DistrictOption[];
  upazilas: UpazilaOption[];
  userId: string;
};

export function InstitutionManager({
  title,
  description,
  isHospital,
  records,
  adminPath,
  query,
  meta,
  categories,
  divisions,
  districts,
  upazilas,
  userId,
}: Props) {
  const categoryValues = new Set(categories.map((category) => category.value));
  const managedRecords = records.filter((record) => categoryValues.has(record.category));

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="mb-8">
        <InstitutionForm
          divisions={divisions}
          districts={districts}
          upazilas={upazilas}
          categories={categories}
          userId={userId}
        />
      </div>
      <form action={adminPath} method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[16rem] flex-1 text-sm font-medium text-slate-700" htmlFor="institution-search">
          Search by name, address, or description
          <input
            id="institution-search"
            name="q"
            type="search"
            defaultValue={query}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus-ring"
          />
        </label>
        <Button type="submit" variant="outline">Search</Button>
        {query && (
          <Link href={adminPath} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-slate-100">
            Clear
          </Link>
        )}
      </form>
      <p className="mb-3 text-sm text-slate-500">
        {meta.total === 0
          ? "No records found."
          : `Showing ${(meta.page - 1) * meta.pageSize + 1}-${Math.min(meta.page * meta.pageSize, meta.total)} of ${meta.total} records`}
      </p>
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
            {managedRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`${isHospital ? "/hospitals" : "/institutions"}/${record.slug}`}
                    className="font-medium text-slate-900 hover:text-brand-700"
                  >
                    {record.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {categories.find((category) => category.value === record.category)?.label ?? record.category}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={record.status === "published" ? "success" : "neutral"}>{record.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={record.verification === "verified" ? "success" : "neutral"}>{record.verification}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(record.updatedAt)}</td>
                <td className="px-4 py-3">
                  <RecordActions entity={isHospital ? "hospital" : "institution"} id={record.id} status={record.status}>
                    <InstitutionForm
                      divisions={divisions}
                      districts={districts}
                      upazilas={upazilas}
                      categories={categories}
                      userId={userId}
                      record={record}
                    />
                  </RecordActions>
                </td>
              </tr>
            ))}
            {managedRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {query ? "No records match your search." : "No records yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination
        meta={meta}
        hrefFor={(page) => {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (page > 1) params.set("page", String(page));
          const search = params.toString();
          return search ? `${adminPath}?${search}` : adminPath;
        }}
      />
    </>
  );
}
