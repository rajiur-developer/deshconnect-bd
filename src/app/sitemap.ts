import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const publicRoutes = [
    "",
    "/about",
    "/contact",
    "/places",
    "/institutions",
    "/hospitals",
    "/businesses",
    "/government-services",
    "/blood-donation",
    "/community",
    "/news",
    "/privacy-policy",
    "/terms",
  ];

  return publicRoutes.map((route) => ({
    url: new URL(route, SITE.url).toString(),
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
