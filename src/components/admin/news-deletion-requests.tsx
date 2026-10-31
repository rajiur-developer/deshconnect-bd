"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideNewsDeletionAction } from "@/features/news/admin-deletion-actions";

type RequestItem = {
  id: string;
  newsId: string;
  newsTitle: string;
  sourceUrl?: string | null;
  requestedAt: string;
  expiresAt: string;
};

export function NewsDeletionRequests({ requests }: { requests: RequestItem[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  function decide(id: string, decision: "approved" | "rejected", title: string) {
    const prompt = decision === "approved"
      ? `Permanently delete “${title}” from the database and website?`
      : `Reject the deletion request for “${title}” and keep it published?`;
    if (!window.confirm(prompt)) return;

    startTransition(async () => {
      const result = await decideNewsDeletionAction(id, decision);
      setMessage(result.error ?? (decision === "approved" ? "News permanently deleted." : "Deletion request rejected. News remains published."));
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {message && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
      {requests.map((request) => (
        <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">{request.newsTitle}</h2>
          <p className="mt-1 text-xs text-slate-500">Expiry reached: {new Date(request.expiresAt).toLocaleString("en-BD")}</p>
          <p className="text-xs text-slate-500">Approval requested: {new Date(request.requestedAt).toLocaleString("en-BD")}</p>
          {request.sourceUrl && <a href={request.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-700 underline">Open original source</a>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => decide(request.id, "approved", request.newsTitle)} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Approve &amp; delete</button>
            <button type="button" disabled={pending} onClick={() => decide(request.id, "rejected", request.newsTitle)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Reject &amp; keep news</button>
          </div>
        </article>
      ))}
      {!requests.length && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No news deletion approvals are waiting.</p>}
    </div>
  );
}
