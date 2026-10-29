import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
return <div className={cn("skeleton-shimmer rounded-lg bg-slate-200/70", className)} aria-hidden="true" />; }
export function CardSkeleton() {
return (
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
<Skeleton className="aspect-[16/10] rounded-none" />
<div className="space-y-3 p-4">
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-3 w-full" />
<Skeleton className="h-3 w-1/2" />
</div>
</div>
); }
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
return (
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
{Array.from({ length: count }, (_, index) => (
<CardSkeleton key={index} />
))}
</div>
); }
