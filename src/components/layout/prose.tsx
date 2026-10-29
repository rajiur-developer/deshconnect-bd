import type { ReactNode } from "react";
export function Prose({ children }: { children: ReactNode }) {
return (
<div className="prose-body mx-auto max-w-3xl text-slate-700">
{children}
</div>
); }
