import { InstitutionManager } from "@/components/admin/institution-manager";
import { mapDbRow } from "@/lib/db/insforge";
import { firstParam } from "@/lib/query";
import { parsePage } from "@/lib/utils";
import { requireUser } from "@/lib/auth/current-user";
import { insforgeListAdminInstitutions } from "@/services/institutions";
import { getDirectoryLocationOptions } from "@/services/locations";
import { listContentCategories } from "@/services/content-categories";
import type { Institution } from "@/types/content";

export const metadata = { title: "Hospitals" };

export default async function AdminHospitalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim().slice(0, 100) ?? "";
  const [options, user, hospitalCategories] = await Promise.all([
    getDirectoryLocationOptions(),
    requireUser("/admin/hospitals"),
    listContentCategories("hospital"),
  ]);
  const categories = hospitalCategories.map((category) => ({ value: category.value, label: category.name }));
  const { items, meta } = await insforgeListAdminInstitutions({
    categories: categories.map((category) => category.value),
    q: query,
    page: parsePage(firstParam(params.page)),
  });

  return (
    <InstitutionManager
      title="Hospitals"
      description="Create and manage hospitals, clinics and health centres."
      isHospital
      records={mapDbRow<Institution[]>(items)}
      adminPath="/admin/hospitals"
      query={query}
      meta={meta}
      categories={categories}
      divisions={options.divisions}
      districts={options.districts}
      upazilas={options.upazilas}
      userId={user.id}
    />
  );
}
