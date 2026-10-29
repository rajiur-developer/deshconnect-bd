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
<form ref={formRef} action={action} method="get" onSubmit={(event) => { event.preventDefault(); submit(); }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
<div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
<Icon name={icon} className="h-4 w-4 text-brand-600" />
{title}
</div>
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
<div className="lg:col-span-2">
<label htmlFor="q" className="sr-only">Search</label>
<div className="relative">
<Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
<input
id="q"
name="q"
value={searchValue}
onChange={(event) => setSearchValue(event.target.value)}
placeholder="Search by name or keyword"
className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus-ring"
/>
</div>
</div>
<select
name="divisionId"
aria-label="Division"
value={divisionId}
onChange={(event) => {
setDivisionId(event.target.value);
setDistrictId("");
setUpazilaId("");
submit({ divisionId: event.target.value, districtId: "", upazilaId: "" });
}}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring"
>
<option value="">{labels?.division ?? "All divisions"}</option>
{divisions.map((item) => (
<option key={item.id} value={item.id}>{item.name}</option>
))}
</select>
<select
name="districtId"
aria-label="District"
value={districtId}
onChange={(event) => {
setDistrictId(event.target.value);
setUpazilaId("");
submit({ districtId: event.target.value, upazilaId: "" });
}}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring disabled:bg-slate-100"
>
<option value="">{labels?.district ?? "All districts"}</option>
{districtChoices.map((item) => (
<option key={item.id} value={item.id}>{item.name}</option>
))}
</select>
<select
name="upazilaId"
aria-label="Upazila"
value={upazilaId}
onChange={(event) => {
setUpazilaId(event.target.value);
submit({ upazilaId: event.target.value });
}}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring disabled:bg-slate-100"
>
<option value="">{labels?.upazila ?? "All upazilas"}</option>
{upazilaChoices.map((item) => (
<option key={item.id} value={item.id}>{item.name}</option>
))}
</select>
{showCategory && categories && (
<select
name="category"
aria-label="Category"
value={categoryValue}
onChange={(event) => { setCategoryValue(event.target.value); submit({ category: event.target.value }); }}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring"
>
<option value="">All categories</option>
{categories.map((item) => (
<option key={item.value} value={item.value}>{item.label}</option>
))}
</select>
)}
{extraSelects?.map((extra) => (
<select
key={extra.name}
name={extra.name}
aria-label={extra.label}
value={extraValues[extra.name] ?? ""}
onChange={(event) => { setExtraValues((currentValues) => ({ ...currentValues, [extra.name]: event.target.value })); submit({ [extra.name]: event.target.value }); }}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring"
>
<option value="">All {extra.label.toLowerCase()}</option>
{extra.options.map((item) => (
<option key={item.value} value={item.value}>{item.label}</option>
))}
</select>
))}
<select
name="sort"
aria-label="Sort"
value={sortValue}
onChange={(event) => { setSortValue(event.target.value); submit({ sort: event.target.value }); }}
className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-ring"
>
{sortOptions.includes("relevance") && <option value="relevance">By relevance</option>}
{sortOptions.includes("name") && <option value="name">By name</option>}
{sortOptions.includes("newest") && <option value="newest">Newest first</option>}
{sortOptions.includes("rating") && <option value="rating">By highest rating</option>}
</select>
</div>
{hidden.map(([key, value]) => (
<input key={key} type="hidden" name={key} value={value} />
))}
<div className="mt-4 flex justify-end gap-2">
<Link
href={action}
scroll={false}
className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-ring"
>
Clear filters
</Link>
<button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus-ring">
Apply filters
</button>
</div>
</form>
); }
