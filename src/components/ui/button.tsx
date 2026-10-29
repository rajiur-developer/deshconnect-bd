import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react"; import Link from "next/link";
import { cn } from "@/lib/utils";
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent"; type Size = "sm" | "md" | "lg";
const VARIANTS: Record<Variant, string> = {
primary: "btn-grad text-white shadow-sm",
secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900",
ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
danger: "bg-accent-600 text-white hover:bg-accent-700 shadow-sm",
accent: "btn-grad-accent text-white shadow-sm", };
const SIZES: Record<Size, string> = {
sm: "px-3 py-1.5 text-sm",
md: "px-4 py-2 text-sm",
lg: "px-5 py-3 text-base", };
export function buttonClasses({
variant = "primary",
size = "md",
className, }: {
variant?: Variant;
size?: Size;
className?: string; } = {}): string {
return cn(
"inline-flex items-center justify-center gap-2 rounded-lg font-medium btn-motion hover:-translate-y-0.5 active:translate-y-0 focus-ring disabled:pointer-events-none disabled:opacity-50",
VARIANTS[variant],
SIZES[size],
className
); }
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };
export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />; }
type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
href: string;
variant?: Variant;
size?: Size;
children: ReactNode; };
export function LinkButton({ href, variant, size, className, children, ...props }: LinkButtonProps) {
return (
<Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
{children}
</Link>
); }
