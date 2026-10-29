import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
export const metadata: Metadata = { title: "Forgot password?", robots: { index: false, follow: false } };
export default function ForgotPasswordPage() {
return (
<>
<PageHeader title="Forgot password?" description="We'll help you get back into your DeshConnect account." />
<div className="container-x flex min-h-[70vh] items-center justify-center py-12">
<div className="w-full max-w-md">
<ForgotPasswordForm />
</div>
</div>
 </>
); }
