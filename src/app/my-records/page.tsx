import { cookies } from "next/headers";
import { TranslatedText } from "@/components/i18n/translated-text";
import { createServerClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/layout/account-shell";
import { RecordForm } from "@/components/records/record-form";
import { requireUser } from "@/lib/auth/current-user";
import { RECORD_ATTACHMENT_BUCKET } from "@/features/records/constants";

export const metadata = { title: "My records", robots: { index: false, follow: false } };

export default async function MyRecordsPage() {
  const user = await requireUser("/my-records");
  const client = await createServerClient({ cookies: await cookies() });
  const { data, error } = await client.database.from("sample_records")
    .select("id,title,category,description,created_at,attachment_url,attachment_key,attachment_name,attachment_mime_type,attachment_size")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) console.error("Could not load the current user's records.", error.message);
  const records = data ?? [];
  const attachmentKeys = records.map((record: any) => record.attachment_key).filter((key: unknown): key is string => typeof key === "string" && key.length > 0);
  const signedUrls = new Map<string, string>();
  if (attachmentKeys.length) {
    const { data: signedData, error: signedError } = await client.storage.from(RECORD_ATTACHMENT_BUCKET).createSignedUrls(attachmentKeys, 3600);
    if (signedError) console.error("Could not create private attachment links.", signedError.message);
    for (const item of signedData ?? []) {
      if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
    }
  }

  return <AccountShell user={user} title="My records" description="Only records owned by your account appear here.">
    <RecordForm userId={user.id} />
    <section className="mt-6 space-y-3" aria-label="Your records">
      {records.map((record: any) => <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">{record.title}</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{record.category}</span>
        </div>
        {record.description && <p className="mt-2 text-sm text-slate-600">{record.description}</p>}
        {record.attachment_key && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {signedUrls.has(record.attachment_key) ? <>
            {String(record.attachment_mime_type ?? "").startsWith("image/") && <a href={signedUrls.get(record.attachment_key)} target="_blank" rel="noreferrer" aria-label={`Open ${record.attachment_name}`}>
              <img src={signedUrls.get(record.attachment_key)} alt={record.attachment_name || "Record attachment"} className="mb-3 max-h-72 max-w-full rounded-lg object-contain" />
            </a>}
            <a href={signedUrls.get(record.attachment_key)} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 underline underline-offset-2">
              {record.attachment_name || "Open attachment"}
            </a>
            <span className="ml-2 text-xs text-slate-500">({Math.max(1, Math.round(Number(record.attachment_size ?? 0) / 1024))} KB)</span>
          </> : <p className="text-sm text-slate-500"><TranslatedText text="Attachment is currently unavailable." /></p>}
        </div>}
      </article>)}
      {records.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600"><TranslatedText text="You have no records yet. Add one above to get started." /></div>}
    </section>
  </AccountShell>;
}
