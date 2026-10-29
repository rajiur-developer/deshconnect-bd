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
className="w-full rounded-2xl border border-slate-200  p-3 shadow-lg shadow-slate-900/5"
>
<div className="flex flex-col gap-2 sm:flex-row">
<div className="relative flex-1">
<Icon name="search" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
<input
name="q"
value={q}
onChange={(event) => setQ(event.target.value)}
placeholder="Search places, hospitals, businesses and services…"
aria-label="Search DeshConnect"
className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus-ring"
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
className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus-ring sm:w-52"
>
<option value="">All divisions</option>
{divisions.map((division) => (
<option key={division.id} value={division.id}>{division.name}</option>
))}
</select>
<button
type="submit"
className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
>
Search
</button>
</div>
<div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-sm ">
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
className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
>
{term.label}
</a>
))}
{!user && (
<a href="/register" className="ml-auto font-medium text-brand-700 hover:text-brand-800 text-red-500">
Create free account →
</a>
)}
{selected && null}
</div>
</form>
); }
