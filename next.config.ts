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

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim().replace(/\/+$/, "");
const r2ImagePattern = r2PublicUrl
  ? (() => {
      const url = new URL(r2PublicUrl);
      const basePath = url.pathname.replace(/\/+$/, "");
      return {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: `${basePath}/**`,
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
    // Keep existing InsForge images working while new public media uses R2.
    remotePatterns: [
      ...(storageImagePattern ? [storageImagePattern] : []),
      ...(r2ImagePattern ? [r2ImagePattern] : []),
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
