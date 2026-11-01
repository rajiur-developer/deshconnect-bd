import Link from "next/link";
import { Suspense } from "react";
import { SITE } from "@/config/site";
import { listDivisions } from "@/services/locations";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Badge } from "@/components/ui/badge";
import { HeroSearch } from "@/components/search/hero-search";
import { VideoBackground } from "@/components/layout/video-background";
import { HomeDataSections, HomeSectionsFallback } from "@/components/home/home-data-sections";

export const metadata = { title: SITE.name, description: SITE.description };

async function loadOr<T>(promise: Promise<T>, fallback: T, timeoutMs = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function HomeHeroActions() {
  const user = await loadOr(getCurrentUser(), null);
  if (user) return null;
  return (
    <>
      <Link href="/login" className="rounded-lg border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Log in</Link>
      <Link href="/register" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Create account</Link>
    </>
  );
}

async function HomeDataContent() {
  const user = await loadOr(getCurrentUser(), null);
  return <HomeDataSections isAuthenticated={Boolean(user)} />;
}

async function HomeHeroSearch() {
  const [user, divisions] = await Promise.all([
    loadOr(getCurrentUser(), null),
    loadOr(listDivisions(), []),
  ]);

  return <HeroSearch divisions={divisions} user={user} />;
}

function HomeHeroSearchFallback() {
  return (
    <div className="mx-auto mt-6 w-full max-w-sm rounded-2xl border border-white/20 bg-white/90 p-2.5 shadow-lg" aria-hidden="true">
      <div className="h-[38px] animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="dc-home-hero gradient-hero relative isolate overflow-hidden">
        <VideoBackground src="/images/banner/homePage.mp4" className="bg-brand-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/75 to-brand-900/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-brand-950/20" />
        <div className="container-x relative flex min-h-[570px] items-center justify-center py-14 text-center sm:py-16 lg:py-20">
          <div className="dc-home-hero-content enter-fade mx-auto w-full max-w-4xl">
            <div className="flex justify-center">
              <Badge tone="accent" className="bg-white/10 text-white ring-white/20">
                Bangladesh's information & community platform
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-snug text-white sm:mt-5 sm:text-5xl sm:leading-tight lg:text-6xl">
              Discover your Bangladesh.
              <span className="block text-brand-300">Connect with your community.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-brand-50 sm:mt-5 sm:text-lg sm:leading-7">
              Find local places, institutions, public services, news and community support — all in one place.
            </p>
            <Suspense fallback={<HomeHeroSearchFallback />}>
              <div className="mx-auto mt-5 w-full max-w-sm text-left sm:mt-6">
                <HomeHeroSearch />
              </div>
            </Suspense>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5">
              <Link href="/places" className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-brand-800 shadow-lg shadow-black/10 transition hover:bg-brand-50">
                Explore places <span aria-hidden="true">→</span>
              </Link>
              <Suspense fallback={null}>
                <HomeHeroActions />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<HomeSectionsFallback />}>
        <HomeDataContent />
      </Suspense>
    </>
  );
}
