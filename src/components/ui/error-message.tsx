export function ErrorMessage({
title = "Something went wrong",
message, }: {
title?: string;
message?: string; }) {
return (
<div role="alert" className="rounded-2xl border border-accent-500/30 bg-accent-500/5 px-5 py-6">
<h3 className="text-base font-semibold text-accent-600">{title}</h3>
{message && <p className="mt-1 text-sm text-slate-700">{message}</p>}
</div>
); }
export function InlineError({ message }: { message?: string }) {
if (!message) return null;
return <p role="alert" className="text-sm text-accent-600">{message}</p>; }
