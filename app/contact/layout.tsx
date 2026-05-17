import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Aplus Technology Solutions — request a quote, schedule a demo, or speak to a Samsung-certified display specialist. Office in Sector-94, Noida.",
  alternates: { canonical: "https://www.aplustechsol.com/contact" },
  openGraph: {
    type: "website",
    url: "https://www.aplustechsol.com/contact",
    title: "Contact Us | Aplus Technology Solutions",
    description:
      "Reach our Samsung display specialists for quotes, demos, and technical support. Based in Noida — serving clients across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Contact Aplus Technology Solutions" }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

