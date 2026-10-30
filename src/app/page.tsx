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
      <section className="dc-home-hero relative isolate overflow-hidden bg-brand-950">
        <VideoBackground src="/images/banner/homePage.mp4" className="bg-brand-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/75 to-brand-900/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-brand-950/20" />
        <div className="container-x relative flex min-h-[570px] items-center justify-center py-14 text-center sm:py-16 lg:py-20">
          <div className="dc-home-hero-content enter-fade mx-auto w-full max-w-4xl">
            <div className="flex justify-center"><Badge tone="accent" className="bg-white/10 text-white ring-white/20">Bangladesh's information & community platform</Badge></div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Discover your Bangladesh.<span className="block text-brand-300">Connect with your community.</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-50 sm:text-lg">Find local places, institutions, public services, news and community support — all in one place.</p>
            <div className="mx-auto mt-8 w-full max-w-3xl text-left"><HeroSearch divisions={divisions} user={user} /></div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/places" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-800 shadow-lg shadow-black/10 hover:bg-brand-50">Explore places <span aria-hidden="true">→</span></Link>
              {!user && <><Link href="/login" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Log in</Link><Link href="/register" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Create account</Link></>}
            </div>
          </div>
        </div>
      </section>

      <section className="dc-home-blood container-x py-8 sm:py-10" aria-labelledby="blood-donation-highlight">
        <div className="relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-red-50 p-6 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/20 sm:h-16 sm:w-16">
                <Icon name="heart" className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">A little help can save a life</p>
                <h2 id="blood-donation-highlight" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Be someone’s reason to hope.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Find voluntary blood donors, explore available donor listings, or register to help someone in need. Your next action could make a real difference.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/blood-donation" className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700"><Icon name="droplet" className="h-4 w-4" /> Find blood donors</Link>
              <Link href={user ? "/blood-donation" : "/register"} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50">{user ? "Become a donor" : "Join as a donor"} <span aria-hidden="true">→</span></Link>
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
