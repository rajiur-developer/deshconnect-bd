// @ts-nocheck
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";
import { getRolePermissionOverrides } from "@/services/role-permissions";
import { Icon } from "@/components/ui/icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/roles", label: "Roles", icon: "shield" },
  { href: "/admin/permissions", label: "Permissions", icon: "lock" },
  { href: "/admin/locations", label: "Locations", icon: "map-pin" },
  { href: "/admin/places", label: "Places", icon: "map" },
  { href: "/admin/hospitals", label: "Hospitals", icon: "heart-pulse" },
  { href: "/admin/institutions", label: "Institutions", icon: "school" },
  { href: "/admin/categories", label: "Content Categories", icon: "layers" },
  { href: "/admin/tourism", label: "Tourism", icon: "compass" },
  { href: "/admin/businesses", label: "Businesses", icon: "store" },
  { href: "/admin/government-services", label: "Government Services", icon: "landmark" },
  { href: "/admin/news?view=requests", label: "News Requests", icon: "inbox" },
  { href: "/admin/news?view=all", label: "News", icon: "newspaper" },
  { href: "/admin/community", label: "Community", icon: "messages-square" },
  { href: "/admin/blood-donors", label: "Blood Donors", icon: "heart" },
  { href: "/admin/blood-requests", label: "Blood Requests", icon: "droplet" },
  { href: "/admin/blood-alerts", label: "Emergency Alerts", icon: "siren" },
  { href: "/admin/connections", label: "Connections", icon: "network" },
  { href: "/admin/reports", label: "Reports", icon: "flag" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/media", label: "Media", icon: "image" },
  { href: "/admin/notifications", label: "Notifications", icon: "bell" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "clipboard-list" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const overrides = user ? await getRolePermissionOverrides() : {};
  const staff = user && can(user.role, "moderation:posts", overrides);
  if (!user || !staff) redirect("/");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50" data-no-translate>
      <div className="border-b border-slate-200 bg-white">
        <div className="container-x flex min-h-16 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-800 text-white"><Icon name="shield" className="h-5 w-5" /></span>
          <div><p className="font-bold text-slate-950">DeshConnect Admin</p><p className="text-xs capitalize text-slate-500">{user.role} workspace</p></div>
          <Link href="/" className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50"><Icon name="external-link" className="h-4 w-4" /> Visit website</Link>
        </div>
      </div>
      <div className="container-x grid gap-6 py-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="min-w-0">
          <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/10 lg:sticky lg:top-24">
            <div className="px-3 pb-3 pt-2"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p><p className="mt-1 text-sm font-semibold">Manage your platform</p></div>
            <nav className="grid max-h-[42vh] grid-cols-2 gap-1 overflow-y-auto sm:grid-cols-3 lg:max-h-[calc(100vh-190px)] lg:grid-cols-1" aria-label="Admin navigation">
              {NAV.filter((item) => user.role === "admin" || !["/admin/permissions", "/admin/categories"].includes(item.href)).map((item) => (
                <Link key={item.href} href={item.href} className={`group flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition hover:bg-white/10 hover:text-white sm:text-sm ${item.href.startsWith("/admin/blood") ? "text-rose-200 hover:bg-rose-500/15" : "text-slate-300"}`}>
                  <Icon name={item.icon} className={`h-4 w-4 shrink-0 ${item.href.startsWith("/admin/blood") ? "text-rose-300" : "text-slate-400 group-hover:text-brand-300"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-white/10 pt-3"><Link href="/blood-donation" className="flex items-center gap-2 rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-200 hover:bg-rose-500/25"><Icon name="heart" className="h-4 w-4" /> Blood donation page <span className="ml-auto">↗</span></Link></div>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
