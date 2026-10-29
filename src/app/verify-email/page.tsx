import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Verify email", robots: { index: false, follow: false } };

export default function VerifyEmailPage() {
  return (
    <>
      <PageHeader title="Verify your email" description="Check your inbox to finish setting up your account." />
      <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Check your inbox</h1>
          <p className="mt-3 text-slate-600">
            We’ve sent a verification link to your email address. Click the link to verify your account and enable all features.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
              Return to login
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Go to dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            No email provider is configured in local mode, so verification emails are not delivered during development.
          </p>
        </div>
      </div>
    </>
  );
}
