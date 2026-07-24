import Link from "next/link";
import type { Metadata } from "next";
import { cities, type Region } from "@/data/cities";
import { SITE, breadcrumbLd, jsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  // Bare title — the root layout template appends " | Aplus Technology Solutions".
  title: "Locations We Serve",
  description:
    "Aplus Technology Solutions supplies and installs Samsung commercial displays across India — from our Noida headquarters and Kolkata regional office. Find your city.",
  alternates: { canonical: `${SITE}/locations` },
};

const REGION_LABELS: Record<Region, string> = {
  north: "North India",
  west: "West India",
  south: "South India",
  east: "East India",
  central: "Central India",
};
const REGION_ORDER: Region[] = ["north", "west", "south", "east", "central"];

export default function LocationsPage() {
  const jsonLd = breadcrumbLd([
    { name: "Home", url: "/" },
    { name: "Locations", url: "/locations" },
  ]);

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />

      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">Pan-India Delivery &amp; Service</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            Locations we serve
          </h1>
          <p className="text-base md:text-lg text-blue-100/90 mt-5 max-w-3xl leading-relaxed">
            As an authorized Samsung commercial-display distributor, we deliver, install and service
            across India — coordinated from our Noida headquarters and Kolkata regional office.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {REGION_ORDER.map((region) => {
            const group = cities.filter((c) => c.region === region);
            if (group.length === 0) return null;
            return (
              <div key={region}>
                <h2 className="text-xl font-bold text-gray-900 mb-5">{REGION_LABELS[region]}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {group.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      className="block bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
