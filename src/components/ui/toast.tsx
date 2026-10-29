"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils"; import { Icon } from "./icons";
type ToastItem = { id: number; type: "success" | "error"; message: string; closing?: boolean };
type ToastContextValue = {
toast: (type: "success" | "error", message: string) => void;
success: (message: string) => void;
error: (message: string) => void; };
const ToastContext = createContext<ToastContextValue | null>(null);
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
const timer = setTimeout(() => dismiss(id), 160);
timers.current.set(id, timer);
}, [dismiss]);
useEffect(() => () => {
timers.current.forEach((timer) => clearTimeout(timer));
timers.current.clear();
}, []);
const toast = useCallback(
(type: "success" | "error", message: string) => {
const id = Date.now() + Math.random();
setToasts((current) => [...current, { id, type, message }]);
const timer = setTimeout(() => closeToast(id), 4500);
timers.current.set(id, timer);
},
[closeToast]
);
const value = useMemo<ToastContextValue>(
() => ({
toast,
success: (message) => toast("success", message),
error: (message) => toast("error", message),
}),
[toast]
);
return (
<ToastContext.Provider value={value}>
{children}
<div
aria-live="polite"
className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
>
{toasts.map((item) => (
<div
key={item.id}
role={item.type === "error" ? "alert" : "status"}
className={cn(
"pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
item.type === "success"
? `success-toast border-emerald-200 bg-emerald-50 text-emerald-800 ${item.closing ? "motion-toast-exit" : "modal-panel-enter"}`
: `border-accent-500/30 bg-accent-500/5 text-accent-700 ${item.closing ? "motion-toast-exit" : "motion-error"}`
)}
>
<Icon name={item.type === "success" ? "check" : "alert"} className={`mt-0.5 h-5 w-5 shrink-0 ${item.type === "success" && !item.closing ? "motion-success" : ""}`} />
<p className="flex-1 text-sm font-medium">{item.message}</p>
<button
type="button"
onClick={() => closeToast(item.id)}
aria-label="Close"
className="rounded p-0.5 opacity-60 hover:opacity-100"
>
<Icon name="close" className="h-4 w-4" />
</button>
</div>
))}
</div>
</ToastContext.Provider>
); }
export function useToast(): ToastContextValue {
const context = useContext(ToastContext);
if (!context) throw new Error("useToast must be used within a ToastProvider");
return context; }
/**
* Shows a toast whenever a server-action form state changes to success or
* error. Add to any client form that uses useActionState.
*/ export function useFormStateToast(state: { success?: string; error?: string }) {
const { toast } = useToast();
const lastKey = useRef<string | null>(null);
useEffect(() => {
const message = state.success ?? state.error;
if (!message || message === lastKey.current) return;
lastKey.current = message;
if (state.success) toast("success", state.success);
else toast("error", state.error ?? "An error occurred.");
}, [state.success, state.error, toast]); }
