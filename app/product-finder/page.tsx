import { Metadata } from "next";
import ProductFinderSection from "@/components/ProductFinderSection";

const FINDER_URL = "https://www.aplustechsol.com/product-finder";

export const metadata: Metadata = {
  title: "Product Finder | Find the Right Samsung Display",
  description:
    "Answer 3 quick questions and we'll match the perfect Samsung display to your industry, use case, and size requirements.",
  alternates: { canonical: FINDER_URL },
  openGraph: {
    type: "website",
    url: FINDER_URL,
    title: "Product Finder | Aplus Technology Solutions",
    description:
      "Not sure which Samsung display is right for you? Answer 3 quick questions and get a personalised recommendation.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Samsung Display Product Finder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Finder | Aplus Technology Solutions",
    description:
      "Not sure which Samsung display is right for you? Answer 3 quick questions and get a personalised recommendation.",
    images: ["/og-default.png"],
  },
};

export default function ProductFinderPage() {
  return (
    <div className="min-h-screen bg-white">
<ProductFinderSection />
    </div>
  );
}
