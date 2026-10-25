import "server-only";

import { insforgeSelectMany } from "@/lib/insforge";

export type ContentCategorySection = "place" | "news" | "institution";
export type ContentCategory = {
  section: ContentCategorySection;
  value: string;
  name: string;
};

export async function listContentCategories(section: ContentCategorySection): Promise<ContentCategory[]> {
  const { data } = await insforgeSelectMany("content_categories", {
    section: `eq.${section}`,
    order: "name.asc",
    limit: "500",
  });
  return data.map((row) => ({
    section: row.section,
    value: row.value,
    name: row.name,
  }));
}

export async function isContentCategory(section: ContentCategorySection, value: string): Promise<boolean> {
  const categories = await listContentCategories(section);
  return categories.some((category) => category.value === value);
}
