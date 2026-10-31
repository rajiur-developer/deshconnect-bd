"use client";

import { useEffect, useState } from "react";

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function DashboardSessionWidget() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/75">This visit</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">{formatElapsed(elapsed)}</p>
      <p className="mt-1 flex items-center gap-2 text-xs text-emerald-100/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.14)]" />
        Session active
      </p>
    </div>
  );
}
