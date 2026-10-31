import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";
import { getRolePermissionOverrides } from "@/services/role-permissions";
import { AdminShell } from "@/components/admin/admin-shell";
import type { IconName } from "@/components/ui/icons";

const NAV_GROUPS: { title: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  { title: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: "home" },
    { href: "/admin/analytics", label: "Website Analytics", icon: "globe" },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: "calendar" },
  ]},
  { title: "People & Access", items: [
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/roles", label: "Roles", icon: "shield" },
    { href: "/admin/permissions", label: "Permissions", icon: "shield" },
    { href: "/admin/connections", label: "Connections", icon: "users" },
  ]},
  { title: "Directories", items: [
    { href: "/admin/locations", label: "Locations", icon: "map-pin" },
    { href: "/admin/places", label: "Places", icon: "mountain" },
    { href: "/admin/hospitals", label: "Hospitals", icon: "heart" },
    { href: "/admin/institutions", label: "Institutions", icon: "book" },
    { href: "/admin/categories", label: "Content Categories", icon: "book" },
    { href: "/admin/tourism", label: "Tourism", icon: "globe" },
    { href: "/admin/businesses", label: "Businesses", icon: "store" },
    { href: "/admin/government-services", label: "Government Services", icon: "landmark" },
  ]},
  { title: "Community", items: [
    { href: "/admin/news?view=requests", label: "News Requests", icon: "alert" },
    { href: "/admin/news?view=all", label: "News", icon: "book" },
    { href: "/admin/community", label: "Community", icon: "message" },
    { href: "/admin/reports", label: "Reports", icon: "flag" },
    { href: "/admin/reviews", label: "Reviews", icon: "star" },
    { href: "/admin/media", label: "Media", icon: "image" },
  ]},
  { title: "Blood Donation", items: [
    { href: "/admin/blood-donors", label: "Blood Donors", icon: "heart" },
    { href: "/admin/blood-requests", label: "Blood Requests", icon: "droplet" },
    { href: "/admin/blood-alerts", label: "Emergency Alerts", icon: "alert" },
  ]},
  { title: "System", items: [
    { href: "/admin/notifications", label: "Notifications", icon: "bell" },
    { href: "/admin/settings", label: "Settings", icon: "save" },
  ]},
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const overrides = user ? await getRolePermissionOverrides() : {};
  const staff = user && can(user.role, "moderation:posts", overrides);
  if (!user || !staff) redirect("/");

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      user.role === "admin" || !["/admin/permissions", "/admin/categories"].includes(item.href)
    ),
  })).filter((group) => group.items.length > 0);

  return <AdminShell groups={groups} role={user.role}>{children}</AdminShell>;
}
