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

  // Always include the category values used by the public Hospitals directory.
  // Category configuration may be incomplete, but existing hospital records must
  // still be visible and manageable in the admin panel.
  const categoriesByValue = new Map(
    REQUIRED_HOSPITAL_CATEGORIES.map((category) => [category.value, category]),
  );
  for (const category of hospitalCategories) {
    categoriesByValue.set(category.value, {
      value: category.value,
      label: category.name,
    });
  }
  const categories = Array.from(categoriesByValue.values());

  const { items, meta } = await insforgeListAdminHospitals({
    categories: categories.map((category) => category.value),
    q: query,
    page: parsePage(firstParam(params.page)),
  });

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
