"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/types/auth";
import { Icon } from "@/components/ui/icons";

type Division = { id: string; slug: string; name: string; bnName?: string };

const DIVISION_CENTERS: Record<string, { lat: number; lon: number }> = {
  barishal: { lat: 22.701, lon: 90.353 },
  chattogram: { lat: 22.3569, lon: 91.7832 },
  dhaka: { lat: 23.8103, lon: 90.4125 },
  khulna: { lat: 22.8456, lon: 89.5403 },
  mymensingh: { lat: 24.7471, lon: 90.4203 },
  rajshahi: { lat: 24.3745, lon: 88.6042 },
  rangpur: { lat: 25.7439, lon: 89.2752 },
  sylhet: { lat: 24.8949, lon: 91.8687 },
};

const DIVISION_ALIASES: Record<string, string[]> = {
  barishal: ["barisal", "বরিশাল"],
  chattogram: ["chittagong", "চট্টগ্রাম"],
  dhaka: ["ঢাকা"],
  khulna: ["খুলনা"],
  mymensingh: ["ময়মনসিংহ", "ময়মনসিংহ"],
  rajshahi: ["রাজশাহী"],
  rangpur: ["রংপুর"],
  sylhet: ["সিলেট"],
};

const TYPING_PHRASES = [
  "Search Sajek Valley...",
  "Search hospitals in Dhaka...",
  "Search Cox's Bazar resorts...",
  "Search Sylhet tea gardens...",
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function HeroSearch({ divisions, user }: { divisions: Division[]; user: PublicUser | null }) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [activePhrase, setActivePhrase] = useState(0);
  const selected = divisions.find((division) => division.id === divisionId);

  // Typing + pause + backspace loop. User-entered text always takes priority.
  useEffect(() => {
    if (q) return;
    const phrase = TYPING_PHRASES[activePhrase];
    const deleting = placeholder === phrase;
    const delay = deleting ? 950 : 65;
    const timer = window.setTimeout(() => {
      if (deleting) {
        setPlaceholder("");
        setActivePhrase((current) => (current + 1) % TYPING_PHRASES.length);
      } else {
        setPlaceholder(phrase.slice(0, placeholder.length + 1));
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [activePhrase, placeholder, q]);

  // Close the custom division menu when clicking outside it.
  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Match a division mentioned in the query, including common English/Bangla aliases.
  useEffect(() => {
    const normalized = q.toLocaleLowerCase().trim();
    if (!normalized) return;
    const match = divisions.find((division) => {
      const slug = division.slug.toLocaleLowerCase().replace(/-/g, " ");
      const name = division.name.toLocaleLowerCase();
      const aliases = DIVISION_ALIASES[division.slug.toLocaleLowerCase()] ?? [];
      return [name, slug, division.bnName?.toLocaleLowerCase(), ...aliases]
        .filter(Boolean)
        .some((term) => {
          const escaped = term!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "iu").test(normalized);
        });
    });
    if (match) setDivisionId(match.id);
  }, [q, divisions]);

  const sortedDivisions = useMemo(() => [...divisions].sort((a, b) => a.name.localeCompare(b.name)), [divisions]);

  function detectLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }
    setLocationStatus("Detecting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current = { lat: coords.latitude, lon: coords.longitude };
        const nearest = divisions
          .map((division) => {
            const center = DIVISION_CENTERS[division.slug.toLowerCase()];
            return center ? { division, distance: distanceKm(current, center) } : null;
          })
          .filter((item): item is { division: Division; distance: number } => item !== null)
          .sort((a, b) => a.distance - b.distance)[0];
        if (!nearest) {
          setLocationStatus("Could not match your location to a division.");
          return;
        }
        setDivisionId(nearest.division.id);
        setLocationStatus(`Nearest division: ${nearest.division.name}`);
        setDropdownOpen(false);
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Please allow location access."
          : "Unable to detect your location. Please try again.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function chooseDivision(division: Division | null) {
    setDivisionId(division?.id ?? "");
    setDropdownOpen(false);
    setLocationStatus("");
  }

  return (
    <form
      action="/search"
      className="mx-auto w-full rounded-2xl border border-white/20 bg-black/40 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-md sm:p-4 md:rounded-3xl md:p-5"
    >
      <div className="flex w-full flex-col gap-2 sm:gap-2.5 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-3.5 sm:h-[18px] sm:w-[18px]" />
          <input
            name="q"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={placeholder || "Search places, hospitals, businesses and services…"}
            aria-label="Search DeshConnect"
            className="h-9 w-full rounded-lg border border-white/40 bg-white/90 py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-white focus:bg-white focus:ring-2 focus:ring-white/30 sm:h-11 sm:rounded-xl sm:py-2 sm:pl-11 sm:text-sm"
          />
        </div>

        <div ref={dropdownRef} className="relative z-50 w-full overflow-visible md:w-48 md:shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-white/40 bg-white/90 px-3 py-1.5 text-left text-xs text-slate-800 outline-none transition hover:bg-white focus:border-white focus:ring-2 focus:ring-white/30 sm:h-11 sm:rounded-xl sm:py-2 sm:text-sm"
          >
            <span className="truncate">{selected?.name ?? "All divisions"}</span>
            <Icon name="chevron-down" className={`h-4 w-4 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-[9999] mt-1 w-full max-h-72 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl shadow-slate-950/20">
              <button
                type="button"
                onClick={detectLocation}
                className="flex w-full items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-100 sm:text-sm"
              >
                <span aria-hidden="true">📍</span>
                Detect My Location
              </button>
              <button
                type="button"
                role="option"
                aria-selected={!divisionId}
                onClick={() => chooseDivision(null)}
                className={`mt-1 w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-slate-50 sm:text-sm ${!divisionId ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700"}`}
              >
                All divisions
              </button>
              {sortedDivisions.map((division) => (
                <button
                  key={division.id}
                  type="button"
                  role="option"
                  aria-selected={divisionId === division.id}
                  onClick={() => chooseDivision(division)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-slate-50 sm:text-sm ${divisionId === division.id ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700"}`}
                >
                  {division.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="h-9 w-full rounded-lg bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-11 sm:rounded-xl sm:py-2 sm:text-sm md:w-auto md:shrink-0"
        >
          Search
        </button>
      </div>

      {locationStatus && <p role="status" className="mt-2 text-left text-[11px] text-white/90 sm:text-xs">{locationStatus}</p>}

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
      {selected && <input type="hidden" name="divisionId" value={selected.id} />}
    </form>
  );
}
