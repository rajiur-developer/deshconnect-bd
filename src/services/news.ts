import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { addTextSearch, makePageMeta } from "@/lib/insforge-query";
import { listContentCategories } from "@/services/content-categories";

export async function insforgeListNews(query: {
  q?: string;
  category?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  sort?: "relevance" | "name" | "newest" | "rating";
  page?: number;
  pageSize?: number;
  authorId?: string;
  includeAll?: boolean;
  status?: string;
}) {
  const params: Record<string, string> = {};
  if (query.status) params["status"] = `eq.${query.status}`;
  else if (!query.includeAll) params["status"] = "eq.published";
  if (query.authorId) params["author_id"] = `eq.${query.authorId}`;
  if (query.category) params["category"] = `eq.${query.category}`;
  addTextSearch(params, query.q, ["title", "excerpt", "body"]);
  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 9;
  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();
  params["order"] = query.sort === "name" ? "title.asc" : "fetched_at.desc.nullslast,published_at.desc";

  const [{ data, count }, categories] = await Promise.all([
    insforgeSelectMany("news", params),
    listContentCategories("news"),
  ]);
  const categoryNames = new Map(categories.map((category) => [category.value, category.name]));
  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      body: r.body,
      image: r.image,
      category: r.category,
      categoryName: categoryNames.get(r.category) ?? r.category,
      authorId: r.author_id,
      source: r.source,
      status: r.status,
      publishedAt: r.published_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
    })),
    meta: makePageMeta(count, page, pageSize),
  };
}

export async function insforgeGetNewsBySlug(slug: string) {
  const data = await insforgeSelectOne("news", { slug: `eq.${slug}` });
  if (!data) return null;
  const categories = await listContentCategories("news");
  const categoryName = categories.find((category) => category.value === data.category)?.name ?? data.category;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    image: data.image,
    category: data.category,
    categoryName,
    authorId: data.author_id,
    source: data.source,
    status: data.status,
    publishedAt: data.published_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
  };
}

export async function insforgeCreateNewsArticle(input: {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  category: string;
  authorId: string;
  source?: string;
  status?: string;
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
}) {
  const { data, error } = await insforgeInsert("news", {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    image: input.image,
    category: input.category,
    author_id: input.authorId,
    division_id: input.divisionId ?? null,
    district_id: input.districtId ?? null,
    upazila_id: input.upazilaId ?? null,
    source: input.source,
    status: input.status || "published",
    published_at: input.status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw error;
  return data;
}

// Wrapper exports for backward compatibility
export const submitNews = insforgeCreateNewsArticle;
export const getNewsBySlug = insforgeGetNewsBySlug;
export const listNews = insforgeListNews;
export async function setNewsStatus(id: string, status: string) {
  const { error } = await insforgeUpdate("news", id, { status, updated_at: new Date().toISOString() });
  if (error) throw error;
}
