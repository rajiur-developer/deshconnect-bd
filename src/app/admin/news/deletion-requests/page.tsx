import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { insforgeSelectMany } from "@/lib/insforge";
import { PageHeader } from "@/components/layout/page-header";
import { NewsDeletionRequests } from "@/components/admin/news-deletion-requests";

export const metadata = { title: "News deletion approvals" };

export default async function NewsDeletionRequestsPage() {
  const user = await requireUser("/admin");
  if (user.role !== "admin" && user.role !== "moderator") {
    return <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">You do not have permission to review news deletion requests.</p>;
  }

  const { data, error } = await insforgeSelectMany("news_deletion_requests", {
    decision: "eq.pending",
    order: "requested_at.asc",
    limit: "500",
  });
  if (error) throw new Error("Could not load news deletion requests.");

  const requests = (data ?? []).map((row: any) => ({
    id: row.id,
    newsId: row.news_id,
    newsTitle: row.news_title,
    sourceUrl: row.source_url,
    requestedAt: row.requested_at,
    expiresAt: row.expires_at,
  }));

  return (
    <>
      <PageHeader title="News deletion approvals" description="Review news items that have reached their 48-hour expiry. News remains visible until you approve deletion." />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">{requests.length} pending approval</span>
        <Link href="/admin/news" className="text-sm font-medium text-brand-700 underline">Back to News Management</Link>
      </div>
      <NewsDeletionRequests requests={requests} />
    </>
  );
}
