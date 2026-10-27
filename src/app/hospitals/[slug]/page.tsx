// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getHospitalBySlug } from "@/services/institutions";
import { InstitutionDetail } from "@/components/institutions/institution-detail";
import { Icon } from "@/components/ui/icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hospital = await getHospitalBySlug(slug);
  if (!hospital) return { title: "Hospital not found" };
  return { title: hospital.name, description: hospital.description, alternates: { canonical: `/hospitals/${hospital.slug}` } };
}

export default async function HospitalDetailPage({ params }: Props) {
  const { slug } = await params;
  const hospital = await getHospitalBySlug(slug);
  if (!hospital) return <EmptyRecordPage title="Hospitals and health centres" description="Find hospitals and health services near you." media="/images/banner/Hospital.webp" backHref="/hospitals" backLabel="Browse hospitals" />;

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-cyan-50/70 via-white to-white">
      <div className="container-x py-6 sm:py-9">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500"><Link href="/" className="hover:text-brand-700">Home</Link><span>/</span><Link href="/hospitals" className="hover:text-brand-700">Hospitals</Link><span>/</span><span className="max-w-[55vw] truncate font-medium text-slate-800">{hospital.name}</span></nav>
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-800"><Icon name="heart-pulse" className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-800">Facility details</p><p className="text-sm text-slate-600">Review the available listing information below.</p></div></div><Link href="/hospitals" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800"><Icon name="arrow-left" className="h-4 w-4" /> All hospitals</Link></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6"><InstitutionDetail institution={hospital} /></div>
        <div className="mt-7 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:flex sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Icon name="heart" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><div><p className="font-bold text-slate-900">Blood donation support</p><p className="mt-1 text-sm text-slate-600">Need a donor? Visit the blood donation directory to search or request blood.</p></div></div><Link href="/blood-donation" className="mt-3 inline-flex rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 sm:mt-0">Find blood donors →</Link></div>
      </div>
    </div>
  );
}
