import { Metadata } from "next";
import QuotePageClient from "@/components/QuotePageClient";

const QUOTE_URL = "https://www.aplustechsol.com/quote";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a personalized quote for Samsung commercial displays, video walls, and interactive screens. Bulk B2B pricing with GST invoice — response within 24 hours.",
  alternates: { canonical: QUOTE_URL },
  openGraph: {
    type: "website",
    url: QUOTE_URL,
    title: "Request a Quote | Aplus Technology Solutions",
    description:
      "Get bulk B2B pricing on Samsung Smart Signage, Video Walls, and Interactive Displays. GST invoice included. Response within 24 hours.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Request a Quote — Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Quote | Aplus Technology Solutions",
    description:
      "Get bulk B2B pricing on Samsung Smart Signage, Video Walls, and Interactive Displays. GST invoice included. Response within 24 hours.",
    images: ["/og-default.png"],
  },
};

export default function QuotePage() {
    return <QuotePageClient />;
}
