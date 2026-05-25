import { Metadata } from "next";
import ProductCatalogSection from "@/components/ProductCatalogSection";
import HomeJsonLd from "@/components/sections/HomeJsonLd";
import HeroSection from "@/components/sections/HeroSection";
import ClientLogoStrip from "@/components/sections/ClientLogoStrip";
import CategoryGrid from "@/components/sections/CategoryGrid";
import IndustrySolutions from "@/components/sections/IndustrySolutions";
import HowItWorks from "@/components/sections/HowItWorks";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/sections/FinalCTA";

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
      <ClientLogoStrip />
      <CategoryGrid />
      <ProductCatalogSection />
      <IndustrySolutions />
      <HowItWorks />
      <WhyChooseUs />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}
