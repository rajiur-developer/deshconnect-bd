import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { listSavedPlaces } from "@/services/places";
import { listPosts, listUserComments } from "@/services/community";
import { listNotifications } from "@/services/notifications";
import { listUserBloodRequests } from "@/services/blood";
import { AccountShell } from "@/components/layout/account-shell";
import { Badge, Card } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

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
  const stats = [
    { label: "Saved places", value: saved.length, href: "/saved", icon: "save" as const, tint: "bg-sky-50 text-sky-700" },
    { label: "Your posts", value: posts.length, href: "/my-posts", icon: "message" as const, tint: "bg-violet-50 text-violet-700" },
    { label: "Your comments", value: comments.length, href: "/my-comments", icon: "edit" as const, tint: "bg-amber-50 text-amber-700" },
    { label: "Unread notifications", value: unreadCount, href: "/notifications", icon: "bell" as const, tint: "bg-blue-50 text-blue-700" },
    { label: "Active blood requests", value: activeRequests, href: "/my-blood-requests", icon: "droplet" as const, tint: "bg-rose-50 text-rose-700" },
  ];
  const quickLinks = [
    { href: "/places", label: "Explore places", icon: "map-pin" as const },
    { href: "/blood-donation", label: "Blood donation", icon: "droplet" as const },
    { href: "/community", label: "Community", icon: "users" as const },
    { href: "/news", label: "Latest news", icon: "book" as const },
  ];

  return (
    <AccountShell user={user} title="Dashboard" description="Your DeshConnect activity, saved places and community updates in one place." minimalDashboard>
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-6 text-white shadow-lg shadow-brand-900/15 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-brand-300/15 blur-3xl" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-100">Your personal space</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back, {user.fullName || user.username}!</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-50 sm:text-base">Keep track of your activity, discover useful places and stay connected with your community.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/profile" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50">View profile</Link>
          <Link href="/settings" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Account settings</Link>
        </div>
      </div></div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold text-slate-950">Your activity</h2><p className="mt-1 text-sm text-slate-500">A quick overview of your account.</p></div>
        <Badge tone="brand">{unreadCount} unread</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <div className="flex items-start justify-between gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.tint}`}><Icon name={stat.icon} className="h-5 w-5" /></span>
              <Icon name="arrow-right" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-700" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-7 border border-slate-200/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">Quick access</h2><p className="mt-1 text-sm text-slate-500">Jump to the tools you use most.</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name="arrow-right" className="h-4 w-4" /></span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition ${link.href === "/blood-donation" ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50"}`}>
              <Icon name={link.icon} className="h-5 w-5" />{link.label}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="mt-6 border border-slate-200/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="font-bold text-slate-950">Recent notifications</h2><p className="mt-1 text-sm text-slate-500">Your latest account and community updates.</p></div>
          <Link href="/notifications" className="shrink-0 text-sm font-bold text-brand-700 hover:text-brand-800">View all →</Link>
        </div>
        <ul className="mt-4 space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <li key={notification.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-700 shadow-sm"><Icon name="bell" className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{notification.title}</p><p className="mt-1 text-sm leading-5 text-slate-600">{notification.body}</p></div>
              {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
            </li>
          ))}
          {notifications.length === 0 && <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon name="bell" className="h-5 w-5" /></span><p className="mt-3 text-sm font-semibold text-slate-800">You’re all caught up</p><p className="mt-1 text-sm text-slate-500">New notifications will appear here.</p></li>}
        </ul>
      </Card>
    </AccountShell>
  );
}
