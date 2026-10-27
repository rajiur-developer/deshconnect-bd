// @ts-nocheck
import type { Metadata } from "next";
import { buildHref, firstParam, parseSort } from "@/lib/query";
import { parsePage } from "@/lib/utils";
import { getDirectoryLocationOptions } from "@/services/locations";
import { listHospitals } from "@/services/institutions";
import { DirectoryFilters } from "@/components/search/directory-filters";
import { InstitutionCard } from "@/components/cards/institution-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PageBanner } from "@/components/layout/page-banner";
import { ListGrid } from "@/components/layout/list-grid";
import { Icon } from "@/components/ui/icons";
import Link from "next/link";

export const metadata: Metadata = { title: "Hospitals and health centres" };

export default async function HospitalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const divisionId = firstParam(params.divisionId);
  const districtId = firstParam(params.districtId);
  const upazilaId = firstParam(params.upazilaId);
  const query = { q: firstParam(params.q), divisionId, districtId, upazilaId, sort: parseSort(params.sort), page: parsePage(firstParam(params.page)) };
  const [{ items, meta }, options] = await Promise.all([listHospitals(query), getDirectoryLocationOptions()]);

  return (
    <>
      <PageBanner title="Hospitals and health centres" description="Find hospitals, clinics and health centres, with verified emergency numbers." media="/images/banner/Hospital.webp" />
      <div className="container-x py-8 sm:py-10">
        <div className="mb-7 flex flex-col gap-4 rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-white to-cyan-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-cyan-800"><Icon name="heart" className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Healthcare directory</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Hospitals near your community</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Browse available facility listings and narrow results by division, district and upazila.</p></div></div>
          <div className="rounded-2xl border border-cyan-100 bg-white px-5 py-3"><p className="text-2xl font-bold text-slate-950">{meta.total.toLocaleString()}</p><p className="text-xs font-medium text-slate-500">listed facilities</p></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2"><Icon name="filter" className="h-4 w-4 text-brand-700" /><h2 className="text-sm font-bold text-slate-900">Find a facility</h2></div>
          <DirectoryFilters action="/hospitals" params={params} divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} sortOptions={["relevance", "name", "newest"]} current={{ divisionId, districtId, upazilaId }} />
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Directory results</p><h2 className="mt-1 text-xl font-bold text-slate-950">Available hospitals</h2></div><p className="text-sm text-slate-500">{meta.total.toLocaleString()} records found</p></div>
        {items.length ? <ListGrid className="mt-5">{items.map((institution) => <InstitutionCard key={institution.id} institution={institution} />)}</ListGrid> : <div className="mt-5"><EmptyState title="No hospitals match your filters" icon={<Icon name="heart" className="h-10 w-10" />} /></div>}
        <Pagination meta={meta} hrefFor={(page) => buildHref("/hospitals", params, { page })} />
        <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:flex sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Icon name="heart" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><div><p className="font-bold text-slate-900">Looking for a blood donor?</p><p className="mt-1 text-sm text-slate-600">Open the DeshConnect blood donation directory to find donors or submit a request.</p></div></div><Link href="/blood-donation" className="mt-3 inline-flex rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 sm:mt-0">Blood donation support →</Link></div>
      </div>
    </>
  );
}
