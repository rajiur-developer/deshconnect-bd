import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
const baseField =
"w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-ring disabled:cursor-not-allowed disabled:bg-slate-100";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
return <input className={cn(baseField, className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
return <textarea className={cn(baseField, "min-h-[110px] resize-y", className)} {...props} />; }
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
return (
<select className={cn(baseField, "appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9", className)} {...props}>
{children}
</select>
); }
export function Label({ htmlFor, children, required }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
return (
<label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
{children}
{required && <span className="ml-0.5 text-accent-600">*</span>}
</label>
); }
export function FieldError({ children }: { children?: ReactNode }) {
if (!children) return null;
return <p className="mt-1 text-sm text-accent-600">{children}</p>; }
export function Field({
label,
htmlFor,
required,
error,
hint,
children, }: {
label: string;
htmlFor?: string;
required?: boolean;
error?: string;
hint?: string;
children: ReactNode; }) {
return (
<div>
<Label htmlFor={htmlFor} required={required}>
{label}
</Label>
{children}
{hint && !error ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
<FieldError>{error}</FieldError>
</div>
); }
