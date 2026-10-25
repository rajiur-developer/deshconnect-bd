"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icons";

export function AnimatedDialog({
  open,
  onClose,
  children,
  panelClassName = "",
  label = "Dialog",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode | ((requestClose: () => void) => ReactNode);
  panelClassName?: string;
  label?: string;
}) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setClosing(false);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 160);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm ${closing ? "modal-backdrop-exit" : "modal-backdrop-enter"}`}
      onClick={close}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${panelClassName} ${closing ? "modal-panel-exit" : "modal-panel-enter"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={close}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-ring"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
        {typeof children === "function" ? children(close) : children}
      </section>
    </div>,
    document.body,
  );
}
