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

  const [usersResult, visitorResult, logs, places, institutions, hospitals, businesses, news, posts, comments, messages, donors, requests] = await Promise.all([
    insforgeSelectMany("public_profiles", { select: "id,created_at", order: "created_at.desc", limit: "1000" }),
    insforgeSelectMany("visitor_events", { select: "visitor_key,session_key,path,referrer_host,device_type,country_code,region,created_at", created_at: `gte.${start.toISOString()}`, order: "created_at.desc", limit: "10000" }).catch(() => ({ data: [], error: null, count: 0 })),
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
  const visitorRows = visitorResult.data ?? [];
  const uniqueVisitors = new Set(visitorRows.map((row: any) => row.visitor_key)).size;
  const uniqueSessions = new Set(visitorRows.map((row: any) => row.session_key)).size;
  const sessionsPerVisitor = new Map<string, Set<string>>();
  for (const row of visitorRows) {
    const sessions = sessionsPerVisitor.get(row.visitor_key) ?? new Set<string>();
    sessions.add(row.session_key);
    sessionsPerVisitor.set(row.visitor_key, sessions);
  }
  const returningVisitors = [...sessionsPerVisitor.values()].filter((sessions) => sessions.size > 1).length;
  const pageViews = visitorResult.count ?? visitorRows.length;
  const topPages = [...visitorRows.reduce((map: Map<string, number>, row: any) => map.set(row.path, (map.get(row.path) ?? 0) + 1), new Map<string, number>()).entries()].sort((x, y) => y[1] - x[1]).slice(0, 6);
  const sourceName = (host: string | null) => {
    if (!host) return "Direct";
    if (/google|bing|yahoo|duckduckgo/i.test(host)) return "Organic search";
    if (/facebook|instagram|tiktok|youtube|x\\.com|twitter/i.test(host)) return "Social";
    if (/whatsapp|t\\.me/i.test(host)) return "Messaging";
    return "Referral";
  };
  const sourceCounts = [...visitorRows.reduce((map: Map<string, number>, row: any) => { const key = sourceName(row.referrer_host); map.set(key, (map.get(key) ?? 0) + 1); return map; }, new Map<string, number>()).entries()].sort((x, y) => y[1] - x[1]);
  const deviceCounts = [...visitorRows.reduce((map: Map<string, number>, row: any) => map.set(row.device_type || "unknown", (map.get(row.device_type || "unknown") ?? 0) + 1), new Map<string, number>()).entries()].sort((x, y) => y[1] - x[1]);
  const regionCounts = [...visitorRows.reduce((map: Map<string, number>, row: any) => { const key = [row.region, row.country_code].filter(Boolean).join(", ") || "Unknown"; map.set(key, (map.get(key) ?? 0) + 1); return map; }, new Map<string, number>()).entries()].sort((x, y) => y[1] - x[1]).slice(0, 6);
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
    const count = visitorRows.filter((row: any) => String(row.created_at).slice(0, 10) === key).length;
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
        <Metric label="Unique visitors" value={formatNumber(uniqueVisitors)} detail={`Anonymous browsers in the last ${days} days`} tone="mint" icon="♙" index={0} />
        <Metric label="Page views" value={formatNumber(pageViews)} detail="Recorded public page visits" tone="blue" icon="↗" index={1} />
        <Metric label="Visitor sessions" value={formatNumber(uniqueSessions)} detail="Sessions with a 30-minute idle timeout" tone="violet" icon="◷" index={2} />
        <Metric label="Returning visitors" value={formatNumber(returningVisitors)} detail="Visitors with more than one session in this period" tone="amber" icon="↻" index={3} />
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
            <div><div className="dc-analytics-kicker">GROWTH OVER TIME</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Visitor traffic trend</h2><p className="mt-1 text-sm text-slate-500">Anonymous page views recorded per day</p></div>
            <span className="dc-analytics-chart-badge"><span /> {days}-day view</span>
          </div>
          {registrations.length === 0 ? (
            <div className="dc-analytics-empty mt-7"> <span>⌁</span><p>No visitor page views were recorded in this period.</p></div>
          ) : (
            <div className="dc-analytics-chart mt-8" role="img" aria-label={`Daily page views chart with ${pageViews} page views`}>
              {chart.map((item, index) => (
                <div key={item.key} className="dc-analytics-bar-group" title={`${item.label}: ${item.count} registrations`}>
                  <span className="dc-analytics-bar-value">{item.count}</span>
                  <div className="dc-analytics-bar-track"><div className="dc-analytics-bar" style={{ height: `${Math.max(item.count ? 7 : 2, (item.count / peak) * 100)}%`, animationDelay: `${Math.min(index * 12, 700)}ms` }} /></div>
                  {(days === 7 || index % (days === 30 ? 5 : 15) === 0 || index === days - 1) && <span className="dc-analytics-bar-label">{item.label}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="dc-analytics-panel-foot"><span>Based on anonymous page-view events</span><strong>{pageViews} page views</strong></div>
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
          <div className="flex items-start justify-between gap-3"><div><div className="dc-analytics-kicker">TRAFFIC INTELLIGENCE</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Visitor tracking</h2><p className="mt-1 text-sm text-slate-500">Anonymous page views, visitors and sessions</p></div><span className="dc-analytics-status">{visitorRows.length ? "Collecting data" : "Waiting for visits"}</span></div>
          <div className="dc-analytics-notice mt-5"><span className="dc-analytics-notice-icon">⌁</span><div><p className="text-sm font-bold text-emerald-950">Login-free tracking is enabled</p><p className="mt-1 text-sm leading-6 text-emerald-900/75">Public visitors are counted automatically. A random first-party cookie identifies returning browsers; no name, email, raw IP address or precise location is stored.</p></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3">{[{label:"Unique visitors",value:uniqueVisitors},{label:"Page views",value:pageViews},{label:"Sessions",value:uniqueSessions},{label:"Returning visitors",value:returningVisitors}].map((item) => <div key={item.label} className="dc-analytics-placeholder"><p>{item.label}</p><strong>{formatNumber(item.value)}</strong></div>)}</div>
          <p className="mt-4 text-[11px] leading-5 text-slate-400">Visitors are identified by a pseudonymous first-party ID. Repeat visits to the same page within one minute are deduplicated.</p>
        </div>
        <div className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start justify-between gap-3"><div><div className="dc-analytics-kicker">ADMIN AUDIT</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Recent admin activity</h2><p className="mt-1 text-sm text-slate-500">Latest actions recorded in the audit log</p></div><Link href="/admin/audit-logs" className="dc-analytics-text-link">View all ↗</Link></div>
          {filteredLogs.length ? <ul className="dc-analytics-activity mt-4">{filteredLogs.slice(0, 6).map((log) => <li key={log.id}><span className="dc-analytics-activity-dot" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{log.action} · {log.entity}</p><p className="mt-1 truncate text-xs text-slate-500">{log.actorName || "Admin"} · {log.outcome}</p></div><time>{new Date(log.createdAt).toLocaleDateString()}</time></li>)}</ul> : <div className="dc-analytics-empty mt-5"><span>◷</span><p>No admin activity recorded in this period.</p></div>}
        </div>
      </section>
      <section className="dc-analytics-audience-grid" aria-label="Visitor pages, sources, devices and locations">
        <article className="dc-analytics-panel dc-analytics-reveal">
          <div className="dc-analytics-kicker">CONTENT DISCOVERY</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Top pages</h2><p className="mt-1 text-sm text-slate-500">Most visited routes in the selected period</p>
          {topPages.length ? <div className="mt-5 space-y-3">{topPages.map(([path, count]) => <div key={path} className="dc-analytics-muted-row"><span className="truncate pr-3">{path}</span><strong>{formatNumber(count)} views</strong></div>)}</div> : <div className="dc-analytics-report-empty mt-5"><span className="dc-analytics-report-symbol">↗</span><div><p className="text-sm font-bold text-slate-700">No page views yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Public routes will appear here as visitors browse the website.</p></div></div>}
        </article>
        <article className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "80ms" }}>
          <div className="dc-analytics-kicker">ACQUISITION CHANNELS</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Traffic sources</h2><p className="mt-1 text-sm text-slate-500">Where visitors discover DeshConnect</p>
          {sourceCounts.length ? <div className="mt-5 space-y-3">{sourceCounts.map(([source, count]) => <div key={source} className="dc-analytics-muted-row"><span>{source}</span><strong>{formatNumber(count)}</strong></div>)}</div> : <div className="dc-analytics-report-empty mt-5"><span className="dc-analytics-report-symbol">◎</span><div><p className="text-sm font-bold text-slate-700">No referrer data yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Direct, search, social and referral sources appear when referrer information is available.</p></div></div>}
        </article>
        <article className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "140ms" }}>
          <div className="dc-analytics-kicker">DEVICE BREAKDOWN</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Visitor devices</h2><p className="mt-1 text-sm text-slate-500">Device categories from browser user-agent strings</p>
          {deviceCounts.length ? <div className="mt-5 space-y-3">{deviceCounts.map(([device, count]) => <div key={device} className="dc-analytics-muted-row"><span className="capitalize">{device}</span><strong>{formatNumber(count)}</strong></div>)}</div> : <p className="mt-5 text-sm text-slate-500">Device data will appear after the first page view.</p>}
        </article>
        <article className="dc-analytics-panel dc-analytics-reveal" style={{ animationDelay: "180ms" }}>
          <div className="dc-analytics-kicker">AUDIENCE GEOGRAPHY</div><h2 className="mt-1 text-lg font-extrabold text-slate-900">Regional audience</h2><p className="mt-1 text-sm text-slate-500">Approximate country and region reported by the hosting edge</p>
          {regionCounts.length ? <div className="mt-5 space-y-3">{regionCounts.map(([region, count]) => <div key={region} className="dc-analytics-muted-row"><span className="truncate pr-3">{region}</span><strong>{formatNumber(count)}</strong></div>)}</div> : <p className="mt-5 text-sm text-slate-500">Regional information is not available yet. Precise location is never collected.</p>}
        </article>
      </section>
      <p className="dc-analytics-footnote">Analytics are visible only inside the existing protected Admin workspace. Data shown above comes from current DeshConnect records.</p>
    </main>
  );
}
