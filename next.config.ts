import type { NextConfig } from "next";

const storageBaseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim().replace(/\/+$/, "");
const storageImagePattern = storageBaseUrl
  ? (() => {
      const url = new URL(storageBaseUrl);
      return {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/api/storage/**",
      } satisfies NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];
    })()
  : null;

const portFlagIndex = process.argv.findIndex((arg) => arg === "--port" || arg === "-p");
const portFlagValue = portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : undefined;
const inlinePort = process.argv.find((arg) => arg.startsWith("--port="))?.slice("--port=".length);
const devPort = process.env.PORT ?? inlinePort ?? portFlagValue ?? "3000";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development" ? { distDir: `.next-dev/${devPort}` } : {}),
  experimental: {
    cpus: 1,
  },
  images: {
    // Placeholder artwork is local SVG; keep it sandboxed.
    remotePatterns: storageImagePattern ? [storageImagePattern] : [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
