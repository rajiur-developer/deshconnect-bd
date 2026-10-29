import "server-only";

import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";

export async function insforgeListNotifications(userId: string) {
  const { data } = await insforgeSelectMany("notifications", { user_id: `eq.${userId}` });
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    href: r.href,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function insforgeCreateNotification(input: {
  userId: string;
  title: string;
  body?: string;
  href?: string;
}) {
  const { data, error } = await insforgeInsert("notifications", {
    user_id: input.userId,
    title: input.title,
    body: input.body,
    href: input.href,
  });
  if (error) throw error;
  return data;
}

export async function insforgeMarkNotificationRead(id: string, userId: string) {
  const notification = await insforgeSelectOne("notifications", { id: `eq.${id}`, user_id: `eq.${userId}` });
  if (!notification) return;
  await insforgeUpdate("notifications", id, { read: true });
}

export async function insforgeMarkAllNotificationsRead(userId: string) {
  await insforgeUpdate("notifications", `user_id.eq.${userId}`, { read: true });
}

export const listNotifications = insforgeListNotifications;
export async function unreadNotificationCount(userId: string): Promise<number> {
  const { data } = await insforgeSelectMany("notifications", {
    user_id: `eq.${userId}`,
    read: "eq.false",
  });
  return data.length;
}
export async function notify(userId: string, input: { title: string; body?: string; href?: string }) {
  return insforgeCreateNotification({ userId, ...input });
}
export const markNotificationRead = insforgeMarkNotificationRead;
export const markAllNotificationsRead = insforgeMarkAllNotificationsRead;
