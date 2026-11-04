"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

type ToastType = "success" | "error" | "warning" | "info" | "permission";
type ToastItem = { id: number; type: ToastType; message: string; closing?: boolean };

type ToastContextValue = {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  permission: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: "check" | "alert" | "shield" | "bell"; label: string; className: string; iconClass: string }> = {
  success: {
    icon: "check",
    label: "Success",
    className: "border-emerald-200/90 bg-white text-slate-800",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  error: {
    icon: "alert",
    label: "Something went wrong",
    className: "border-rose-200/90 bg-white text-slate-800",
    iconClass: "bg-rose-50 text-rose-600",
  },
  warning: {
    icon: "alert",
    label: "Attention",
    className: "border-amber-200/90 bg-white text-slate-800",
    iconClass: "bg-amber-50 text-amber-700",
  },
  info: {
    icon: "bell",
    label: "Information",
    className: "border-sky-200/90 bg-white text-slate-800",
    iconClass: "bg-sky-50 text-sky-600",
  },
  permission: {
    icon: "shield",
    label: "Permission notice",
    className: "border-violet-200/90 bg-white text-slate-800",
    iconClass: "bg-violet-50 text-violet-700",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const closeToast = useCallback((id: number) => {
    const existingTimer = timers.current.get(id);
    if (existingTimer) clearTimeout(existingTimer);
    setToasts((current) => current.map((item) => item.id === id ? { ...item, closing: true } : item));
    const timer = setTimeout(() => dismiss(id), 180);
    timers.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-3), { id, type, message }]);
    const duration = type === "permission" || type === "error" ? 6500 : 4500;
    timers.current.set(id, setTimeout(() => closeToast(id), duration));
  }, [closeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    toast,
    success: (message) => toast("success", message),
    error: (message) => toast("error", message),
    warning: (message) => toast("warning", message),
    info: (message) => toast("info", message),
    permission: (message) => toast("permission", message),
  }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[200] flex flex-col items-stretch gap-3 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[min(25rem,calc(100vw-2.5rem))] sm:items-end"
      >
        {toasts.map((item) => {
          const style = toastStyles[item.type];
          return (
            <div
              key={item.id}
              role={item.type === "success" || item.type === "info" ? "status" : "alert"}
              className={cn(
                "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.32)] backdrop-blur-xl transition sm:max-w-[25rem]",
                style.className,
                item.closing ? "motion-toast-exit" : "modal-panel-enter",
              )}
            >
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", style.iconClass)}>
                <Icon name={style.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-bold leading-5">{style.label}</p>
                <p className="mt-1 break-words text-[13px] leading-5 text-slate-600">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => closeToast(item.id)}
                aria-label="Dismiss notification"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
              <span className={cn(
                "absolute inset-x-0 bottom-0 h-0.5",
                item.type === "success" ? "bg-emerald-500" :
                item.type === "error" ? "bg-rose-500" :
                item.type === "warning" ? "bg-amber-500" :
                item.type === "permission" ? "bg-violet-500" : "bg-sky-500",
              )} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

/** Shows a toast whenever a server-action form state changes to success or error. */
export function useFormStateToast(state: { success?: string; error?: string }) {
  const { success, error } = useToast();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const message = state.success ?? state.error;
    if (!message || message === lastKey.current) return;
    lastKey.current = message;
    if (state.success) success(state.success);
    else error(state.error ?? "An error occurred.");
  }, [state.success, state.error, success, error]);
}
