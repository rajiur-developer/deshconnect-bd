import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
export default function manifest(): MetadataRoute.Manifest {
return {
name: SITE.name,
short_name: SITE.name,
description: SITE.description,
start_url: "/",
display: "standalone",
background_color: "#ffffff",
theme_color: "#178d5d",
icons: [{ src: "/icons/favicon.svg", sizes: "any", type: "image/svg+xml" }],
}; }
