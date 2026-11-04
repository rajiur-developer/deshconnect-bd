"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideNewsDeletionAction } from "@/features/news/admin-deletion-actions";
import { AnimatedDialog } from "@/components/ui/animated-dialog";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

type RequestItem = {
  id: string;
  newsId: string;
  newsTitle: string;
  sourceUrl?: string | null;
  requestedAt: string;
  expiresAt: string;
};

type PendingDecision = { id: string; decision: "approved" | "rejected"; title: string };

export function NewsDeletionRequests({ requests }: { requests: RequestItem[] }) {
  const [pending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState<PendingDecision | null>(null);
  const router = useRouter();
  const { success, error } = useToast();

  function decide() {
    if (!confirmation) return;
    const current = confirmation;
    setConfirmation(null);
    startTransition(async () => {
      try {
        const result = await decideNewsDeletionAction(current.id, current.decision);
        if (!result.ok) {
          error(result.error ?? "The deletion request could not be processed.");
          return;
        }
        success(current.decision === "approved" ? "News permanently deleted." : "Deletion request rejected. News remains published.");
        router.refresh();
      } catch {
        error("The deletion request could not be processed. Please try again.");
      }
    });
  }

  const approving = confirmation?.decision === "approved";

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="font-semibold text-slate-900">{request.newsTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">Expiry reached: {new Date(request.expiresAt).toLocaleString("en-BD")}</p>
            <p className="text-xs text-slate-500">Approval requested: {new Date(request.requestedAt).toLocaleString("en-BD")}</p>
            {request.sourceUrl && <a href={request.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-700 underline underline-offset-2">Open original source</a>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={() => setConfirmation({ id: request.id, decision: "approved", title: request.newsTitle })} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50">
                <Icon name="trash" className="h-4 w-4" /> Approve &amp; delete
              </button>
              <button type="button" disabled={pending} onClick={() => setConfirmation({ id: request.id, decision: "rejected", title: request.newsTitle })} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                <Icon name="close" className="h-4 w-4" /> Reject &amp; keep news
              </button>
            </div>
          </article>
        ))}
        {!requests.length && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No news deletion approvals are waiting.</p>}
      </div>

      <AnimatedDialog open={Boolean(confirmation)} onClose={() => setConfirmation(null)} label="Confirm news deletion decision" panelClassName="max-w-md p-0">
        {confirmation && (
          <div className="p-6 sm:p-7">
            <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${approving ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
              <Icon name={approving ? "trash" : "alert"} className="h-6 w-6" />
            </div>
            <h2 className="pr-7 text-lg font-bold text-slate-900">{approving ? "Confirm permanent deletion" : "Reject deletion request?"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {approving ? "This will permanently remove the news post from the database and website. This action cannot be undone." : "The deletion request will be rejected and the news post will remain published."}
            </p>
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">{confirmation.title}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmation(null)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Icon name="close" className="h-4 w-4" /> Cancel
              </button>
              <button type="button" disabled={pending} onClick={decide} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${approving ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-700 hover:bg-slate-800"}`}>
                {approving && <Icon name="trash" className="h-4 w-4" />}
                {approving ? "Yes, delete news" : "Confirm rejection"}
              </button>
            </div>
          </div>
        )}
      </AnimatedDialog>
    </>
  );
}
