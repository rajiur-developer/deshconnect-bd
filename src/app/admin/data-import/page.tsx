"use client";

import { useState } from "react";
import { previewOpenStreetMapGeoJson, type GeoJsonPreview } from "@/features/admin/geojson-importer";

export default function AdminGeoJsonImportPage() {
  const [preview, setPreview] = useState<GeoJsonPreview | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file?: File) {
    setPreview(null);
    setError("");
    if (!file) return;
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".geojson") && !file.name.toLowerCase().endsWith(".json")) {
      setError("শুধু .geojson অথবা .json ফাইল নির্বাচন করুন।");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ফাইল সর্বোচ্চ ১০ MB হতে পারবে।");
      return;
    }
    setBusy(true);
    try {
      const parsed = JSON.parse(await file.text());
      setPreview(previewOpenStreetMapGeoJson(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ফাইল পড়া যায়নি।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-semibold text-cyan-700">DeshConnect Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">OpenStreetMap GeoJSON Importer</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">GeoJSON ফাইল আপলোড করে আগে Preview দেখুন। এই সংস্করণে কোনো তথ্য ডেটাবেসে লেখা হয় না; যাচাই না করা তথ্য প্রকাশও হয় না।</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="geojson-file" className="block text-sm font-semibold text-slate-800">GeoJSON ফাইল</label>
        <input id="geojson-file" type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={(e) => void onFile(e.target.files?.[0])} className="mt-3 block w-full rounded-lg border border-slate-300 p-3 text-sm" />
        {fileName && <p className="mt-2 text-xs text-slate-500">ফাইল: {fileName}</p>}
        {busy && <p className="mt-3 text-sm text-slate-600">ফাইল যাচাই হচ্ছে…</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      {preview && <>
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">Import-এর উপযোগী</p><p className="mt-1 text-2xl font-bold">{preview.rows.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">বাদ পড়েছে</p><p className="mt-1 text-2xl font-bold">{preview.skipped.length}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">ডুপ্লিকেট</p><p className="mt-1 text-2xl font-bold">{preview.duplicates.length}</p></div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b p-4"><h2 className="font-semibold">Preview (প্রথম 100টি)</h2><p className="text-xs text-slate-500">© OpenStreetMap contributors · তথ্য যাচাই করে প্রকাশ করুন</p></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">নাম</th><th className="p-3">ক্যাটাগরি</th><th className="p-3">ঠিকানা</th><th className="p-3">Latitude / Longitude</th><th className="p-3">OSM ID</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {preview.rows.slice(0, 100).map((row) => <tr key={row.sourceKey}><td className="p-3 font-medium">{row.name}</td><td className="p-3">{row.category}</td><td className="p-3">{row.address || "—"}</td><td className="p-3 whitespace-nowrap">{row.latitude}, {row.longitude}</td><td className="p-3">{row.sourceKey}</td></tr>)}
              </tbody>
            </table>
          </div>
          {preview.rows.length > 100 && <p className="p-3 text-sm text-slate-500">আরও {preview.rows.length - 100}টি রেকর্ড Preview তালিকায় দেখানো হয়নি।</p>}
        </section>
        {preview.skipped.length > 0 && <details className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">বাদ পড়া রেকর্ড ({preview.skipped.length})</summary><ul className="mt-3 space-y-1 text-sm text-slate-600">{preview.skipped.slice(0, 30).map((item) => <li key={item.index}>Feature {item.index + 1}: {item.reason}</li>)}</ul></details>}
      </>}
    </main>
  );
}
