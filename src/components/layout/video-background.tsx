"use client";

import { useEffect, useState } from "react";

export function VideoBackground({ src, className = "" }: { src: string; className?: string }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    // Keep the hero video enabled on desktop and mobile, but let the page's
    // critical text and controls render before the decorative video downloads.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const delay = isMobile ? 900 : 1200;
    const startTimer = window.setTimeout(() => setShouldLoad(true), delay);
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
