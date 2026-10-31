"use client";

import { useEffect, useState } from "react";

export function VideoBackground({ src, className = "" }: { src: string; className?: string }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const isSlowConnection =
      connection?.saveData === true ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";

    // Keep mobile and data-saving users on the lightweight CSS hero background.
    // The decorative video is not required to understand or use the homepage.
    if (isMobile || prefersReducedMotion || isSlowConnection) {
      setHasFailed(true);
      return;
    }

    // Defer the decorative desktop video so it cannot compete with initial rendering.
    const startTimer = window.setTimeout(() => setShouldLoad(true), 1800);
    return () => window.clearTimeout(startTimer);
  }, []);

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${className} ${isReady ? "opacity-100" : "opacity-0"}`}
      src={shouldLoad && !hasFailed ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      onCanPlay={() => setIsReady(true)}
      onError={() => setHasFailed(true)}
      aria-hidden="true"
    />
  );
}
