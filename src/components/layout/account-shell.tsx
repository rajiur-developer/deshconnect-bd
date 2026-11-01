import Link from "next/link";
import type { PublicUser } from "@/types/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/ui/icons";

const NAV_GROUPS = [
  {
    title: "Profile & settings",
    links: [
      { href: "/dashboard", label: "Overview", icon: "home" as const },
      { href: "/profile", label: "My Profile", icon: "users" as const },
      { href: "/profile/edit", label: "Edit Profile", icon: "edit" as const },
      { href: "/settings", label: "Settings", icon: "shield" as const },
    ],
  },
  {
    title: "Activity & content",
    links: [
      { href: "/my-posts", label: "My Posts", icon: "message" as const },
      { href: "/my-comments", label: "My Comments", icon: "edit" as const },
      { href: "/my-reviews", label: "My Reviews", icon: "star" as const },
      { href: "/my-news", label: "My News", icon: "book" as const },
      { href: "/saved", label: "Saved Places", icon: "save" as const },
    ],
  },
  {
    title: "Social",
    links: [
      { href: "/messages", label: "Messages", icon: "mail" as const },
      { href: "/connections", label: "Connections", icon: "users" as const },
      { href: "/friend-requests", label: "Friend Requests", icon: "users" as const },
      { href: "/notifications", label: "Notifications", icon: "bell" as const },
    ],
  },
  {
    title: "Other services",
    links: [
      { href: "/my-blood-requests", label: "Blood Requests", icon: "droplet" as const },
      { href: "/my-reports", label: "My Reports", icon: "flag" as const },
    ],
  },
] as const;

export function AccountShell({
  user,
  title,
  description,
  messagesOnly = false,
  minimalDashboard = false,
  children,
}: {
  user: PublicUser;
  title: string;
  description?: string;
  messagesOnly?: boolean;
  minimalDashboard?: boolean;
  children: React.ReactNode;
}) {
  const navGroups = messagesOnly
    ? [{ title: "Social", links: NAV_GROUPS[2].links.filter((item) => item.href === "/friend-requests") }]
    : NAV_GROUPS;

  return (
    <>
      <PageHeader title={title} description={description} variant={messagesOnly ? "messages" : "default"} />
      {minimalDashboard ? (
        <div className="container-x py-5 sm:py-7">
          <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your account</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{user.fullName || user.username}</p>
              <p className="truncate text-xs text-slate-500">@{user.username}</p>
            </div>
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:pb-0" aria-label="Account shortcuts">
              {[
                { href: "/profile", label: "Profile" },
                { href: "/messages", label: "Messages" },
                { href: "/saved", label: "Saved" },
                { href: "/notifications", label: "Notifications" },
                { href: "/settings", label: "Settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-sm">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <main className="min-w-0">{children}</main>
        </div>
      ) : (
        <div className={`container-x grid gap-6 py-6 sm:gap-8 sm:py-8 ${messagesOnly ? "lg:grid-cols-[13rem_minmax(0,1fr)]" : "lg:grid-cols-[15.5rem_minmax(0,1fr)]"}`}>
          <aside className="min-w-0">
            {!messagesOnly && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name="users" className="h-5 w-5" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{user.fullName || user.username}</p><p className="truncate text-xs text-slate-500">@{user.username}</p></div>
                </div>
              </div>
            )}
            <nav className="rounded-2xl border border-slate-200/80 bg-white/90 p-2.5 shadow-sm backdrop-blur-xl" aria-label="Account navigation">
              {navGroups.map((group) => (
                <div key={group.title} className="py-2 first:pt-1">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.title}</p>
                  <div className="space-y-1">
                    {group.links.map((item) => {
                      const active = item.href === "/profile" && title.toLowerCase() === "my profile";
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active || (messagesOnly && item.href === "/friend-requests") ? "page" : undefined}
                          className={active
                            ? "group relative flex min-h-10 items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm"
                            : "group flex min-h-10 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-200/80 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"}
                        >
                          {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-emerald-600" />}
                          <Icon name={item.icon} className={active ? "h-4 w-4 text-emerald-700" : "h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-700"} />
                          <span>{item.label}</span>
                          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      )}
    </>
  );
}
