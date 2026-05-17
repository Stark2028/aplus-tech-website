import { Metadata } from "next";
import ProductFinderSection from "@/components/ProductFinderSection";

export const metadata: Metadata = {
  title: "Product Finder — Find the Right Samsung Display",
  description:
    "Answer 3 quick questions and we'll match the perfect Samsung display to your industry, use case, and size requirements.",
};

export default function ProductFinderPage() {
  return (
    <div className="min-h-screen bg-white">
<ProductFinderSection />
    </div>
  );
}
