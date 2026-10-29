import type { MetadataRoute } from "next";
import { SITE } from "@/config/site"; import { getDatabase } from "@/lib/db/store";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const base = SITE.url.replace(/\/$/, "");
const db = await getDatabase();
const staticRoutes = [
"",
"/places",
"/institutions",
"/hospitals",
"/businesses",
"/government-services",
"/blood-donation",
"/community",
"/news",
"/search",
"/about",
"/contact",
"/privacy-policy",
"/terms",
].map((path) => ({
url: `${base}${path}`,
lastModified: new Date(),
changeFrequency: "weekly" as const,
priority: path === "" ? 1 : 0.8,
}));
const dynamicRoutes: MetadataRoute.Sitemap = [
...db.places.filter((place) => place.status === "published").map((place) => ({
url: `${base}/places/${place.slug}`,
lastModified: new Date(place.updatedAt),
changeFrequency: "monthly" as const,
priority: 0.7,
})),
...db.institutions.filter((item) => item.status === "published").map((item) => ({
url: `${base}/institutions/${item.slug}`,
lastModified: new Date(item.updatedAt),
changeFrequency: "monthly" as const,
priority: 0.6,
})),
...db.businesses.filter((item) => item.status === "published").map((item) => ({
url: `${base}/businesses/${item.slug}`,
lastModified: new Date(item.updatedAt),
changeFrequency: "monthly" as const,
priority: 0.6,
})),
...db.governmentServices.filter((item) => item.status === "published").map((item) => ({
url: `${base}/government-services/${item.slug}`,
lastModified: new Date(item.updatedAt),
changeFrequency: "monthly" as const,
priority: 0.6,
})),
...db.news.filter((item) => item.status === "published").map((item) => ({
url: `${base}/news/${item.slug}`,
lastModified: new Date(item.publishedAt ?? item.updatedAt),
changeFrequency: "monthly" as const,
priority: 0.6,
})),
...db.divisions.map((division) => ({
url: `${base}/divisions/${division.slug}`,
lastModified: new Date(),
changeFrequency: "monthly" as const,
priority: 0.7,
})),
...db.districts.map((district) => ({
url: `${base}/districts/${district.slug}`,
lastModified: new Date(),
changeFrequency: "monthly" as const,
priority: 0.6,
})),
];
return [...staticRoutes, ...dynamicRoutes]; }
