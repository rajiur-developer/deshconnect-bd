import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { listSavedPlaces } from "@/services/places";
import { listPosts, listUserComments } from "@/services/community";
import { listNotifications } from "@/services/notifications";
import { listUserBloodRequests } from "@/services/blood";
import { AccountShell } from "@/components/layout/account-shell";
import { DashboardSessionWidget } from "@/components/account/dashboard-session-widget";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge, Card } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

function formatNotificationDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [saved, posts, comments, notifications, requests] = await Promise.all([
    listSavedPlaces(user.id),
    listPosts({ authorId: user.id }).then((result) => result.items),
    listUserComments(user.id),
    listNotifications(user.id),
    listUserBloodRequests(user.id),
  ]);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const activeRequests = requests.filter((item) => item.status === "active").length;
  const profileFields = [user.fullName, user.avatar, user.bio, user.divisionId || user.districtId || user.upazilaId];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const stats = [
    { label: "Saved places", value: saved.length, href: "/saved", icon: "save" as const, tint: "bg-sky-50 text-sky-700", detail: "Places bookmarked" },
    { label: "Your posts", value: posts.length, href: "/my-posts", icon: "message" as const, tint: "bg-violet-50 text-violet-700", detail: "Community contributions" },
    { label: "Your comments", value: comments.length, href: "/my-comments", icon: "edit" as const, tint: "bg-amber-50 text-amber-700", detail: "Conversations started" },
    { label: "Unread notifications", value: unreadCount, href: "/notifications", icon: "bell" as const, tint: "bg-blue-50 text-blue-700", detail: "Updates waiting for you" },
    { label: "Active blood requests", value: activeRequests, href: "/my-blood-requests", icon: "droplet" as const, tint: "bg-rose-50 text-rose-700", detail: "Requests needing attention" },
  ];
  const quickLinks = [
    { href: "/places", label: "Explore places", icon: "map-pin" as const, tone: "border-sky-200 bg-sky-50/70 text-sky-800 hover:bg-sky-100" },
    { href: "/blood-donation", label: "Blood donation", icon: "droplet" as const, tone: "border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100" },
    { href: "/community", label: "Community", icon: "users" as const, tone: "border-violet-200 bg-violet-50/70 text-violet-800 hover:bg-violet-100" },
    { href: "/news", label: "Latest news", icon: "book" as const, tone: "border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100" },
  ];

  return (
    <AccountShell user={user} title="Dashboard" description="Your DeshConnect activity, saved places and community updates in one place." minimalDashboard>
      <section className="dc-user-dashboard-hero relative isolate mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 text-white shadow-2xl shadow-emerald-950/15 sm:p-8 lg:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-[28%] -z-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Your personal space
            </div>
            <div className="mt-5 flex items-center gap-4">
              <ProfileAvatar name={user.fullName || user.username} src={user.avatar} storageKey={user.avatarKey} className="h-14 w-14 border-2 border-white/30 text-lg shadow-lg sm:h-16 sm:w-16" textClassName="text-lg" />
              <div className="min-w-0">
                <p className="text-sm text-emerald-100/80">Welcome back,</p>
                <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{user.fullName || user.username}!</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">Your community, your discoveries, and the people who make Bangladesh feel closer — all in one place.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50">View profile <Icon name="arrow-right" className="h-4 w-4" /></Link>
              <Link href="/settings" className="rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">Account settings</Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <DashboardSessionWidget />
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/75">Profile completion</p>
                <span className="text-sm font-bold text-white">{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${profileCompletion}%` }} /></div>
              <Link href="/profile/edit" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 hover:text-white">Complete your profile <Icon name="arrow-right" className="h-3 w-3" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="mb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your overview</p><h2 id="activity-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-950">Activity at a glance</h2><p className="mt-1 text-sm text-slate-500">A live snapshot of your DeshConnect account.</p></div>
          <Badge tone="brand">{unreadCount} unread updates</Badge>
        </div>
        <div className="dc-dashboard-stats grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="dc-dashboard-stat group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${stat.tint}`}><Icon name={stat.icon} className="h-5 w-5" /></span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-700"><Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{stat.value.toLocaleString()}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{stat.label}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-red-600 to-rose-500 p-5 text-white shadow-lg shadow-rose-900/10 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15"><Icon name="droplet" className="h-6 w-6" /></span>
            <div><div className="mb-2 inline-flex rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">Priority · Community support</div><h2 className="text-lg font-bold sm:text-xl">Someone may need your blood donation support</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-rose-50">Explore active requests, find nearby donors, or register to help save a life.</p></div>
          </div>
          <Link href="/blood-donation" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50">Support a donor <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>
      </section>

      <Card className="dc-dashboard-quick mb-8 rounded-2xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Shortcuts</p><h2 className="mt-1 font-bold text-slate-950">Quick access</h2><p className="mt-1 text-sm text-slate-500">Jump straight into the things you care about.</p></div><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon name="arrow-right" className="h-4 w-4" /></span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl border p-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${link.tone}`}><Icon name={link.icon} className="h-5 w-5" />{link.label}<span className="ml-auto"><Icon name="arrow-right" className="h-4 w-4 opacity-60" /></span></Link>)}
        </div>
      </Card>

      <Card className="dc-dashboard-notifications rounded-2xl border border-slate-200/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Stay in the loop</p><h2 className="mt-1 font-bold text-slate-950">Recent notifications</h2><p className="mt-1 text-sm text-slate-500">Your latest account and community updates.</p></div>
          <Link href="/notifications" className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">View all <span aria-hidden="true">→</span></Link>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {notifications.slice(0, 6).map((notification) => {
            const content = <><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${notification.read ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-800"}`}><Icon name="bell" className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-slate-900">{notification.title}</span>{!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-label="Unread" />}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{notification.body}</span><span className="mt-2 block text-xs font-medium text-slate-400">{formatNotificationDate(notification.createdAt)}</span></span></>;
            return <li key={notification.id}>{notification.href ? <Link href={notification.href} className="flex h-full items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/40">{content}</Link> : <div className="flex h-full items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5">{content}</div>}</li>;
          })}
          {notifications.length === 0 && <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center md:col-span-2"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon name="bell" className="h-5 w-5" /></span><p className="mt-3 text-sm font-semibold text-slate-800">You’re all caught up</p><p className="mt-1 text-sm text-slate-500">New notifications will appear here.</p></li>}
        </ul>
      </Card>
    </AccountShell>
  );
}
