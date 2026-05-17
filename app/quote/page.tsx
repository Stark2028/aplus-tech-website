import { Metadata } from "next";
import QuotePageClient from "@/components/QuotePageClient";

export const metadata: Metadata = {
    title: "Request a Quote | Aplus Technology Solutions",
    description: "Request a personalized quote for Samsung and LG commercial displays, video walls, and interactive screens. Bulk pricing available for B2B partners.",
    openGraph: {
        title: "Request a Quote | Aplus Technology Solutions",
        description: "Get the best price for your commercial display needs.",
        type: "website",
    },
};

export default function QuotePage() {
    return <QuotePageClient />;
}
