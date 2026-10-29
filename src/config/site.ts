// @ts-nocheck
export interface NavItem {
label: string;
href: string;
description?: string; }
/** A top-level nav entry that opens a sub-menu instead of linking anywhere. */ export interface NavGroup {
label: string;
items: NavItem[]; }
export type NavEntry = NavItem | NavGroup;
export function isNavGroup(entry: NavEntry): entry is NavGroup {
return "items" in entry; }
export function isNavPathActive(pathname: string, href: string): boolean {
const path = href.split("?")[0];
return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
export const SITE = {
name: "DeshConnect",
tagline: "Bangladesh's places, Blood Find, Services and people all in one place.",
description:
"DeshConnect is an Information and Community platform for finding Tourist Spots,Blood donors, Educational institutions, Hospitals, Businesses, Government services, News and local activity across Bangladesh.",
get url() {
return process.env.NEXT_PUBLIC_SITE_URL ?? "https://deshconnect-3857.vercel.app";
},
locale: "en-BD",
twitter: "@deshconnect", } as const;
export const PRIMARY_NAV: NavEntry[] = [
{ label: "Home", href: "/", description: "DeshConnect home page" },
{ label: "Tourism", href: "/places", description: "Places to visit in Bangladesh" },
{
label: "Services",
items: [
{ label: "Education", href: "/institutions?category=school", description: "Schools, colleges and madrasahs" },
{ label: "Hospitals", href: "/hospitals", description: "Hospitals and health centres" },
{ label: "Businesses", href: "/businesses", description: "Local businesses and services" },
{ label: "Government Services", href: "/government-services", description: "Public services, offices and required documents" },
],
},
{ label: "Blood Donation", href: "/blood-donation", description: "Find donors and post a request" },
{ label: "Messages", href: "/messages", description: "Message your connections" },
{
label: "Community",
items: [
{ label: "Community Activity", href: "/community", description: "Posts, discussions and local participation" },
{ label: "News", href: "/news", description: "Verified and published news" },
],
}, ];
export const FOOTER_LINKS: { title: string; links: NavItem[] }[] = [
{
title: "Explore",
links: [
{ label: "Places to Visit", href: "/places" },
{ label: "Institutions", href: "/institutions" },
{ label: "Hospitals", href: "/hospitals" },
{ label: "Businesses", href: "/businesses" },
{ label: "Government Services", href: "/government-services" },
],
},
{
title: "Get Involved",
links: [
{ label: "Community Activity", href: "/community" },
{ label: "Blood Donation", href: "/blood-donation" },
{ label: "News", href: "/news" },
{ label: "Submit News", href: "/my-news" },
],
},
{
title: "About",
links: [
{ label: "About", href: "/about" },
{ label: "Contact", href: "/contact" },
{ label: "Privacy Policy", href: "/privacy-policy" },
{ label: "Terms of Use", href: "/terms" },
],
}, ];
export const CATEGORY_SHORTCUTS: (NavItem & { icon: string; blurb: string })[] = [
{ label: "Blood Donation", href: "/blood-donation", icon: "droplet", blurb: "Find donors, post a request", description: "" },
{ label: "Tourism", href: "/places", icon: "mountain", blurb: "Places, heritage and nature", description: "" },
{ label: "Education", href: "/institutions?category=school", icon: "book", blurb: "Schools, colleges and madrasahs", description: "" },
{ label: "Hospitals", href: "/hospitals", icon: "heart", blurb: "Hospitals and health centres", description: "" },
{ label: "Businesses", href: "/businesses", icon: "store", blurb: "Hotels, restaurants and transport", description: "" },
{ label: "Government Services", href: "/government-services", icon: "landmark", blurb: "Government offices and services", description: "" }, ];
