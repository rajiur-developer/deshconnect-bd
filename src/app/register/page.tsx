import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getDirectoryLocationOptions } from "@/services/locations";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const options = await getDirectoryLocationOptions().catch(() => ({
    divisions: [],
    districts: [],
    upazilas: [],
  }));

  return (
    <>
      <PageHeader
        title="Create your account"
        description="Join DeshConnect and take part in your community."
      />
      <main className="bg-slate-50/70">
        <div className="container-x flex min-h-[70vh] items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
            <RegisterForm
              divisions={options.divisions}
              districts={options.districts}
              upazilas={options.upazilas}
            />
          </div>
        </div>
      </main>
    </>
  );
}
