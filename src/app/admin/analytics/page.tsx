import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge";
import { listAuditLogs } from "@/services/audit";

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

function Metric({
  label,
  value,
  detail,
  tone,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: "mint" | "blue" | "violet" | "amber";
  icon: string;
  index: number;
}) {
  return (
    <article className="dc-analytics-metric dc-analytics-reveal" style={{ animationDelay: `${index * 85}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <span className={`dc-analytics-icon dc-analytics-icon--${tone}`} aria-hidden="true">{icon}</span>
        <span className="dc-analytics-live"><span /> Live data</span>
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[.13em] text-slate-500">{label}</p>
      <p className="dc-analytics-value">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
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

  const [usersResult, logs, places, institutions, hospitals, businesses, news, posts, comments, messages, donors, requests] = await Promise.all([
    insforgeSelectMany("public_profiles", { select: "id,created_at", order: "created_at.desc", limit: "1000" }),
    listAuditLogs(1000).catch(() => []),
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
    { label: "Places", value: places, href: "/admin/places", icon: "⌖" },
    { label: "Institutions", value: institutions, href: "/admin/institutions", icon: "▦" },
    { label: "Hospitals", value: hospitals, href: "/admin/hospitals", icon: "+" },
    { label: "Businesses", value: businesses, href: "/admin/businesses", icon: "◇" },
    { label: "News articles", value: news, href: "/admin/news?view=all", icon: "▤" },
    { label: "Community posts", value: posts, href: "/admin/community", icon: "◎" },
    { label: "Comments", value: comments, href: "/admin/community", icon: "↳" },
    { label: "Messages", value: messages, href: "/messages", icon: "✉" },
    { label: "Blood donors", value: donors, href: "/admin/blood-donors", icon: "♥" },
    { label: "Blood requests", value: requests, href: "/admin/blood-requests", icon: "＋" },
  ];
  const knownFeatures = featureRows.filter((item) => item.value !== null);
  const maxFeature = Math.max(1, ...knownFeatures.map((item) => item.value ?? 0));
  const totalUsers = usersResult.count ?? registrationRows.length;

  return (
    <main className="dc-analytics min-w-0 space-y-6 pb-10">
      <section className="dc-analytics-hero dc-analytics-reveal">
        <div className="dc-analytics-orb dc-analytics-orb--one" />
        <div className="dc-analytics-orb dc-analytics-orb--two" />
        <div className="relative z-10 flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <div className="dc-analytics-eyebrow"><span className="dc-analytics-eyebrow-dot" /> DESHCONNECT <span className="text-white/35">/</span> ADMIN INTELLIGENCE</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.8rem]">Website Analytics<span className="text-emerald-300">.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">A clear picture of your platform growth, community activity and content ecosystem.</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-emerald-50/70">
              <span className="dc-analytics-secure">✦ Admin overview</span>
              <span>Updated {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
          </div>
          <div className="dc-analytics-period">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100/60">Reporting period</p>
            <p className="mt-2 text-sm font-bold text-white">{start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – {now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            <div className="mt-4 flex rounded-xl border border-white/10 bg-black/15 p-1" aria-label="Analytics date range">
              {ranges.map((range) => (
                <Link key={range.key} href={`/admin/analytics?range=${range.key}`} aria-current={selectedRange === range.key ? "page" : undefined} className={`dc-analytics-range ${selectedRange === range.key ? "is-active" : ""}`}>
                  {range.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="dc-analytics-hero-foot"><span>INSIGHTS THAT MOVE YOUR COMMUNITY FORWARD</span><span>DESHCONNECT ANALYTICS <b>✳</b></span></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Registered accounts" value={formatNumber(totalUsers)} detail="Total profiles currently in the database" tone="mint" icon="♙" index={0} />
        <Metric label="New registrations" value={formatNumber(registrations.length)} detail={`Accounts created in the last ${days} days`} tone="blue" icon="↗" index={1} />
        <Metric label="Admin activities" value={formatNumber(filteredLogs.length)} detail={`Recorded admin actions in ${days} days`} tone="violet" icon="◷" index={2} />
        <Metric label="Tracked features" value={formatNumber(knownFeatures.length)} detail="Existing feature records available" tone="amber" icon="◈" index={3} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.85fr)]">
        <div className="dc-analytics-panel dc-analytics-reveal">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="dc-analytics-kicker">GROWTH OVER TIME</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">User registration trend</h2><p className="mt-1 text-sm text-slate-500">New accounts created per day</p></div>
            <span className="dc-analytics-chart-badge"><span /> {days}-day view</span>
          </div>
          {registrations.length === 0 ? (
            <div className="dc-analytics-empty mt-7"> <span>⌁</span><p>No new registrations were found in this period.</p></div>
          ) : (
            <div className="dc-analytics-chart mt-8" role="img" aria-label={`Daily registrations chart with ${registrations.length} registrations`}>
              {chart.map((item, index) => (
                <div key={item.key} className="dc-analytics-bar-group" title={`${item.label}: ${item.count} registrations`}>
                  <span className="dc-analytics-bar-value">{item.count}</span>
                  <div className="dc-analytics-bar-track"><div className="dc-analytics-bar" style={{ height: `${Math.max(item.count ? 7 : 2, (item.count / peak) * 100)}%`, animationDelay: `${Math.min(index * 12, 700)}ms` }} /></div>
                  {(days === 7 || index % (days === 30 ? 5 : 15) === 0 || index === days - 1) && <span className="dc-analytics-bar-label">{item.label}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="dc-analytics-panel-foot"><span>Based on profile creation dates</span><strong>{registrations.length} new accounts</strong></div>
        </div>

        <div className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "100ms" }}>
          <div className="dc-analytics-kicker">CONTENT ECOSYSTEM</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Feature overview</h2><p className="mt-1 text-sm text-slate-500">Records across platform features</p>
          <div className="mt-6 space-y-[1.05rem]">
            {featureRows.map((item, index) => (
              <div key={item.label} className="dc-analytics-feature" style={{ animationDelay: `${index * 35}ms` }}>
                <div className="mb-2 flex items-center justify-between gap-3"><Link href={item.href} className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-700"><span className="dc-analytics-feature-icon">{item.icon}</span>{item.label}</Link><span className="text-sm font-extrabold tabular-nums text-slate-900">{item.value === null ? "—" : formatNumber(item.value)}</span></div>
                <div className="dc-analytics-progress"><span style={{ width: item.value === null ? "0%" : `${Math.max(item.value ? 2 : 0, (item.value / maxFeature) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-5 text-slate-400">Total records only — not unique visitors or per-period clicks.</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="dc-analytics-panel dc-analytics-reveal">
          <div className="flex items-start justify-between gap-3"><div><div className="dc-analytics-kicker">TRAFFIC INTELLIGENCE</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Visitor tracking</h2><p className="mt-1 text-sm text-slate-500">Page views, sessions and visitor sources</p></div><span className="dc-analytics-status">Not connected</span></div>
          <div className="dc-analytics-notice mt-5"><span className="dc-analytics-notice-icon">⌁</span><div><p className="text-sm font-bold text-amber-950">Traffic data is not being collected yet</p><p className="mt-1 text-sm leading-6 text-amber-900/75">Unique visitors, page views, returning visitors, traffic sources, device breakdown and location reports need a privacy-friendly analytics event source. No traffic numbers are fabricated here.</p></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3">{["Unique visitors", "Page views", "Traffic sources", "Device breakdown"].map((label) => <div key={label} className="dc-analytics-placeholder"><p>{label}</p><strong>—</strong></div>)}</div>
        </div>
        <div className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start justify-between gap-3"><div><div className="dc-analytics-kicker">ADMIN AUDIT</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Recent admin activity</h2><p className="mt-1 text-sm text-slate-500">Latest actions recorded in the audit log</p></div><Link href="/admin/audit-logs" className="dc-analytics-text-link">View all ↗</Link></div>
          {filteredLogs.length ? <ul className="dc-analytics-activity mt-4">{filteredLogs.slice(0, 6).map((log) => <li key={log.id}><span className="dc-analytics-activity-dot" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{log.action} · {log.entity}</p><p className="mt-1 truncate text-xs text-slate-500">{log.actorName || "Admin"} · {log.outcome}</p></div><time>{new Date(log.createdAt).toLocaleDateString()}</time></li>)}</ul> : <div className="dc-analytics-empty mt-5"><span>◷</span><p>No admin activity recorded in this period.</p></div>}
        </div>
      </section>
      <p className="dc-analytics-footnote">Analytics are visible only inside the existing protected Admin workspace. Data shown above comes from current DeshConnect records.</p>
    </main>
  );
}
