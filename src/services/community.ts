import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";
import { makePageMeta } from "@/lib/insforge-query";

export async function insforgeListPosts(query: {
  authorId?: string;
  page?: number;
  pageSize?: number;
  includeNonPublic?: boolean;
  authorIds?: string[];
}) {
  const params: Record<string, string> = {};
  if (!query.includeNonPublic) params["status"] = "eq.visible";
  if (query.authorId) params["author_id"] = `eq.${query.authorId}`;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  params["offset"] = ((page - 1) * pageSize).toString();
  params["limit"] = pageSize.toString();
  params["order"] = "created_at.desc";

  const { data, error, count } = await insforgeSelectMany("posts", params);
  if (error) throw error;
  return {
    items: (data || []).map((r: any) => ({
      id: r.id,
      authorId: r.author_id,
      body: r.body,
      image: r.image,
      imageKey: r.image_key,
      reactions: r.reactions,
      status: r.status,
      divisionId: r.division_id,
      districtId: r.district_id,
      upazilaId: r.upazila_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    meta: makePageMeta(count, page, pageSize),
  };
}

export async function insforgeCreatePost(input: {
  authorId: string;
  body: string;
  image?: string | null;
  reactions?: number;
  status?: string;
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
}) {
  const { data, error } = await insforgeInsert("posts", {
    author_id: input.authorId,
    body: input.body,
    image: input.image,
    reactions: input.reactions ?? 0,
    status: input.status ?? "visible",
    division_id: input.divisionId,
    district_id: input.districtId,
    upazila_id: input.upazilaId,
  });
  if (error) throw error;
  return data;
}

export async function insforgeListUserComments(userId: string) {
  const { data: comments } = await insforgeSelectMany("comments", {
    author_id: `eq.${userId}`,
  });
  if (!comments?.length) return [];

  // Filter comments by visible parent posts in a second query. Passing a
  // relationship filter as a value ("posts: status.eq.visible") produces an
  // invalid PostgREST expression and breaks dashboard/comment pages.
  const postIds = [...new Set(comments.map((row: any) => row.post_id).filter(Boolean))];
  if (!postIds.length) return [];
  const { data: posts } = await insforgeSelectMany("posts", {
    id: `in.(${postIds.join(",")})`,
    status: "eq.visible",
  });
  const visiblePostIds = new Set((posts || []).map((row: any) => row.id));

  return comments.filter((row: any) => visiblePostIds.has(row.post_id)).map((r: any) => ({
    id: r.id,
    postId: r.post_id,
    authorId: r.author_id,
    body: r.body,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function insforgeCreateComment(input: {
  postId: string;
  authorId: string;
  body: string;
  status?: string;
}) {
  const { data, error } = await insforgeInsert("comments", {
    post_id: input.postId,
    author_id: input.authorId,
    body: input.body,
    status: input.status ?? "visible",
  });
  if (error) throw error;
  return data;
}

export async function insforgeCountComments(postId: string) {
  const { count, error } = await insforgeSelectMany("comments", {
    post_id: `eq.${postId}`,
    status: "eq.visible",
  });
  return error ? 0 : count;
}

export async function getPostById(id: string) {
  const row = await insforgeSelectOne("posts", { id: `eq.${id}`, status: "eq.visible" });
  return row ? { id: row.id, authorId: row.author_id, body: row.body, image: row.image, imageKey: row.image_key, reactions: row.reactions ?? 0, status: row.status, divisionId: row.division_id, districtId: row.district_id, upazilaId: row.upazila_id, createdAt: row.created_at, updatedAt: row.updated_at } : null;
}
export async function listComments(postId: string) {
  const { data } = await insforgeSelectMany("comments", { post_id: `eq.${postId}`, status: "eq.visible", order: "created_at.asc" });
  return data.map((row: any) => ({ id: row.id, postId: row.post_id, authorId: row.author_id, body: row.body, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
}
export const countComments = insforgeCountComments;
export const listUserComments = insforgeListUserComments;
export async function listUserReports(userId: string) {
  const { data } = await insforgeSelectMany("reports", { reporter_id: `eq.${userId}`, order: "created_at.desc" });
  return data;
}
export async function listAdminReports() {
  const { data, error } = await insforgeSelectMany("reports", { order: "created_at.desc" });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id, targetType: row.target_type, targetId: row.target_id,
    reporterId: row.reporter_id, reason: row.reason, details: row.details,
    status: row.status, resolution: row.resolution, createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
export async function listAdminReviews() {
  const { data, error } = await insforgeSelectMany("reviews", { order: "created_at.desc" });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id, placeId: row.place_id, authorId: row.author_id,
    rating: row.rating, title: row.title, body: row.body, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  }));
}
export async function setReviewStatus(id: string, status: string) {
  const { error } = await insforgeUpdate("reviews", id, { status, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function setReportStatus(id: string, status: string, resolution?: string) {
  const { error } = await insforgeUpdate("reports", id, { status, resolution: resolution ?? null, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Wrapper exports for backward compatibility
export const createPost = insforgeCreatePost;
export const createComment = insforgeCreateComment;
export const listPosts = insforgeListPosts;
export const reactToPost = async (postId: string) => {
  const post = await insforgeSelectOne("posts", { id: `eq.${postId}` });
  if (!post) throw new Error("Post not found");
  const newCount = (post.reactions ?? 0) + 1;
  await insforgeUpdate("posts", postId, { reactions: newCount });
  return newCount;
};
export const reportAction = async ({ targetType, targetId, reporterId, reason, details }: any) => {
  const { data, error } = await insforgeInsert("reports", {
    target_type: targetType,
    target_id: targetId,
    reporter_id: reporterId,
    reason: reason,
    details: details,
  });
  if (error) throw error;
  return { ok: true };
};
export const deletePost = async (postId: string) => {
  await insforgeDelete("posts", postId);
};
export const setPostStatus = async (postId: string, status: string) => {
  await insforgeUpdate("posts", postId, { status, updated_at: new Date().toISOString() });
};
