import { Metadata } from "next";
import dynamic from "next/dynamic";
import HomeJsonLd from "@/components/sections/HomeJsonLd";
import HeroSection from "@/components/sections/HeroSection";
import CategoryGrid from "@/components/sections/CategoryGrid";

// Below-fold sections — deferred JS execution, SSR kept for SEO
const ClientLogoStrip = dynamic(() => import("@/components/sections/ClientLogoStrip"));
const ProductCatalogSection = dynamic(() => import("@/components/ProductCatalogSection"));
const IndustrySolutions = dynamic(() => import("@/components/sections/IndustrySolutions"));
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks"));
const WhyChooseUs = dynamic(() => import("@/components/sections/WhyChooseUs"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA"));

export const metadata: Metadata = {
  title: "Aplus Technology Solutions — Samsung B2B Display Partner, India",
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays & Hospitality TVs. Pan-India delivery, certified installation, 24/7 support.",
  keywords: [
    "Samsung Business TV",
    "Video Wall",
    "Digital Signage",
    "Interactive Display",
    "Hotel TV",
    "Samsung Distributor India",
    "B2B Display Solutions",
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HomeJsonLd />
      <HeroSection />
      <CategoryGrid />
      <ClientLogoStrip />
      <ProductCatalogSection />
      <IndustrySolutions />
      <HowItWorks />
      <WhyChooseUs />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}
