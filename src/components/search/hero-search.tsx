"use client";
import { useRouter } from "next/navigation"; import { useState } from "react";
import type { PublicUser } from "@/types/auth"; import { Icon } from "@/components/ui/icons";
type Division = { id: string; slug: string; name: string; bnName?: string };
export function HeroSearch({ divisions, user }: { divisions: Division[]; user: PublicUser | null }) {
const router = useRouter();
const [q, setQ] = useState("");
const [divisionId, setDivisionId] = useState("");
const selected = divisions.find((division) => division.id === divisionId);
return (
<form
action="/search"
className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-sm sm:p-3"
>
<div className="flex flex-col gap-2">
<div className="relative flex-1">
<Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
<input
name="q"
value={q}
onChange={(event) => setQ(event.target.value)}
placeholder="Search places, hospitals, businesses and services…"
aria-label="Search DeshConnect"
className="h-[38px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus-ring"
/>
</div>
<select
aria-label="Division"
value={divisionId}
onChange={(event) => {
const value = event.target.value;
setDivisionId(value);
const match = divisions.find((division) => division.id === value);
if (match) router.push(`/divisions/${match.slug}`);
}}
className="h-[38px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-ring"
>
<option value="">All divisions</option>
{divisions.map((division) => (
<option key={division.id} value={division.id}>{division.name}</option>
))}
</select>
<button
type="submit"
className="h-[38px] rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
>
Search
</button>
</div>
<div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-0.5 text-xs">
<span className="text-red-500">Popular:</span>
{[
{ label: "Sajek Valley", query: "Sajek Valley" },
{ label: "Cox's Bazar", query: "Cox's Bazar" },
{ label: "Sundarbans", query: "Sundarbans" },
{ label: "Paharpur", query: "Paharpur" },
].map((term) => (
<a
key={term.query}
href={`/search?q=${encodeURIComponent(term.query)}`}
className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium leading-4 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
>
{term.label}
</a>
))}
{!user && (
<a href="/register" className="ml-auto px-1 py-1 text-[11px] font-semibold text-red-500 hover:text-brand-800">
Create free account →
</a>
)}
{selected && null}
</div>
</form>
); }
