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
      <Link href="/login" className="rounded-lg border border-white/30 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm">Log in</Link>
      <Link href="/register" className="rounded-lg border border-white/30 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm">Create account</Link>
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
    <div className="mx-auto mt-6 w-full rounded-2xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md sm:p-4 md:max-w-2xl" aria-hidden="true">
      <div className="h-9 animate-pulse rounded-lg bg-white/70 sm:h-11" />
      <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="dc-home-hero gradient-hero relative z-20 isolate overflow-visible">
        <VideoBackground src="/images/banner/homePage.mp4" className="bg-brand-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-900/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        <div className="container-x relative flex min-h-[450px] items-center justify-center py-10 text-center sm:min-h-[520px] sm:py-14 lg:min-h-[570px] lg:py-20">
          <div className="dc-home-hero-content enter-fade mx-auto w-full max-w-4xl">
            <div className="flex justify-center">
              <Badge tone="accent" className="bg-white/10 text-white ring-white/20">
                Bangladesh's information & community platform
              </Badge>
            </div>
            <h1 className="mt-4 text-[1.35rem] font-extrabold tracking-tight leading-snug text-white sm:mt-5 sm:text-5xl sm:leading-tight lg:text-6xl">
              Discover your Bangladesh.
              <span className="block text-emerald-300">Connect with your community.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-100 sm:mt-5 sm:text-lg sm:leading-7">
              Find local places, institutions, public services, news and community support — all in one place.
            </p>
            <Suspense fallback={<HomeHeroSearchFallback />}>
              <div className="mx-auto mt-5 w-full max-w-2xl text-left sm:mt-6">
                <HomeHeroSearch />
              </div>
            </Suspense>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3">
              <Link href="/places" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-700 sm:px-4 sm:py-2 sm:text-sm">
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
