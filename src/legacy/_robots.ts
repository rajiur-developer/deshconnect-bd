import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
const base = SITE.url.replace(/\/$/, "");
return {
rules: {
userAgent: "*",
allow: "/",
disallow: [
"/admin",
"/admin/",
"/dashboard",
"/profile/",
"/settings",
"/saved",
"/messages",
"/connections",
"/friend-requests",
"/notifications",
"/my-",
"/my-news",
"/my-posts",
"/my-comments",
"/my-reviews",
"/my-reports",
"/my-blood-requests",
"/api/",
],
},
sitemap: `${base}/sitemap.xml`,
}; }
