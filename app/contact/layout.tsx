import type { Metadata } from "next";
import { jsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Aplus Technology Solutions — request a quote, schedule a demo, or speak to a Samsung-certified display specialist. Office in Sector-94, Noida.",
  keywords: [
    "contact Aplus Technology Solutions",
    "Samsung display dealer contact",
    "IT distributor Noida contact",
    "request a quote Samsung signage",
    "commercial display inquiry India",
    "Samsung authorized dealer Noida",
  ],
  alternates: { canonical: "https://www.aplustechsol.com/contact" },
  openGraph: {
    type: "website",
    url: "https://www.aplustechsol.com/contact",
    title: "Contact Us | Aplus Technology Solutions",
    description:
      "Reach our Samsung display specialists for quotes, demos, and technical support. Based in Noida — serving clients across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Contact Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Aplus Technology Solutions",
    description:
      "Reach our Samsung display specialists for quotes, demos, and technical support. Based in Noida — serving clients across India.",
    images: ["/og-default.png"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  name: "Aplus Technology Solutions Pvt. Ltd.",
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays, and Hospitality TVs. End-to-end supply, installation & AMC support across India.",
  url: "https://www.aplustechsol.com",
  telephone: "+919310509909",
  email: "info@aplustechsol.com",
  logo: "https://www.aplustechsol.com/logo.png",
  image: "https://www.aplustechsol.com/og-default.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sector-94",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    postalCode: "201301",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.5355,
    longitude: 77.391,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  hasMap: "https://maps.google.com/?q=Sector+94+Noida",
  priceRange: "₹₹₹",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How quickly do you respond?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Within 4 business hours for standard inquiries, same-day for urgent projects.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer on-site demos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — at your office or our Noida showroom. Contact us to schedule.",
      },
    },
    {
      "@type": "Question",
      name: "What areas do you serve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pan-India delivery and installation, with full logistics support for bulk orders.",
      },
    },
    {
      "@type": "Question",
      name: "Is installation included?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We provide end-to-end supply, installation, and post-sale AMC for every project.",
      },
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }}
      />
      {children}
    </>
  );
}

