"use client";

import { useEffect, useState } from "react";

export function VideoBackground({ src, className = "" }: { src: string; className?: string }) {
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    // Do not leave an endless loader on slow or unsupported mobile connections.
    const timeout = window.setTimeout(() => setHasFailed(true), 15000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${className} ${isReady ? "opacity-100" : "opacity-0"}`}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={() => setIsReady(true)}
        onError={() => setHasFailed(true)}
        aria-hidden="true"
      />

      {!isReady && !hasFailed && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800"
          role="status"
          aria-label="Loading background video"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
            <span className="text-xs font-medium tracking-wide text-white/70">Loading experience…</span>
          </div>
        </div>
      )}
    </>
  );
}
