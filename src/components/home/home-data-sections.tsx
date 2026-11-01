import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORY_SHORTCUTS } from "@/config/site";
import { listGovernmentServices } from "@/services/government-services";
import { listInstitutions } from "@/services/institutions";
import { listHospitals } from "@/services/hospitals";
import { featuredPlaces } from "@/services/places";
import { listDivisions } from "@/services/locations";
import { listNews } from "@/services/news";
import { listPosts } from "@/services/community";
import { Badge, Section } from "@/components/ui/badge";
import { CategoryCard } from "@/components/cards/category-card";
import { InstitutionCard } from "@/components/cards/institution-card";
import { NewsCard } from "@/components/cards/news-card";
import { PlaceCard } from "@/components/cards/place-card";
import { Icon } from "@/components/ui/icons";
import { ListGrid } from "@/components/layout/list-grid";

async function loadOr<T>(promise: Promise<T>, fallback: T, timeoutMs = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<T>((resolve) => { timer = setTimeout(() => resolve(fallback), timeoutMs); })]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center shadow-sm"><p className="font-semibold text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{children}</p></div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-6 max-w-2xl"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p><h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p></div>;
}

export function HomeSectionsFallback() {
  return <div className="container-x space-y-8 py-12" aria-label="Loading homepage content">
    <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}</div>
    <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
  </div>;
}

export async function HomeDataSections({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [divisions, featured, institutions, hospitals, services, posts, news] = await Promise.all([
    loadOr(listDivisions(), []),
    loadOr(featuredPlaces(6), []),
    loadOr(listInstitutions({ page: 1, pageSize: 2 }).then((result) => result.items), []),
    loadOr(listHospitals({ page: 1, pageSize: 2 }).then((result) => result.items), []),
    loadOr(listGovernmentServices({ page: 1, pageSize: 4 }).then((result) => result.items.slice(0, 4)), []),
    loadOr(listPosts({ page: 1, pageSize: 3 }).then((result) => result.items.slice(0, 3)), []),
    loadOr(listNews({ page: 1, pageSize: 3 }).then((result) => result.items.slice(0, 3)), []),
  ]);

  return <>
    <section className="dc-home-blood container-x py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 p-6 border border-rose-300/30 shadow-xl shadow-rose-500/10 sm:p-9">
        <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
        <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white shadow-lg shadow-rose-950/20 ring-1 ring-white/25 sm:h-16 sm:w-16"><Icon name="heart" className="h-8 w-8 animate-pulse drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-100">A little help can save a life</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Be someone’s reason to hope.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">Find voluntary blood donors, explore available donor listings, or register to help someone in need. Your next action could make a real difference.</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col"><Link href={isAuthenticated ? "/blood-donation" : "/register"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-rose-700 shadow-lg shadow-rose-950/15 transition hover:-translate-y-0.5 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-600">Contribute to Blood Bank <span aria-hidden="true">→</span></Link><Link href="/blood-donation" className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20">Find blood donors</Link></div>
        </div>
      </div>
    </section>

    <section className="container-x py-12 md:py-16"><SectionHeading eyebrow="Quick access" title="What are you looking for?" description="Jump straight to the category you need."/><ListGrid className="sm:grid-cols-2 lg:grid-cols-4">{CATEGORY_SHORTCUTS.map((item) => <CategoryCard key={item.href} item={item} />)}</ListGrid></section>

    <Section className="py-12 md:py-16" title="Explore Bangladesh" description="Choose a division to continue to district and upazila guides."><ListGrid>{divisions.map((division) => { const regionalIcon: Record<string, string> = { dhaka: "🏙️", chattogram: "🌊", rajshahi: "🌾", khulna: "🌿", barishal: "⛵", sylhet: "🍃", rangpur: "🌻", mymensingh: "🌳" }; return <Link key={division.id} href={`/divisions/${division.slug}`} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"><div className="flex items-center gap-3"><span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xl">{regionalIcon[division.slug.toLowerCase()] ?? "📍"}</span><div><h3 className="font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">{division.name}</h3><p className="mt-1 text-sm text-slate-500"><span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{division.districtsCount} districts</span> <span aria-hidden="true">·</span> Explore places</p></div></div><Icon name="arrow-right" className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></Link>; })}{divisions.length === 0 && <EmptyState title="Location guides are being prepared">Division, district and upazila guides will appear here when available.</EmptyState>}</ListGrid></Section>

    <section className="bg-white"><Section className="py-12 md:py-16" title="Find your next favorite place" description="Selected destinations across the country." action={<Link href="/places" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">View all places →</Link>}><ListGrid>{featured.map((place) => <PlaceCard key={place.id} place={place} locationLabel={(place.address ?? "").split(",").slice(-2).join(",").trim()} />)}{featured.length === 0 && <EmptyState title="Places are being prepared">Place listings will appear here once content is available.</EmptyState>}</ListGrid></Section></section>

    <Section className="py-12 md:py-16" title="Institutions & healthcare" description="Schools, colleges, hospitals and health centres near you." action={<div className="flex gap-3 text-sm font-bold"><Link href="/institutions" className="text-emerald-700 hover:text-emerald-800">Institutions →</Link><Link href="/hospitals" className="text-emerald-700 hover:text-emerald-800">Hospitals →</Link></div>}><ListGrid>{[...institutions, ...hospitals].slice(0, 4).map((institution) => <InstitutionCard key={institution.id} institution={institution} />)}{institutions.length + hospitals.length === 0 && <EmptyState title="Directory listings are coming soon">Local institutions and healthcare facilities will appear here as listings are added.</EmptyState>}</ListGrid></Section>

    <section className="bg-white"><Section className="py-12 md:py-16" title="Government services" description="Government offices and required documents." action={<Link href="/government-services" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">All services →</Link>}><ListGrid>{services.map((service) => <Link key={service.id} href={`/government-services/${service.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon name="landmark" className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{service.name}</h3><p className="text-sm text-slate-500">{service.officeAddress}</p></div></div></Link>)}{services.length === 0 && <EmptyState title="Government service guides are coming soon">Published service details will appear here.</EmptyState>}</ListGrid></Section></section>

    <section className="bg-white"><Section className="py-12 md:py-16" title="Community activity & latest news" description="Community updates and published news from DeshConnect."><div className="grid gap-8 lg:grid-cols-2"><div><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">Community activity</h3><Link href="/community" className="text-sm font-bold text-emerald-700">Join discussion →</Link></div><div className="space-y-3">{posts.map((post) => <Link key={post.id} href={`/community/${post.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"><p className="line-clamp-2 text-sm text-slate-700">{post.body}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Icon name="heart" className="h-3.5 w-3.5" /> {post.reactions}<span>·</span><Icon name="message" className="h-3.5 w-3.5" /> comments</p></Link>)}{posts.length === 0 && <EmptyState title="Community posts are coming soon">Posts will appear here when community members join.</EmptyState>}</div></div><div><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">Latest news</h3><Link href="/news" className="text-sm font-bold text-emerald-700">All news →</Link></div><ListGrid className="sm:grid-cols-1">{news.map((item) => <NewsCard key={item.id} news={item} />)}{news.length === 0 && <EmptyState title="News and stories are coming soon">Published news will appear here when available.</EmptyState>}</ListGrid></div></div></Section></section>

    <section className="gradient-band"><div className="container-x py-14 text-center text-white sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Be part of the community</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Connect with Bangladesh through DeshConnect</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">Save places, join the community, submit news, register as a blood donor and connect with people around you.</p><div className="mt-7 flex flex-wrap items-center justify-center gap-3"><Link href="/register" className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700">Create account</Link><Link href="/about" className="rounded-xl border border-white/40 px-5 py-3 font-bold text-white hover:bg-white/10">Learn more</Link></div></div></section>
  </>;
}
