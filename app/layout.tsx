import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QuoteProvider } from "@/context/QuoteContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import Analytics from "@/components/Analytics";
import PostHogProvider from "@/components/PostHogProvider";
import PageTransition from "@/components/PageTransition";
import ClientFloats from "@/components/ClientFloats";
import ScrollProgress from "@/components/ScrollProgress";
import { Toaster } from "sonner";

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
});

const SITE_URL = "https://www.aplustechsol.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aplus Technology Solutions | Authorized Samsung Business Display Distributor",
    template: "%s | Aplus Technology Solutions",
  },
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs. End-to-end supply, installation & support across India.",
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
      "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs across India.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jakartaSans.variable} bg-background text-foreground`}>
        <ScrollProgress />
        <Toaster richColors position="bottom-right" />
        <Analytics gaId={GA_ID} />

        {/* Skip-to-content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:bg-blue-600 focus:text-white focus:px-5 focus:py-2.5 focus:rounded-xl focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>

        <PostHogProvider>
          <QuoteProvider>
            <ComparisonProvider>
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
            </ComparisonProvider>
          </QuoteProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
