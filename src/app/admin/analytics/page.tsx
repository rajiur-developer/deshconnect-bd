import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge";
import { listAuditLogs } from "@/services/audit";
import { listAdminUsers } from "@/services/users";

export const metadata = { title: "Website Analytics | DeshConnect Admin" };
export const dynamic = "force-dynamic";

type RangeKey = "7d" | "30d" | "90d";

const ranges: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

async function countRecords(table: string) {
  try {
    const result = await insforgeSelectMany(table, { select: "id", limit: "1" });
    return result.count ?? 0;
  } catch {
    return null;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function Metric({ label, value, detail, tone = "emerald" }: { label: string; value: string | number; detail: string; tone?: string }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${tones[tone] ?? tones.emerald}`}>Live data</span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export default async function WebsiteAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const selectedRange: RangeKey = ranges.some((item) => item.key === params.range) ? (params.range as RangeKey) : "30d";
  const days = ranges.find((item) => item.key === selectedRange)!.days;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const [usersResult, users, logs, places, institutions, hospitals, businesses, news, posts, comments, messages, donors, requests] = await Promise.all([
    insforgeSelectMany("profiles", { select: "id,created_at", order: "created_at.desc", limit: "1000" }),
    listAdminUsers(),
    listAuditLogs(1000),
    countRecords("places"),
    countRecords("institutions"),
    countRecords("hospitals"),
    countRecords("businesses"),
    countRecords("news"),
    countRecords("posts"),
    countRecords("comments"),
    countRecords("messages"),
    countRecords("blood_donors"),
    countRecords("blood_requests"),
  ]);

  const registrationRows = usersResult.data ?? [];
  const registrations = registrationRows.filter((row: any) => {
    const date = new Date(row.created_at);
    return Number.isFinite(date.getTime()) && date >= start && date <= now;
  });
  const filteredLogs = logs.filter((log) => {
    const date = new Date(log.createdAt);
    return Number.isFinite(date.getTime()) && date >= start && date <= now;
  });

  const chart = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const count = registrations.filter((row: any) => String(row.created_at).slice(0, 10) === key).length;
    return { key, count, label: days === 7 ? date.toLocaleDateString("en-US", { weekday: "short" }) : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
  const peak = Math.max(1, ...chart.map((item) => item.count));
  const featureRows = [
    { label: "Places", value: places, href: "/admin/places" },
    { label: "Institutions", value: institutions, href: "/admin/institutions" },
    { label: "Hospitals", value: hospitals, href: "/admin/hospitals" },
    { label: "Businesses", value: businesses, href: "/admin/businesses" },
    { label: "News articles", value: news, href: "/admin/news?view=all" },
    { label: "Community posts", value: posts, href: "/admin/community" },
    { label: "Comments", value: comments, href: "/admin/community" },
    { label: "Messages", value: messages, href: "/messages" },
    { label: "Blood donors", value: donors, href: "/admin/blood-donors" },
    { label: "Blood requests", value: requests, href: "/admin/blood-requests" },
  ];
  const knownFeatures = featureRows.filter((item) => item.value !== null);
  const maxFeature = Math.max(1, ...knownFeatures.map((item) => item.value ?? 0));
  const totalUsers = usersResult.count ?? users.length;

  return (
    <main className="min-w-0 space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">DeshConnect / Admin insights</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Website Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">Understand account growth and activity across your community platform.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
            <p className="text-xs text-emerald-100/70">Report period</p>
            <p className="mt-1 font-semibold">{start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – {now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-2" aria-label="Analytics date range">
          {ranges.map((range) => (
            <Link key={range.key} href={`/admin/analytics?range=${range.key}`} aria-current={selectedRange === range.key ? "page" : undefined} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedRange === range.key ? "bg-white text-emerald-950 shadow" : "border border-white/20 bg-white/10 text-white hover:bg-white/15"}`}>
              {range.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Registered accounts" value={formatNumber(totalUsers)} detail="Total profiles currently in the database" />
        <Metric label="New registrations" value={formatNumber(registrations.length)} detail={`Accounts created in the last ${days} days`} tone="blue" />
        <Metric label="Admin activities" value={formatNumber(filteredLogs.length)} detail={`Recorded admin actions in ${days} days`} tone="violet" />
        <Metric label="Tracked features" value={formatNumber(knownFeatures.length)} detail="Existing feature records available" tone="amber" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-900">User registration trend</h2><p className="mt-1 text-sm text-slate-500">New accounts created per day</p></div>
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">{days}-day view</span>
          </div>
          {registrations.length === 0 ? (
            <div className="mt-6 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm text-slate-500">No new registrations were found in this period.</div>
          ) : (
            <div className="mt-8 flex h-52 items-end gap-1.5 sm:gap-2" role="img" aria-label={`Daily registrations chart with ${registrations.length} registrations`}>
              {chart.map((item) => (
                <div key={item.key} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">{item.count}</span>
                  <div className="flex w-full flex-1 items-end overflow-hidden rounded-t-md bg-slate-50">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all" style={{ height: `${Math.max(item.count ? 8 : 2, (item.count / peak) * 100)}%` }} title={`${item.label}: ${item.count} registrations`} />
                  </div>
                  {(days === 7 || chart.indexOf(item) % (days === 30 ? 5 : 15) === 0 || chart.indexOf(item) === days - 1) && <span className="whitespace-nowrap text-[9px] text-slate-400">{item.label}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>Based on profile creation dates</span><span className="font-semibold text-slate-700">{registrations.length} new accounts</span></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Feature usage overview</h2>
          <p className="mt-1 text-sm text-slate-500">Current records by platform feature</p>
          <div className="mt-5 space-y-4">
            {featureRows.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><Link href={item.href} className="font-medium text-slate-700 hover:text-emerald-700">{item.label}</Link><span className="font-semibold tabular-nums text-slate-900">{item.value === null ? "—" : formatNumber(item.value)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: item.value === null ? "0%" : `${Math.max(item.value ? 2 : 0, (item.value / maxFeature) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-slate-400">These are total records, not unique visitors or per-period clicks.</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Visitor tracking</h2><p className="mt-1 text-sm text-slate-500">Page views, sessions and visitor sources</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Not connected</span></div>
          <div className="mt-5 rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm font-semibold text-amber-950">Traffic data is not being collected yet</p>
            <p className="mt-1 text-sm leading-6 text-amber-900/80">Unique visitors, page views, returning visitors, traffic sources, device breakdown and location reports need a privacy-friendly analytics event source. No traffic numbers are fabricated here.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Unique visitors", "Page views", "Traffic sources", "Device breakdown"].map((label) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-400">—</p></div>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Recent admin activity</h2><p className="mt-1 text-sm text-slate-500">Latest actions recorded in the audit log</p></div><Link href="/admin/audit-logs" className="text-xs font-semibold text-emerald-700 hover:underline">View all ↗</Link></div>
          {filteredLogs.length ? <ul className="mt-4 divide-y divide-slate-100">{filteredLogs.slice(0, 6).map((log) => <li key={log.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{log.action} · {log.entity}</p><p className="mt-0.5 truncate text-xs text-slate-500">{log.actorName || "Admin"} · {log.outcome}</p></div><time className="shrink-0 text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</time></li>)}</ul> : <div className="mt-4 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No admin activity recorded in this period.</div>}
        </div>
      </section>
      <p className="text-center text-xs text-slate-400">Analytics are visible only inside the existing protected Admin workspace. Data shown above comes from current DeshConnect records.</p>
    </main>
  );
}
