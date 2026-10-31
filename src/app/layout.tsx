import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { SITE } from "@/config/site";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageTheme } from "@/components/layout/page-theme";
import { ToastProvider } from "@/components/ui/toast";
import { AuthFeedback } from "@/components/ui/auth-feedback";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: SITE.twitter, title: SITE.name, description: SITE.description },
  icons: {
    icon: "/icons/favicon.svg?v=4a9263cc",
    shortcut: "/icons/favicon.svg?v=4a9263cc",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3d2e",
};

async function AuthenticatedShell() {
  const user = await getCurrentUser();
  return (
    <>
      <VisitorTracker enabled={!user || user.role === "user"} />
      <Header user={user} />
    </>
  );
}

function HeaderFallback() {
  return <div className="h-[4.5rem] border-b border-gray-200/50 bg-white/90" aria-hidden="true" />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = "en";

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        <LanguageProvider
          initialLocale={locale}
          enabled={false}
          translationConfigured={Boolean(process.env.LIBRETRANSLATE_URL)}
        >
          <ToastProvider>
            <AuthFeedback />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to main content
            </a>
            <Suspense fallback={<HeaderFallback />}>
              <AuthenticatedShell />
            </Suspense>
            <main id="main-content" className="flex-1">
              <PageTheme>{children}</PageTheme>
            </main>
            <Footer />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
