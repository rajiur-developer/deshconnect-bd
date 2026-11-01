"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { IconName } from "@/components/ui/icons"; import { Icon } from "@/components/ui/icons";
export type LocationOption = { id: string; name: string }; export type DistrictOption = LocationOption & { divisionId: string }; export type UpazilaOption = LocationOption & { districtId: string };
const MANAGED_KEYS = new Set(["q", "divisionId", "districtId", "upazilaId", "category", "sort", "page"]);
type Props = {
action: string;
params: Record<string, string | string[] | undefined>;
divisions: LocationOption[];
districts: DistrictOption[];
upazilas: UpazilaOption[];
categories?: { value: string; label: string }[];
showCategory?: boolean;
sortOptions?: Array<"relevance" | "name" | "newest" | "rating">;
extraSelects?: Array<{ name: string; label: string; options: { value: string; label: string }[]; value?: string }>;
current: { divisionId?: string; districtId?: string; upazilaId?: string };
labels?: { division?: string; district?: string; upazila?: string };
icon?: IconName;
title?: string; };
function paramValue(value: string | string[] | undefined) {
return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
/**
* Composable directory filter: keyword, Division → District → Upazila,
* category and sort. The selects are dependent and the form submits itself
* whenever a selection changes, without a full document reload.
*/ export function DirectoryFilters({
action,
params,
divisions,
districts,
upazilas,
categories,
showCategory,
sortOptions = ["relevance", "name", "newest", "rating"],
extraSelects,
current,
labels,
icon = "filter",
title = "Filter", }: Props) {
const formRef = useRef<HTMLFormElement>(null);
const router = useRouter();
const [divisionId, setDivisionId] = useState(current.divisionId ?? "");
const [districtId, setDistrictId] = useState(current.districtId ?? "");
const [upazilaId, setUpazilaId] = useState(current.upazilaId ?? "");
const [searchValue, setSearchValue] = useState(paramValue(params.q));
const [categoryValue, setCategoryValue] = useState(paramValue(params.category));
const [sortValue, setSortValue] = useState(paramValue(params.sort) || "relevance");
const [extraValues, setExtraValues] = useState<Record<string, string>>(
Object.fromEntries((extraSelects ?? []).map((item) => [item.name, item.value ?? ""]))
);
useEffect(() => {
setDivisionId(current.divisionId ?? "");
setDistrictId(current.districtId ?? "");
setUpazilaId(current.upazilaId ?? "");
setSearchValue(paramValue(params.q));
setCategoryValue(paramValue(params.category));
setSortValue(paramValue(params.sort) || "relevance");
setExtraValues(Object.fromEntries((extraSelects ?? []).map((item) => [item.name, item.value ?? ""])));
}, [current.divisionId, current.districtId, current.upazilaId, params.q, params.category, params.sort, extraSelects]);
const districtChoices = useMemo(
() => (divisionId ? districts.filter((item) => item.divisionId === divisionId) : districts),
[districts, divisionId]
);
const upazilaChoices = useMemo(
() => (districtId ? upazilas.filter((item) => item.districtId === districtId) : upazilas),
[upazilas, districtId]
);
const submit = (overrides: Record<string, string> = {}) => {
const form = formRef.current;
if (!form) return;
const search = new URLSearchParams();
for (const [key, value] of new FormData(form).entries()) {
if (typeof value === "string" && value.trim()) search.set(key, value);
}
for (const [key, value] of Object.entries(overrides)) {
if (value) search.set(key, value);
else search.delete(key);
}
// Filters always restart from the first result page.
search.delete("page");
const query = search.toString();
router.replace(query ? `${action}?${query}` : action, { scroll: false });
};
const managedKeys = new Set([...MANAGED_KEYS, ...(extraSelects?.map((item) => item.name) ?? [])]);
const hidden = Object.entries(params)
.filter(([key, value]) => !managedKeys.has(key) && value !== undefined)
.map(([key, value]) => [key, Array.isArray(value) ? value[0]! : value] as const);
return (
<form ref={formRef} action={action} method="get" onSubmit={(event) => { event.preventDefault(); submit(); }} className="rounded-xl border border-transparent bg-transparent p-2 shadow-none sm:rounded-2xl sm:border-slate-200/80 sm:bg-white sm:p-5 sm:shadow-[0_18px_50px_-24px_rgba(15,45,30,0.20)]">
  <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name={icon} className="h-4 w-4" /></span>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    </div>
    <Link href={action} scroll={false} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-50 focus-ring sm:px-3 sm:py-2 sm:text-xs">Reset all</Link>
  </div>

  <div className="relative mb-2 sm:mb-3">
    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input id="q" name="q" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search by name or keyword" aria-label="Search by name or keyword" className="min-h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-2 text-[11px] text-slate-800 sm:min-h-10 sm:rounded-xl sm:py-2 sm:pl-9 sm:pr-3 sm:text-xs outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10" />
  </div>

  <div className="grid grid-cols-2 gap-2 sm:gap-4">
    <label className="block min-w-0">
      <span className="mb-0.5 block text-[10px] font-semibold text-slate-600 sm:mb-1 sm:text-[11px]">{labels?.division ?? "Division"}</span>
      <select name="divisionId" aria-label="Division" value={divisionId} onChange={(event) => { setDivisionId(event.target.value); setDistrictId(""); setUpazilaId(""); submit({ divisionId: event.target.value, districtId: "", upazilaId: "" }); }} className="min-h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 text-[10px] text-slate-700 sm:min-h-10 sm:rounded-xl sm:px-2.5 sm:text-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        <option value="">{labels?.division ?? "All divisions"}</option>
        {divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{labels?.district ?? "District"}</span>
      <select name="districtId" aria-label="District" value={districtId} onChange={(event) => { setDistrictId(event.target.value); setUpazilaId(""); submit({ districtId: event.target.value, upazilaId: "" }); }} className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        <option value="">{labels?.district ?? "All districts"}</option>
        {districtChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{labels?.upazila ?? "Upazila"}</span>
      <select name="upazilaId" aria-label="Upazila" value={upazilaId} onChange={(event) => { setUpazilaId(event.target.value); submit({ upazilaId: event.target.value }); }} className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        <option value="">{labels?.upazila ?? "All upazilas"}</option>
        {upazilaChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    {showCategory && categories && <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">Category</span>
      <select name="category" aria-label="Category" value={categoryValue} onChange={(event) => { setCategoryValue(event.target.value); submit({ category: event.target.value }); }} className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        <option value="">All categories</option>
        {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>}
    {extraSelects?.map((extra) => <label key={extra.name} className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{extra.label}</span>
      <select name={extra.name} aria-label={extra.label} value={extraValues[extra.name] ?? ""} onChange={(event) => { setExtraValues((currentValues) => ({ ...currentValues, [extra.name]: event.target.value })); submit({ [extra.name]: event.target.value }); }} className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        <option value="">All {extra.label.toLowerCase()}</option>
        {extra.options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>)}
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">Sort</span>
      <select name="sort" aria-label="Sort" value={sortValue} onChange={(event) => { setSortValue(event.target.value); submit({ sort: event.target.value }); }} className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
        {sortOptions.includes("relevance") && <option value="relevance">By relevance</option>}
        {sortOptions.includes("name") && <option value="name">By name</option>}
        {sortOptions.includes("newest") && <option value="newest">Newest first</option>}
        {sortOptions.includes("rating") && <option value="rating">By highest rating</option>}
      </select>
    </label>
  </div>
  {hidden.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
  <button type="submit" className="mt-2 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-[11px] font-semibold sm:mt-4 sm:min-h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-xs text-white shadow-sm transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25">
    <Icon name="filter" className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Apply Filters
  </button>
</form>
); }


/** Places directory filter card with explicit apply/reset actions. */
export function PlacesDirectoryFilters({
  action,
  params,
  divisions,
  districts,
  upazilas,
  categories,
  current,
}: Pick<Props, "action" | "params" | "divisions" | "districts" | "upazilas" | "categories" | "current">) {
  const [divisionId, setDivisionId] = useState(current.divisionId ?? "");
  const [districtId, setDistrictId] = useState(current.districtId ?? "");
  const [upazilaId, setUpazilaId] = useState(current.upazilaId ?? "");
  const [searchValue, setSearchValue] = useState(paramValue(params.q));
  const [categoryValue, setCategoryValue] = useState(paramValue(params.category));
  const districtChoices = useMemo(
    () => (divisionId ? districts.filter((item) => item.divisionId === divisionId) : districts),
    [districts, divisionId]
  );
  const upazilaChoices = useMemo(
    () => (districtId ? upazilas.filter((item) => item.districtId === districtId) : upazilas),
    [upazilas, districtId]
  );

  return (
    <form
      action={action}
      method="get"
      className="relative z-10 -mt-8 rounded-xl border border-transparent bg-transparent p-2 shadow-none sm:-mt-14 sm:rounded-2xl sm:border-slate-200/80 sm:bg-white sm:p-6 sm:shadow-[0_18px_50px_-24px_rgba(15,45,30,0.28)]"
    >
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-5 sm:gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon name="filter" className="h-[18px] w-[18px]" />
          </span>
          <h2 className="text-base font-semibold text-slate-900">Filter</h2>
        </div>
        <Link
          href={action}
          scroll={false}
          className="rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-700 sm:px-3 sm:py-2 sm:text-sm transition hover:bg-brand-50 hover:text-brand-800 focus-ring"
        >
          Reset all
        </Link>
      </div>

      <div className="relative mb-2 sm:mb-4">
        <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:left-3.5 sm:h-[18px] sm:w-[18px] -translate-y-1/2 text-slate-400" />
        <input
          id="q"
          name="q"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by name or keyword"
          aria-label="Search by name or keyword"
          className="min-h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-2 text-[11px] text-slate-800 sm:min-h-10 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-3 sm:text-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <label className="block">
          <span className="mb-0.5 block text-[10px] font-semibold text-slate-600 sm:mb-1 sm:text-[11px]">Division</span>
          <select
            name="divisionId"
            aria-label="Division"
            value={divisionId}
            onChange={(event) => {
              setDivisionId(event.target.value);
              setDistrictId("");
              setUpazilaId("");
            }}
            className="min-h-8 w-full rounded-lg border border-slate-200 bg-white px-1.5 text-[10px] text-slate-700 sm:min-h-10 sm:rounded-xl sm:px-2.5 sm:text-xs outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="">All divisions</option>
            {divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[10px] font-semibold text-slate-600 sm:mb-1.5 sm:text-xs">District</span>
          <select
            name="districtId"
            aria-label="District"
            value={districtId}
            onChange={(event) => {
              setDistrictId(event.target.value);
              setUpazilaId("");
            }}
            className="min-h-8 w-full rounded-lg border border-slate-200 bg-white px-1.5 text-[10px] text-slate-700 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-sm outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="">All districts</option>
            {districtChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[10px] font-semibold text-slate-600 sm:mb-1.5 sm:text-xs">Upazila</span>
          <select
            name="upazilaId"
            aria-label="Upazila"
            value={upazilaId}
            onChange={(event) => setUpazilaId(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="">All upazilas</option>
            {upazilaChoices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[10px] font-semibold text-slate-600 sm:mb-1.5 sm:text-xs">Category</span>
          <select
            name="category"
            aria-label="Category"
            value={categoryValue}
            onChange={(event) => setCategoryValue(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-900/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 active:translate-y-0"
      >
        <Icon name="filter" className="h-4 w-4" />
        Apply Filters
      </button>
    </form>
  );
}
