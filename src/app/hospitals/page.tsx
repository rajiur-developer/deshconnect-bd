import type { Metadata } from "next";
import { TranslatedText } from "@/components/i18n/translated-text";
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

export const metadata: Metadata = { title: "Hospitals and diagnostic centres" };

export default async function HospitalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const divisionId = firstParam(params.divisionId);
  const districtId = firstParam(params.districtId);
  const upazilaId = firstParam(params.upazilaId);
  const query = { q: firstParam(params.q), divisionId, districtId, upazilaId, sort: parseSort(params.sort), page: parsePage(firstParam(params.page)) };
  const [{ items, meta }, options] = await Promise.all([listHospitals(query), getDirectoryLocationOptions()]);

  return (
    <>
      <PageBanner title="Hospitals and diagnostic centres" description="Find hospitals, clinics, health centres and diagnostic centres across Bangladesh." media="/images/banner/Hospital.webp" />
      <div className="container-x pb-8 pt-0 sm:pb-10">
        <DirectoryFilters action="/hospitals" title="Find a facility" overlapBanner params={params} divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} current={{ divisionId, districtId, upazilaId }} />
        <div id="directory-results" className="scroll-mt-24 mt-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700"><TranslatedText text="Directory results" /></p><h2 className="mt-1 text-xl font-bold text-slate-950"><TranslatedText text="Available healthcare facilities" /></h2></div><p className="text-sm text-slate-500">{meta.total.toLocaleString()} records found</p></div>
        {items.length ? <ListGrid className="mt-5">{items.map((institution) => <InstitutionCard key={institution.id} institution={institution} />)}</ListGrid> : <div className="mt-5"><EmptyState title="No hospitals match your filters" icon={<Icon name="heart" className="h-10 w-10" />} /></div>}
        <Pagination meta={meta} hrefFor={(page) => buildHref("/hospitals", params, { page })} />
        <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:flex sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Icon name="heart" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><div><p className="font-bold text-slate-900"><TranslatedText text="Looking for a blood donor?" /></p><p className="mt-1 text-sm text-slate-600"><TranslatedText text="Open the DeshConnect blood donation directory to find donors or submit a request." /></p></div></div><Link href="/blood-donation" className="mt-3 inline-flex rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 sm:mt-0"><TranslatedText text="Blood donation support →" /></Link></div>
      </div>
    </>
  );
}
