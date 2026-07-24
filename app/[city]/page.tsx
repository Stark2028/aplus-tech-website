import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone, Truck, Wrench, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { cities, getCityBySlug, cityFaqs, SERVING_OFFICES } from "@/data/cities";
import { products } from "@/data/products";
import { byLatestThenPopularity } from "@/lib/productSort";
import ProductCard from "@/components/ProductCard";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import {
  SITE,
  breadcrumbLd,
  cityServiceLd,
  faqPageLd,
  jsonLdString,
} from "@/lib/jsonLd";

export const revalidate = 3600;

// Only the enumerated city slugs render; any other single-segment path must
// hard-404 at the routing layer (see memory: soft-404-dynamicparams-fix).
export const dynamicParams = false;

interface PageParams {
  city: string;
}

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Location Not Found | Aplus Technology Solutions" };

  const url = `${SITE}/${city.slug}`;
  // Bare page title — the root layout's title template ("%s | Aplus Technology
  // Solutions") appends the brand, so it must NOT be repeated here or the
  // <title> doubles the suffix. The share title carries the brand explicitly
  // because OpenGraph/Twitter titles are not run through that template.
  const pageTitle = `Samsung Commercial Displays in ${city.name}`;
  const shareTitle = `${pageTitle} | Aplus Technology Solutions`;
  return {
    title: pageTitle,
    description: city.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: shareTitle,
      description: city.intro,
      images: [{ url: `/${city.slug}/opengraph-image`, width: 1200, height: 630, alt: shareTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: city.intro,
      images: [`/${city.slug}/opengraph-image`],
    },
  };
}

// Top of the catalog, shown on every city page (same distributor, same catalog
// everywhere — the city-specific value is the intro, serve block and FAQ).
const FEATURED = [...products].sort(byLatestThenPopularity).slice(0, 8);

export default async function CityPage({ params }: { params: Promise<PageParams> }) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const office = SERVING_OFFICES[city.servedFrom];
  const faqs = cityFaqs(city);

  // A few other cities in the same region, for internal linking (crawlability).
  const nearby = cities.filter((c) => c.region === city.region && c.slug !== city.slug).slice(0, 6);

  const jsonLd = [
    cityServiceLd(city, FEATURED),
    faqPageLd(faqs.map((f) => ({ question: f.q, answer: f.a }))),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Locations", url: "/locations" },
      { name: city.name, url: `/${city.slug}` },
    ]),
  ];

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <nav className="flex items-center gap-1.5 text-xs text-blue-100/70 mb-10 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/locations" className="hover:text-white transition-colors">Locations</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-white/90 font-medium">{city.name}</span>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
            {city.state} · Authorized Samsung Distributor
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
            Samsung Commercial Displays in {city.name}
          </h1>
          <p className="text-base md:text-lg text-blue-100/90 mt-5 max-w-3xl leading-relaxed">
            {city.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/30"
            >
              Request a Quote <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone size={16} aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW WE SERVE {CITY} ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              How we serve {city.name}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Supply, installation &amp; service across {city.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Truck, title: "Delivery to " + city.name,
                body: `Dispatched from our ${office.city} ${office.label} with GST invoicing and pan-India logistics to ${city.name} and across ${city.state}.` },
              { icon: Wrench, title: "Certified installation",
                body: `On-site mounting, alignment and MagicINFO/content setup for signage, video walls and interactive displays in ${city.name}.` },
              { icon: ShieldCheck, title: "Service & AMC",
                body: `On-site service and Annual Maintenance Contracts for ${city.name}, coordinated from our ${office.city} ${office.label}.` },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                Available in {city.name}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Popular Samsung displays
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
            >
              View all products
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Buying Samsung displays in {city.name}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-200 rounded-2xl p-6 open:shadow-md transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-base list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronRight size={20} className="shrink-0 text-blue-600 transition-transform duration-300 group-open:rotate-90" aria-hidden="true" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER CITIES ─────────────────────────────────────────────────── */}
      {nearby.length > 0 && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-4">
              We also serve
            </p>
            <div className="flex flex-wrap gap-2.5">
              {nearby.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/locations"
                className="inline-flex items-center gap-1 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                All locations <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
