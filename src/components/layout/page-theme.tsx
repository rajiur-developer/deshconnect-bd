"use client";
import { useEffect, useRef } from "react";
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
const containerRef = useRef<HTMLDivElement>(null);
const theme = PAGE_THEMES.find(({ routes }) => routes.some((route) => matchesRoute(pathname, route)))?.theme ?? "default";
useEffect(() => {
containerRef.current?.setAttribute("data-page-theme", theme);
}, [theme]);
return (
<div ref={containerRef} key={pathname} className="page-theme page-enter" data-page-theme="default">
{children}
</div>
); }
