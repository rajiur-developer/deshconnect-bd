"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Sends anonymous page-view events for public visitors and regular members.
 * The server owns visitor/session cookies; no account login is required.
 */
export function VisitorTracker({ enabled = true }: { enabled?: boolean }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !pathname || pathname.startsWith("/admin")) return;

    const path = pathname.slice(0, 300);
    const referrer = previousPath.current ?? document.referrer;
    previousPath.current = path;

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Analytics must never interrupt navigation or page rendering.
    });
  }, [enabled, pathname]);

  return null;
}
