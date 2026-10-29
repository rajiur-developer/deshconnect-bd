import { bloodGroupTone } from "@/lib/utils"; import { cn } from "@/lib/utils";
export function BloodGroupBadge({ group, className }: { group: string; className?: string }) {
return (
<span
className={cn(
"inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-sm",
bloodGroupTone(group),
className
)}
aria-label={`Blood group ${group}`}
>
{group}
</span>
); }
