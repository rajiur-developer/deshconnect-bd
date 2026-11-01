import Link from "next/link";
import { insforgeSelectMany } from "@/lib/insforge";
import { listAdminUsers } from "@/services/users";
import { listAuditLogs } from "@/services/audit";
import { listNews } from "@/services/news";
import { formatDate } from "@/lib/utils";
import { Badge, Card } from "@/components/ui/badge";

export const metadata = { title: "Admin Dashboard" };

const metricStyles = {
  green: { icon: "U", surface: "bg-brand-50", ink: "text-brand-700", bar: "bg-brand-500" },
  blue: { icon: "P", surface: "bg-sky-50", ink: "text-sky-700", bar: "bg-sky-500" },
  violet: { icon: "N", surface: "bg-violet-50", ink: "text-violet-700", bar: "bg-violet-500" },
  amber: { icon: "!", surface: "bg-amber-50", ink: "text-amber-700", bar: "bg-amber-500" },
  red: { icon: "!", surface: "bg-rose-50", ink: "text-rose-700", bar: "bg-rose-500" },
  teal: { icon: "D", surface: "bg-teal-50", ink: "text-teal-700", bar: "bg-teal-500" },
};

function MetricCard({ item }) {
  const style = metricStyles[item.tone] ?? metricStyles.green;
  return (
    <Link href={item.href} className="group block rounded-2xl focus-ring">
      <Card className="relative h-full overflow-hidden rounded-2xl border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${style.surface} ${style.ink}`} aria-hidden="true">{style.icon}</span>
          <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">View</span>
        </div>
        <p className="mt-4 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{typeof item.value === "number" ? item.value.toLocaleString() : item.value ?? "—"}</p>
        <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
        <div className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${style.bar}`} />
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [users, logs, newsResult, pendingNewsResult, places, institutions, hospitals, businesses, reports, donors, requests] = await Promise.all([
    listAdminUsers(),
    listAuditLogs(10).catch(() => []),
    listNews({ includeAll: true, page: 1, pageSize: 1 }),
    listNews({ includeAll: true, status: "pending_review", page: 1, pageSize: 1 }),
    insforgeSelectMany("places", { limit: "1" }).then((r) => r.count),
    insforgeSelectMany("institutions", { category: "in.(school,college,madrasah)", limit: "1" }).then((r) => r.count),
    insforgeSelectMany("hospitals", { limit: "1" }).then((r) => r.count),
    insforgeSelectMany("businesses", { limit: "1" }).then((r) => r.count),
    insforgeSelectMany("reports", { status: "eq.open", limit: "1" }).then((r) => r.count).catch(() => null),
    insforgeSelectMany("blood_donors", { limit: "1" }).then((r) => r.count),
    insforgeSelectMany("blood_requests", { status: "eq.active", limit: "1" }).then((r) => r.count),
  ]);

  const newsTotal = newsResult.meta.total;
  const pendingNewsTotal = pendingNewsResult.meta.total;
  const moderators = users.filter((item) => item.role === "moderator");
  const moderatorCount = users.some((item) => Boolean(item.role)) ? moderators.length : null;
  const metrics = [
    { label: "Total users", value: users.length, href: "/admin/users", tone: "green" },
    { label: "Moderators", value: moderatorCount ?? "—", href: "/admin/users", tone: "violet" },
    { label: "Places", value: places, href: "/admin/places", tone: "teal" },
    { label: "Institutions", value: institutions, href: "/admin/institutions", tone: "blue" },
    { label: "Hospitals & health centres", value: hospitals, href: "/admin/hospitals", tone: "red" },
    { label: "Businesses", value: businesses, href: "/admin/businesses", tone: "amber" },
    { label: "News articles", value: newsTotal, href: "/admin/news?view=all", tone: "blue" },
    { label: "Pending news", value: pendingNewsTotal, href: "/admin/news?view=requests", tone: pendingNewsTotal ? "amber" : "green" },
    { label: "Open reports", value: reports ?? "—", href: "/admin/reports", tone: reports == null ? "blue" : reports ? "red" : "green" },
    { label: "Blood donors", value: donors, href: "/admin/blood-donors", tone: "red" },
    { label: "Active blood requests", value: requests, href: "/admin/blood-requests", tone: "violet" },
  ];

  const quickActions = [
    { label: "Review news requests", description: "Check submissions awaiting review", href: "/admin/news?view=requests", mark: "N", tone: "bg-amber-50 text-amber-700" },
    { label: "Manage users", description: "Accounts, roles and status", href: "/admin/users", mark: "U", tone: "bg-sky-50 text-sky-700" },
    { label: "Manage places", description: "Keep the public directory up to date", href: "/admin/places", mark: "P", tone: "bg-teal-50 text-teal-700" },
    { label: "Review reports", description: "Follow up on community reports", href: "/admin/reports", mark: "R", tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="dc-admin-dashboard min-w-0 space-y-6 pb-8 sm:space-y-8">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 px-5 py-7 text-white shadow-lg shadow-brand-950/10 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
              DESHCONNECT ADMIN
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">Dashboard overview</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-100/90 sm:text-base">A clear overview of your platform, content and community activity—all in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/news?view=requests" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-900 shadow-sm hover:bg-brand-50 focus-ring">
              Review news <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{pendingNewsTotal.toLocaleString()}</span>
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-ring">
              Visit website ↗
            </Link>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-4">
          <div><p className="text-xs text-brand-100/75">Users in admin list</p><p className="mt-1 text-xl font-bold">{users.length.toLocaleString()}</p></div>
          <div><p className="text-xs text-brand-100/75">Content records</p><p className="mt-1 text-xl font-bold">{(Number(places ?? 0) + Number(institutions ?? 0) + Number(hospitals ?? 0) + Number(businesses ?? 0) + Number(newsTotal ?? 0)).toLocaleString()}</p></div>
          <div><p className="text-xs text-brand-100/75">Pending news</p><p className="mt-1 text-xl font-bold">{Number(pendingNewsTotal ?? 0).toLocaleString()}</p></div>
          <div><p className="text-xs text-brand-100/75">Open reports</p><p className="mt-1 text-xl font-bold">{reports == null ? "—" : Number(reports).toLocaleString()}</p></div>
        </div>
      </section>

      <section className="dc-admin-quick-actions" aria-labelledby="quick-actions-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div><h2 id="quick-actions-heading" className="text-lg font-bold text-slate-900 sm:text-xl">Quick actions</h2><p className="mt-1 text-sm text-slate-500">Jump straight to the tasks that need attention.</p></div>
          <span className="text-xs font-medium text-slate-400">ADMIN SHORTCUTS</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <Link key={item.label} href={item.href} className="group flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-ring">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${item.tone}`} aria-hidden="true">{item.mark}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800 group-hover:text-brand-700">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span></span>
              <span className="pt-0.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="blood-center-heading" className="scroll-mt-24">
        <div className="overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-rose-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-xl text-rose-700" aria-hidden="true">+</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="blood-center-heading" className="text-lg font-bold text-rose-950 sm:text-xl">Blood Donation Command Center</h2>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-800">Priority</span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-rose-900/70">Keep donor records and blood requests within quick reach. Check active requests first and follow up from the existing management pages.</p>
              </div>
            </div>
            <Link href="/blood-donation" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-800 focus-ring">Open public blood page ↗</Link>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            <Link href="/admin/blood-requests" className="group rounded-2xl border border-rose-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md focus-ring">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">Active blood requests</span><span className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-800">Requests</span></div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-rose-800">{Number(requests ?? 0).toLocaleString()}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Review status and follow up on requests.</p>
              <span className="mt-3 inline-flex text-xs font-bold text-rose-700 group-hover:underline">Manage requests ↗</span>
            </Link>
            <Link href="/admin/blood-donors" className="group rounded-2xl border border-rose-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md focus-ring">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">Donor directory</span><span className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-bold text-rose-800">Donors</span></div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-rose-800">{Number(donors ?? 0).toLocaleString()}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Manage donor records and visibility with consent safeguards.</p>
              <span className="mt-3 inline-flex text-xs font-bold text-rose-700 group-hover:underline">Manage donors ↗</span>
            </Link>
            <Link href="/admin/blood-alerts" className="group rounded-2xl border border-rose-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md focus-ring">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">Blood alerts</span><span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800">Alerts</span></div>
              <p className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">Open alert center</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Go to the existing alert management screen.</p>
              <span className="mt-3 inline-flex text-xs font-bold text-rose-700 group-hover:underline">Manage alerts ↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="dc-admin-metrics" aria-labelledby="metrics-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div><h2 id="metrics-heading" className="text-lg font-bold text-slate-900 sm:text-xl">Platform at a glance</h2><p className="mt-1 text-sm text-slate-500">Select any card to open its management page.</p></div>
          <Badge tone="brand">11 key metrics</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {metrics.map((item) => <MetricCard key={item.label} item={item} />)}
        </div>
      </section>

      <section aria-labelledby="moderators-heading">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700" aria-hidden="true">M</span>
              <div><h2 id="moderators-heading" className="font-bold text-slate-900">Moderator management</h2><p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">{moderators.length} moderator{moderators.length === 1 ? "" : "s"} currently listed. Manage access and responsibilities carefully.</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-ring">Manage users</Link>
              <Link href="/admin/permissions" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800 focus-ring">Permissions settings</Link>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {moderators.length > 0 ? <ul className="flex flex-wrap gap-2">{moderators.map((moderator) => (
              <li key={moderator.id}><Link href={`/profile/${moderator.username}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">{(moderator.fullName || moderator.username || "M").slice(0, 2).toUpperCase()}</span>{moderator.fullName || moderator.username}
              </Link></li>
            ))}</ul> : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center"><p className="text-sm font-medium text-slate-700">No moderators found in the current user list</p><p className="mt-1 text-xs text-slate-500">If you expected moderators here, check the user-list pagination and permissions.</p></div>}
          </div>
        </Card>
      </section>

      <section className="dc-admin-activity" aria-labelledby="activity-heading">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div><h2 id="activity-heading" className="font-bold text-slate-900">Recent admin activity</h2><p className="mt-1 text-sm text-slate-500">Latest recorded administrative actions.</p></div>
            <Link href="/admin/audit-logs" className="inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-ring">View audit log ↗</Link>
          </div>
          {logs.length === 0 ? <div className="px-5 py-10 text-center sm:px-6"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">—</span><p className="mt-3 text-sm font-medium text-slate-700">No activity recorded yet</p><p className="mt-1 text-xs text-slate-500">Administrative actions will appear here when logged.</p></div> : <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-2 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${log.outcome === "success" ? "bg-emerald-50 text-emerald-700" : log.outcome === "denied" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`} aria-hidden="true">{log.outcome === "success" ? "✓" : log.outcome === "denied" ? "!" : "•"}</span>
                  <div className="min-w-0"><p className="break-words text-sm font-semibold text-slate-800">{log.action}</p><p className="mt-1 break-words text-xs leading-5 text-slate-500">{log.actorName} · {log.entity} · {log.entityId}{log.detail ? ` · ${log.detail}` : ""}</p></div>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0"><Badge tone={log.outcome === "success" ? "success" : log.outcome === "denied" ? "accent" : "neutral"}>{log.outcome}</Badge><span className="whitespace-nowrap text-xs text-slate-400">{formatDate(log.createdAt)}</span></div>
              </li>
            ))}
          </ul>}
        </Card>
      </section>
    </div>
  );
}
