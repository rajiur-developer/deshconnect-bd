import type { ReactNode } from "react";
export function EmptyState({
title,
description,
action,
icon, }: {
title: string;
description?: string;
action?: ReactNode;
icon?: ReactNode; }) {
return (
<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
{icon && <div className="mb-4 text-slate-300">{icon}</div>}
<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
{description && <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>}
{action && <div className="mt-6">{action}</div>}
</div>
); }
