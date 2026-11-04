import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Counts the App Router page entries produced by Next.js at build time.
 * Dynamic routes count once as route templates, not once per database record.
 */
export async function getAppPageCount(): Promise<number | null> {
  try {
    const manifestPath = path.join(process.cwd(), ".next", "server", "app-paths-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, string>;
    return Object.entries(manifest).filter(([route, file]) => {
      const isPage = route === "/page" || route.endsWith("/page");
      return isPage && file.endsWith("/page.js") && !route.includes("_not-found");
    }).length;
  } catch {
    return null;
  }
}
