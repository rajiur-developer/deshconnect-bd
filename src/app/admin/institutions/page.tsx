import { InstitutionManager } from "@/components/admin/institution-manager";
import { mapDbRow } from "@/lib/db/insforge";
import { firstParam } from "@/lib/query";
import { parsePage } from "@/lib/utils";
import { requireUser } from "@/lib/auth/current-user";
import { insforgeListAdminInstitutions } from "@/services/institutions";
import { listContentCategories } from "@/services/content-categories";
import { getDirectoryLocationOptions } from "@/services/locations";
import type { Institution } from "@/types/content";

export const metadata = { title: "Institutions" };

export default async function AdminInstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = firstParam(params.q)?.trim().slice(0, 100) ?? "";
  const [options, user, allCategories] = await Promise.all([
    getDirectoryLocationOptions(),
    requireUser("/admin/institutions"),
    listContentCategories("institution"),
  ]);
  const categories = allCategories
    .filter((category) => {
      const value = category.value.toLowerCase().replace(/[^a-z0-9]/g, "");
      const name = category.name.toLowerCase();
      return !(
        ["hospital", "healthcare", "healthcentre", "healthcenter", "clinic", "diagnosticcenter"].includes(value) ||
        /hospital|health\s*care|health\s*cent(re|er)|clinic|diagnostic\s*cent(re|er)/i.test(name)
      );
    })
    .map((category) => ({ value: category.value, label: category.name }));
  const { items, meta } = await insforgeListAdminInstitutions({
    categories: categories.map((category) => category.value),
    q: query,
    page: parsePage(firstParam(params.page)),
  });

  return (
    <InstitutionManager
      title="Institutions"
      description="Create and manage schools, colleges, madrasahs, universities and other educational institutions."
      isHospital={false}
      records={mapDbRow<Institution[]>(items)}
      adminPath="/admin/institutions"
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
