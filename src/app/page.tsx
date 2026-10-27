import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORY_SHORTCUTS, SITE } from "@/config/site";
import { listGovernmentServices } from "@/services/government-services";
import { listInstitutions } from "@/services/institutions";
import { featuredPlaces } from "@/services/places";
import { listDivisions } from "@/services/locations";
import { listNews } from "@/services/news";
import { listPosts } from "@/services/community";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Badge, Section } from "@/components/ui/badge";
import { CategoryCard } from "@/components/cards/category-card";
import { InstitutionCard } from "@/components/cards/institution-card";
import { NewsCard } from "@/components/cards/news-card";
import { PlaceCard } from "@/components/cards/place-card";
import { Icon } from "@/components/ui/icons";
import { HeroSearch } from "@/components/search/hero-search";
import { ListGrid } from "@/components/layout/list-grid";
import { VideoBackground } from "@/components/layout/video-background";

export const metadata = { title: SITE.name, description: SITE.description };

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
  return <div className="mb-6 max-w-2xl"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">{eyebrow}</p><h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p></div>;
}

export default async function HomePage() {
  const user = await loadOr(getCurrentUser(), null);
  const [divisions, featured, institutions, services, posts, news] = await Promise.all([
    loadOr(listDivisions(), []),
    loadOr(featuredPlaces(6), []),
    loadOr(listInstitutions({ page: 1, pageSize: 4 }).then((result) => result.items.slice(0, 4)), []),
    loadOr(listGovernmentServices({ page: 1, pageSize: 4 }).then((result) => result.items.slice(0, 4)), []),
    loadOr(listPosts({ page: 1, pageSize: 3 }).then((result) => result.items.slice(0, 3)), []),
    loadOr(listNews({ page: 1, pageSize: 3 }).then((result) => result.items.slice(0, 3)), []),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-950">
        <VideoBackground src="/images/banner/homePage.mp4" className="bg-brand-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/75 to-brand-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-brand-950/20" />
        <div className="container-x relative grid min-h-[570px] items-center gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="enter-fade max-w-2xl">
            <Badge tone="accent" className="bg-white/10 text-white ring-white/20">Bangladesh's information & community platform</Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Discover your Bangladesh.<span className="block text-brand-300">Connect with your community.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-brand-50 sm:text-lg">Find local places, institutions, public services, news and community support — all in one place.</p>
            <div className="mt-8"><HeroSearch divisions={divisions} user={user} /></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/places" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-800 shadow-lg shadow-black/10 hover:bg-brand-50">Explore places <span aria-hidden="true">→</span></Link>
              {!user && <><Link href="/login" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Log in</Link><Link href="/register" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Create account</Link></>}
            </div>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <div className="rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-50 text-accent-600"><Icon name="heart" className="h-6 w-6" /></span>
                <div><p className="mt-2 text-sm leading-6 text-slate-600">Discover helpful local information and reach the services and people that matter.</p></div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href="/blood-donation" className="group rounded-2xl border border-accent-100 bg-accent-50 p-4 transition hover:-translate-y-0.5 hover:border-accent-500"><Icon name="heart" className="h-5 w-5 text-accent-600" /><span className="mt-3 block font-bold text-slate-900">Blood donation</span><span className="mt-1 block text-xs text-slate-600">Find donors & request blood</span><span className="mt-3 block text-sm font-bold text-accent-700">Open blood support →</span></Link>
                <Link href="/institutions" className="group rounded-2xl border border-brand-100 bg-brand-50 p-4 transition hover:-translate-y-0.5 hover:border-brand-300"><Icon name="landmark" className="h-5 w-5 text-brand-700" /><span className="mt-3 block font-bold text-slate-900">Local services</span><span className="mt-1 block text-xs text-slate-600">Institutions and public help</span><span className="mt-3 block text-sm font-bold text-brand-700">Browse services →</span></Link>
              </div>
              <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">DeshConnect helps people explore information across Bangladesh. Availability of listings depends on published community content.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-10 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow="Quick access" title="What are you looking for?" description="Jump straight to the category you need."/></div>
        <ListGrid className="sm:grid-cols-2 lg:grid-cols-4">{CATEGORY_SHORTCUTS.map((item) => <CategoryCard key={item.href} item={item} />)}</ListGrid>
      </section>

      <Section title="Explore Bangladesh" description="Choose a division to continue to district and upazila guides."><ListGrid>{divisions.map((division) => <Link key={division.id} href={`/divisions/${division.slug}`} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"><div><h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{division.name}</h3><p className="mt-1 text-sm text-slate-500">{division.districtsCount} districts</p></div><Icon name="arrow-right" className="h-5 w-5 text-slate-300 group-hover:text-brand-600" /></Link>)}{divisions.length === 0 && <EmptyState title="Location guides are being prepared">Division, district and upazila guides will appear here when available.</EmptyState>}</ListGrid></Section>

      <section className="bg-white"><Section title="Find your next favorite place" description="Selected destinations across the country." action={<Link href="/places" className="text-sm font-bold text-brand-700 hover:text-brand-800">View all places →</Link>}><ListGrid>{featured.map((place) => <PlaceCard key={place.id} place={place} locationLabel={(place.address ?? "").split(",").slice(-2).join(",").trim()} />)}{featured.length === 0 && <EmptyState title="Places are being prepared">Place listings will appear here once content is available.</EmptyState>}</ListGrid></Section></section>

      <Section title="Local institutions & services" description="Schools, hospitals, health centers and government offices near you." action={<Link href="/institutions" className="text-sm font-bold text-brand-700 hover:text-brand-800">View institutions →</Link>}><ListGrid>{institutions.map((institution) => <InstitutionCard key={institution.id} institution={institution} />)}{institutions.length === 0 && <EmptyState title="Institution listings are coming soon">Local institutions will appear here as listings are added.</EmptyState>}</ListGrid></Section>

      <section className="bg-white"><Section title="Government services" description="Government offices and required documents." action={<Link href="/government-services" className="text-sm font-bold text-brand-700 hover:text-brand-800">All services →</Link>}><ListGrid>{services.map((service) => <Link key={service.id} href={`/government-services/${service.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name="landmark" className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{service.name}</h3><p className="text-sm text-slate-500">{service.officeAddress}</p></div></div></Link>)}{services.length === 0 && <EmptyState title="Government service guides are coming soon">Published service details will appear here.</EmptyState>}</ListGrid></Section></section>

      <section className="bg-white"><Section title="Community activity & latest news" description="Community updates and published news from DeshConnect."><div className="grid gap-8 lg:grid-cols-2"><div><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">Community activity</h3><Link href="/community" className="text-sm font-bold text-brand-700">Join discussion →</Link></div><div className="space-y-3">{posts.map((post) => <Link key={post.id} href={`/community/${post.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"><p className="line-clamp-2 text-sm text-slate-700">{post.body}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Icon name="heart" className="h-3.5 w-3.5" /> {post.reactions}<span>·</span><Icon name="message" className="h-3.5 w-3.5" /> comments</p></Link>)}{posts.length === 0 && <EmptyState title="Community posts are coming soon">Posts will appear here when community members join.</EmptyState>}</div></div><div><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">Latest news</h3><Link href="/news" className="text-sm font-bold text-brand-700">All news →</Link></div><ListGrid className="sm:grid-cols-1">{news.map((item) => <NewsCard key={item.id} news={item} />)}{news.length === 0 && <EmptyState title="News and stories are coming soon">Published news will appear here when available.</EmptyState>}</ListGrid></div></div></Section></section>

      <section className="gradient-band"><div className="container-x py-14 text-center text-white sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">Be part of the community</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Connect with Bangladesh through DeshConnect</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-brand-50 sm:text-base">Save places, join the community, submit news, register as a blood donor and connect with people around you.</p><div className="mt-7 flex flex-wrap items-center justify-center gap-3"><Link href="/register" className="rounded-xl bg-white px-5 py-3 font-bold text-brand-800 hover:bg-brand-50">Create account</Link><Link href="/about" className="rounded-xl border border-white/40 px-5 py-3 font-bold text-white hover:bg-white/10">Learn more</Link></div></div></section>
    </>
  );
}
