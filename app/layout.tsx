import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { spaceGroteskCard, plexMonoCard } from "@/app/fonts-accent";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QuoteProvider } from "@/context/QuoteContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { ChatProvider } from "@/context/ChatContext";
import Analytics from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import PageTransition from "@/components/PageTransition";
import ClientFloats from "@/components/ClientFloats";
import ScrollProgress from "@/components/ScrollProgress";
import ResponsiveToaster from "@/components/ResponsiveToaster";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // Variable font; specifying explicit numeric range keeps payload tight
  // and avoids loading 100/200 weights we never style with.
  weight: ["400", "500", "600", "700"],
});
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
  // preload:false — on the homepage the hero H1 (the LCP element) shadows
  // --font-display with Space Grotesk, so preloading Jakarta here only adds a
  // third font <link rel=preload> that competes with Space Grotesk for the
  // mobile connection pipe and delays the LCP paint. Jakarta is metric-matched
  // (adjustFontFallback), so its below-the-fold headings swap in without CLS.
  preload: false,
});

const SITE_URL = "https://www.aplustechsol.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aplus Technology Solutions | Authorized Samsung Business Display Distributor",
    template: "%s | Aplus Technology Solutions",
  },
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs — and Logitech video conferencing systems. End-to-end supply, installation & support across India.",
  keywords: [
    "Samsung digital signage India",
    "Samsung video wall distributor",
    "commercial display India",
    "Samsung smart signage",
    "hotel TV supplier India",
    "interactive display",
    "Samsung authorized distributor Noida",
  ],
  authors: [{ name: "Aplus Technology Solutions Pvt. Ltd." }],
  creator: "Aplus Technology Solutions",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Aplus Technology Solutions",
    title: "Aplus Technology Solutions | Authorized Samsung Business Display Distributor",
    description:
      "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs — plus Logitech video conferencing — across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aplus Technology Solutions | Samsung Business Displays",
    description: "Authorized Samsung distributor — Smart Signage, Video Walls, Interactive Displays & Hotel TVs across India.",
    images: ["/og-default.png"],
  },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Analytics / tracking */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* No font-CDN preconnects on purpose: next/font/google self-hosts the
            woff2 files at build time under /_next/static/media (same origin), so
            fonts.googleapis.com / fonts.gstatic.com are never hit at runtime.
            Preconnecting to unused origins only steals connection slots from the
            real, same-origin LCP font — the opposite of what we want. */}
      </head>
      <body className={`${inter.className} ${jakartaSans.variable} ${spaceGroteskCard.variable} ${plexMonoCard.variable} bg-background text-foreground`}>
        <ScrollProgress />
        <ResponsiveToaster />
        <Analytics gaId={GA_ID} />
        <VercelAnalytics />

        {/* Skip-to-content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:bg-blue-600 focus:text-white focus:px-5 focus:py-2.5 focus:rounded-xl focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>

        <QuoteProvider>
          <ComparisonProvider>
            <ChatProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main
                  id="main-content"
                  className="flex-1 bg-white"
                >
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
              </div>
              <ClientFloats />
            </ChatProvider>
          </ComparisonProvider>
        </QuoteProvider>
      </body>
    </html>
  );
}
