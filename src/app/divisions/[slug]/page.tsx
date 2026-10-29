import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getDivisionBySlug, listDistricts } from "@/services/locations"; import { listGovernmentServices } from "@/services/government-services"; import { listInstitutions } from "@/services/institutions"; import { placesByDivision } from "@/services/places"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { InstitutionCard } from "@/components/cards/institution-card"; import { PlaceCard } from "@/components/cards/place-card"; import { ListGrid } from "@/components/layout/list-grid";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const division = await getDivisionBySlug(slug);
if (!division) return { title: "Division not found" };
return { title: `${division.name} Division`, description: division.summary, alternates: { canonical: `/divisions/${division.slug}` } }; }
export default async function DivisionPage({ params }: Props) {
const { slug } = await params;
const division = await getDivisionBySlug(slug);
if (!division) return <EmptyRecordPage title="Division guide" description="Explore places, institutions and services across this division." media="/images/banner/homePage.mp4" backHref="/" backLabel="Explore DeshConnect" />;
const [districts, places, institutions, services] = await Promise.all([
listDistricts(division.id),
placesByDivision(division.id, 6),
listInstitutions({ divisionId: division.id, page: 1 }).then((result) => result.items.slice(0, 4)),
listGovernmentServices({ divisionId: division.id, page: 1 }).then((result) => result.items.slice(0, 4)),
]);
return (
<div className="container-x py-8">
<div className="gradient-band rounded-2xl border border-slate-200 p-8 text-white">
<p className="text-sm text-brand-100">{division.name}</p>
<h1 className="mt-1 text-3xl font-bold">{division.name} Division</h1>
<p className="mt-2 max-w-2xl text-brand-50">{division.summary}</p>
<div className="mt-4 flex gap-6 text-sm">
<span>Capital: <strong>{division.name}</strong></span>
<span>{division.districtsCount} districts</span>
</div>
</div>
<section className="mt-10">
<h2 className="text-xl font-semibold text-slate-900">{division.name} Division's districts</h2>         <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols=3">           {districts.map((district) => (             <Link               key={district.id}               href={`/districts/${district.slug}`}               className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300"             >               <div>                 <p className="font-medium text-slate-900">{district.name}</p>                 <p className="text-xs text-slate-500">{district.summary}</p>               </div>               <Icon name="arrow-right" className="h-4 w-4 text-slate-300" />             </Link>           ))}         </div>       </section>        {places.length > 0 && (         <section className="mt-12">           <h2 className="text-xl font-semibold text-slate-900">Places to visit</h2>           <ListGrid className="mt-4">             {places.map((place) => (               <PlaceCard key={place.id} place={place} />             ))}           </ListGrid>           <Link href={`/places?divisionId=${division.id}`} className="mt-4 inline-block text-sm font-medium text-brand-700">             View all places →           </Link>         </section>       )}        {institutions.length > 0 && (         <section className="mt-12">           <h2 className="text-xl font-semibold text-slate-900">Institutions</h2>           <ListGrid className="mt-4">             {institutions.map((institution) => (               <InstitutionCard key={institution.id} institution={institution} />             ))}           </ListGrid>         </section>       )}        {services.length > 0 && (         <section className="mt-12">           <h2 className="text-xl font-semibold text-slate-900">Government services</h2>           <div className="mt-4 grid gap-3 sm:grid-cols=2">             {services.map((service) => (               <Link key={service.id} href={`/government-services/${service.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300">                 <Icon name="landmark" className="h-5 w-5 text-brand-600" />                 <div>                   <p className="text-sm font-medium text-slate-900">{service.name}</p>                   <p className="text-xs text-slate-500">{service.officeAddress}</p>                 </div>               </Link>             ))}           </div>         </section>       )}        <div className="mt-10">         <Badge tone="brand">Division</Badge>       </div>     </div>   ); }
