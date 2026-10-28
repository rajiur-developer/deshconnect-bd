import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/current-user";
import { listContentCategories } from "@/services/content-categories";

export const metadata = { title: "Content categories" };

export default async function AdminCategoriesPage() {
  const user = await requireUser("/admin/categories");
  if (user.role !== "admin") redirect("/admin");

  const [placeCategories, newsCategories, institutionCategories, hospitalCategories, governmentServiceCategories] = await Promise.all([
    listContentCategories("place"),
    listContentCategories("news"),
    listContentCategories("institution"),
    listContentCategories("hospital"),
    listContentCategories("government-service"),
  ]);

  return (
    <>
      <PageHeader
        title="Content categories"
        description="Manage categories for Places, News, Institutions, Hospitals and Government Services."
      />
      <CategoryManager
        placeCategories={placeCategories}
        newsCategories={newsCategories}
        institutionCategories={institutionCategories}
        hospitalCategories={hospitalCategories}
        governmentServiceCategories={governmentServiceCategories}
      />
    </>
  );
}
