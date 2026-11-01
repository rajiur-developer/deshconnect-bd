"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/types/auth";
import { Icon } from "@/components/ui/icons";

type Division = { id: string; slug: string; name: string; bnName?: string };

export function HeroSearch({ divisions, user }: { divisions: Division[]; user: PublicUser | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const selected = divisions.find((division) => division.id === divisionId);

  return (
    <form
      action="/search"
      className="mx-auto w-full rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl shadow-slate-950/10 backdrop-blur-md sm:p-4 md:rounded-3xl md:p-5"
    >
      <div className="flex w-full flex-col gap-2 sm:gap-2.5 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-3.5 sm:h-[18px] sm:w-[18px]" />
          <input
            name="q"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search places, hospitals, businesses and services…"
            aria-label="Search DeshConnect"
            className="h-9 w-full rounded-lg border border-white/40 bg-white/90 py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-white focus:bg-white focus:ring-2 focus:ring-white/30 sm:h-11 sm:rounded-xl sm:py-2 sm:pl-11 sm:text-sm"
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
          className="h-9 w-full rounded-lg border border-white/40 bg-white/90 px-3 py-1.5 text-xs text-slate-800 outline-none transition focus:border-white focus:ring-2 focus:ring-white/30 sm:h-11 sm:rounded-xl sm:py-2 sm:text-sm md:w-44 md:shrink-0"
        >
          <option value="">All divisions</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>{division.name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="h-9 w-full rounded-lg bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-11 sm:rounded-xl sm:py-2 sm:text-sm md:w-auto md:shrink-0"
        >
          Search
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-0.5 text-[11px] sm:mt-3 sm:gap-2 sm:text-xs">
        <span className="font-semibold text-white/90">Popular:</span>
        {[
          { label: "Sajek Valley", query: "Sajek Valley" },
          { label: "Cox's Bazar", query: "Cox's Bazar" },
          { label: "Sundarbans", query: "Sundarbans" },
          { label: "Paharpur", query: "Paharpur" },
        ].map((term) => (
          <a
            key={term.query}
            href={`/search?q=${encodeURIComponent(term.query)}`}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium leading-4 text-white/95 transition hover:border-white/40 hover:bg-white/20 sm:px-3 sm:text-[11px]"
          >
            {term.label}
          </a>
        ))}
        {!user && (
          <a href="/register" className="ml-auto px-1 py-1 text-[10px] font-semibold text-white underline-offset-4 transition hover:underline sm:text-xs">
            Create free account →
          </a>
        )}
      </div>
      {selected && null}
    </form>
  );
}
