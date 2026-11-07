"use client";

import { useRef, useState } from "react";
import type { DistrictOption } from "@/components/search/directory-filters";

type Result = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
  osmUrl: string;
};

type Props = {
  districts: DistrictOption[];
  initialDistrictId?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
};

export function MapLocationSearch({
  districts,
  initialDistrictId = "",
  initialLatitude = null,
  initialLongitude = null,
}: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [districtId, setDistrictId] = useState(initialDistrictId);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    initialLatitude != null && initialLongitude != null ? { latitude: initialLatitude, longitude: initialLongitude } : null,
  );
  const [name, setName] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function syncFormDistrict(nextDistrictId: string) {
    const district = districts.find((item) => item.id === nextDistrictId);
    const targetForm = rootRef.current?.closest("form") as HTMLFormElement | null;
    if (!targetForm || !district) return;
    const division = targetForm.querySelector<HTMLSelectElement>('select[name="divisionId"]');
    const districtSelect = targetForm.querySelector<HTMLSelectElement>('select[name="districtId"]');
    if (division && district.divisionId && division.value !== district.divisionId) {
      division.value = district.divisionId;
      division.dispatchEvent(new Event("change", { bubbles: true }));
      window.setTimeout(() => {
        if (!districtSelect) return;
        districtSelect.value = nextDistrictId;
        districtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }, 0);
    } else if (districtSelect) {
      districtSelect.value = nextDistrictId;
      districtSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  async function search() {
    if (!name.trim() || !districtId) {
      setError("স্থানের নাম লিখুন এবং জেলা নির্বাচন করুন।");
      return;
    }
    setBusy(true);
    setError("");
    setResults([]);
    setSelected(null);
    try {
      const response = await fetch(
        `/api/admin/map-location-search?name=${encodeURIComponent(name.trim())}&districtId=${encodeURIComponent(districtId)}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "লোকেশন খোঁজা যায়নি।");
      setResults(data.results ?? []);
      if (!data.results?.length) setError("এই নামে নির্বাচিত জেলায় কোনো ফলাফল পাওয়া যায়নি। নামের বানান যাচাই করে আবার চেষ্টা করুন।");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "লোকেশন খোঁজা যায়নি।");
    } finally {
      setBusy(false);
    }
  }

  function choose(result: Result) {
    setSelected(result);
    const form = rootRef.current?.closest("form") as HTMLFormElement | null;
    const latitude = form?.querySelector<HTMLInputElement>('input[name="latitude"]');
    const longitude = form?.querySelector<HTMLInputElement>('input[name="longitude"]');
    if (latitude) latitude.value = String(result.latitude);
    if (longitude) longitude.value = String(result.longitude);
    setCoordinates({ latitude: result.latitude, longitude: result.longitude });
    syncFormDistrict(districtId);
  }

  return (
    <section className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <div>
        <h3 className="font-semibold text-slate-900">Find exact location with OpenStreetMap</h3>
        <p className="mt-1 text-xs text-slate-600">নাম ও জেলা দিয়ে খুঁজুন। ফলাফল শুধু নির্বাচিত জেলার সীমানার ভেতর থেকে আসবে।</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-medium text-slate-700">
          Place / institution name
          <input value={name} onChange={(event) => { setName(event.target.value); setCoordinates(null); setSelected(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }} placeholder="যেমন: Thakurgaon Government College" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Search within district
          <select value={districtId} onChange={(event) => { setDistrictId(event.target.value); setResults([]); setSelected(null); setCoordinates(null); syncFormDistrict(event.target.value); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">জেলা নির্বাচন করুন</option>
            {districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void search()} disabled={busy || name.trim().length < 2 || !districtId} className="self-end rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Searching…" : "Search location"}
        </button>
      </div>
      {error && <p role="status" className="text-sm text-amber-800">{error}</p>}
      {results.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {results.map((result) => (
            <button type="button" key={result.id} onClick={() => choose(result)} className={`block w-full rounded-lg border p-3 text-left text-sm ${selected?.id === result.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-sky-400"}`}>
              <span className="block font-semibold text-slate-900">{result.name}</span>
              <span className="mt-1 block text-xs text-slate-600">{result.address || `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`}</span>
              <span className="mt-1 block text-xs text-sky-700">OSM {result.type} · Select this location</span>
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name="latitude" value={selected?.latitude ?? initialLatitude ?? ""} readOnly />
      <input type="hidden" name="longitude" value={selected?.longitude ?? initialLongitude ?? ""} readOnly />
      <p className="text-xs text-slate-500">
        {selected ? `Selected: ${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)} · © OpenStreetMap contributors` : initialLatitude != null && initialLongitude != null ? `Saved coordinates: ${initialLatitude}, ${initialLongitude}` : "লোকেশন নির্বাচন না করলে coordinates ফাঁকা থাকবে।"}
      </p>
    </section>
  );
}
