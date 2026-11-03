"use client";
import { usePathname } from "next/navigation";
const PAGE_THEMES: Array<{ theme: string; routes: string[] }> = [
{ theme: "blood", routes: ["/blood-donation", "/my-blood-requests"] },
{ theme: "explore", routes: ["/places", "/districts", "/divisions"] },
{ theme: "education", routes: ["/institutions"] },
{ theme: "health", routes: ["/hospitals"] },
{ theme: "business", routes: ["/businesses"] },
{ theme: "government", routes: ["/government-services"] },
{ theme: "community", routes: ["/community", "/connections", "/messages", "/my-posts", "/my-comments"] },
{ theme: "news", routes: ["/news", "/my-news"] }, ];
function matchesRoute(pathname: string, route: string): boolean {
return pathname === route || pathname.startsWith(`${route}/`); }
export function PageTheme({ children }: { children: React.ReactNode }) {
const pathname = usePathname();
const theme = PAGE_THEMES.find(({ routes }) => routes.some((route) => matchesRoute(pathname, route)))?.theme ?? "default";
return (
<div className="page-theme page-enter" data-page-theme={theme}>
{children}
</div>
); }
