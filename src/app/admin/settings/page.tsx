import { insforgeSelectOne } from "@/lib/insforge"; import { PageHeader } from "@/components/layout/page-header"; import { SettingsForm } from "@/components/admin/admin-client";
export const metadata = { title: "Admin Settings" };
export default async function AdminSettingsPage() {
const settings = await insforgeSelectOne("platform_settings", { id: "eq.platform" }).catch(() => null);
return (
<>
<PageHeader title="Admin Settings" description="Manage website configuration and administrative settings." />
<SettingsForm
initial={{
siteName: settings?.site_name ?? "DeshConnect",
allowPublicPosts: settings?.allow_public_posts ?? true,
requireNewsApproval: settings?.require_news_approval ?? true,
donorDirectoryEnabled: settings?.donor_directory_enabled ?? true,
}}
/>
</>
); }
