import { InstitutionManager } from "@/components/admin/institution-manager";
import { mapDbRow } from "@/lib/db/insforge";
import { firstParam } from "@/lib/query";
import { parsePage } from "@/lib/utils";
import { requireUser } from "@/lib/auth/current-user";
import { insforgeListAdminHospitals } from "@/services/hospitals";
import { getDirectoryLocationOptions } from "@/services/locations";
import { listContentCategories } from "@/services/content-categories";
import type { Hospital } from "@/types/content";

export const metadata = { title: "Hospitals" };

const REQUIRED_HOSPITAL_CATEGORIES = [
  { value: "hospital", label: "Hospital" },
  { value: "health-centre", label: "Health centre" },
  { value: "diagnostic-centre", label: "Diagnostic centre" },
];

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

  // Do not filter by configured categories: imported hospital rows may use
  // legacy labels such as "Private Hospital", "NGO Clinic" or "Diagnostic Center".
  // Load the complete first admin page and expose every stored category in the editor.
  const { items, meta } = await insforgeListAdminHospitals({
    categories: [],
    q: query,
    page: parsePage(firstParam(params.page)),
    pageSize: 100,
  });

  const categoriesByValue = new Map(
    REQUIRED_HOSPITAL_CATEGORIES.map((category) => [category.value, category]),
  );
  for (const category of hospitalCategories) {
    categoriesByValue.set(category.value, {
      value: category.value,
      label: category.name,
    });
  }
  for (const record of items as Hospital[]) {
    if (record.category && !categoriesByValue.has(record.category)) {
      categoriesByValue.set(record.category, {
        value: record.category,
        label: record.category,
      });
    }
  }
  const categories = Array.from(categoriesByValue.values());

  return (
    <InstitutionManager
      title="Hospitals"
      description="Create and manage hospitals, clinics and health centres."
      isHospital
      records={mapDbRow<Hospital[]>(items)}
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
