import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" description="This address does not have a published page yet. Explore the rest of DeshConnect below." />
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">We couldn’t find that page</h1>
        <p className="mt-2 max-w-md text-slate-600">The address may be incorrect, or the page has not been published yet.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Go to homepage</Link>
          <Link href="/places" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Visit places</Link>
        </div>
      </div>
    </>
  );
}
