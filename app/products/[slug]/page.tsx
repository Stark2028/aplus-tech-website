import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getCategoryByName } from "@/data/categories";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import { ChevronRight, Check, Phone, ArrowRight } from "lucide-react";
import {
  MonitorIcon,
  ShieldCheckIcon,
  TruckIcon,
  AwardIcon,
} from "@/components/icons";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import SpecSheetButton from "@/components/SpecSheetButton";
import CompareButton from "@/components/CompareButton";
import WhatsAppIcon from "@/components/quote/WhatsAppIcon";
import Image from "next/image";
import { Metadata } from "next";
import RecentlyViewed from "@/components/RecentlyViewed";
import MobileProductScroller from "@/components/MobileProductScroller";
import { breadcrumbLd, productLd, jsonLdString } from "@/lib/jsonLd";
import { formatSize, formatSizeRange } from "@/lib/formatSize";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export const revalidate = 3600;

// All product slugs are enumerated below from static data, so reject any param
// outside that set at the routing layer. Without this, an unknown slug streams
// through loading.tsx (Suspense) + ISR and Next serves the notFound() page with
// a soft 200 instead of a real 404 (vercel/next.js#63478, #76501) — which lets
// junk/typo URLs get indexed. dynamicParams=false makes unknown slugs a true 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) return { title: "Product Not Found | Aplus Tech" };
  const url = `https://www.aplustechsol.com/products/${slug}`;
  const ogAlt = `${product.name} — ${product.series} ${product.category}`;
  return {
    title: product.name,
    description: product.description,
    keywords: [
      product.name,
      product.series,
      product.category,
      "Samsung",
      "B2B",
      "Aplus Technology Solutions",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: product.name,
      description: product.description,
      images: product.images?.[0]
        ? [{ url: product.images[0], width: 1200, height: 630, alt: ogAlt }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

function getCategorySlug(categoryName: string): string {
  const cat = getCategoryByName(categoryName);
  return cat ? cat.id : categoryName.toLowerCase().replace(/\s+/g, "-");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) return notFound();

  const categorySlug = getCategorySlug(product.category);

  // Related products: same category, exclude self, max 4
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const jsonLd = [
    productLd(product),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: product.category, url: `/categories/${categorySlug}` },
      { name: product.name, url: `/products/${product.id}` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* ── TOP CTA BAR ───────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white py-2.5 px-4 text-center text-sm">
        <span className="font-medium">Authorized Samsung Distributor</span>
        <span className="mx-2 opacity-50">·</span>
        Get B2B pricing in 24 hrs —{" "}
        <a href={PHONE_TEL} className="underline font-semibold hover:no-underline">
          Call {PHONE_DISPLAY}
        </a>
      </div>

      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500 flex-wrap gap-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link
              href={`/categories/${categorySlug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-50">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ── MOBILE ONLY: Title & Series Header ── */}
        <div className="block lg:hidden mb-6 px-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50/80 text-blue-600 uppercase tracking-widest mb-2.5">
            {product.series}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 leading-snug tracking-tight">
            {product.name}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT: Gallery + Features + Specs ─────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Image gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {product.images && product.images.length > 0 ? (
                <ProductGallery images={product.images} productName={product.name} />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-300 gap-3">
                  <MonitorIcon size={64} accentClassName="text-current" />
                  <p className="text-sm">Product image coming soon</p>
                </div>
              )}
            </div>

            {/* MOBILE ONLY: Quick specs, Sizes, and Action buttons */}
            <div className="block lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              {/* Quick spec pills */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Resolution", value: product.specs.resolution },
                  { label: "Brightness", value: product.specs.brightness },
                  {
                    label: "Operation",
                    value: `${product.specs.operationTime} hrs`,
                  },
                  {
                    label: "Sizes",
                    value: formatSizeRange(product.specs.screenSizes),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">
                      {label}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate">{value}</div>
                  </div>
                ))}
              </div>

              {/* Size selector chips */}
              {product.specs.screenSizes.length > 1 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Available Sizes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.specs.screenSizes.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        {formatSize(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <ProductActions product={product} />

              {/* Spec sheet download */}
              <SpecSheetButton product={product} />

              {/* Direct contact */}
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}.%20Please%20share%20pricing.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-400 text-white py-3.5 rounded-xl font-semibold text-sm shadow-sm"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold text-sm shadow-sm"
                >
                  <Phone size={15} />
                  Call Us
                </a>
              </div>
            </div>

            {/* Key highlights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full" />
                Key Highlights
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} className="text-blue-600" strokeWidth={3} />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product overview — only shown when longDescription is present */}
            {product.longDescription && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full" />
                  Product Overview
                </h3>
                <div className="space-y-3">
                  {product.longDescription.split("\n\n").map((para, i) => (
                    <p key={i} className="text-gray-600 text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Specs table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Technical Specifications</h3>
              </div>

              {product.specGroups ? (
                /* ── Grouped specs (Samsung-style) ── */
                <div>
                  {Object.entries(product.specGroups).map(([group, rows]) => (
                    <div key={group}>
                      <div className="px-7 py-3 bg-gray-50 border-y border-gray-100">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{group}</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {Object.entries(rows).map(([label, value]) => (
                          <div key={label} className="grid grid-cols-2 hover:bg-gray-50 transition-colors">
                            <dt className="px-7 py-3 text-sm text-gray-500 border-r border-gray-50">{label}</dt>
                            <dd className="px-7 py-3 text-sm font-semibold text-gray-900 text-right">{value}</dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Flat specs (all other products) ── */
                <div className="divide-y divide-gray-50">
                  {(() => {
                    const hardcoded = [
                      { label: "Resolution", value: product.specs.resolution },
                      { label: "Brightness", value: product.specs.brightness },
                      {
                        label: "Available Sizes",
                        value: product.specs.screenSizes.map(formatSize).join(" · "),
                      },
                      { label: "Operation Hours", value: product.specs.operationTime },
                      { label: "Series", value: product.series },
                      { label: "Category", value: product.category },
                      ...(product.subCategory
                        ? [{ label: "Sub-category", value: product.subCategory }]
                        : []),
                    ];
                    const hardcodedKeys = new Set(hardcoded.map((r) => r.label.toLowerCase()));
                    const additional = product.additionalSpecs
                      ? Object.entries(product.additionalSpecs)
                          .filter(([key]) => !hardcodedKeys.has(key.toLowerCase()))
                          .map(([label, value]) => ({ label, value }))
                      : [];
                    return [...hardcoded, ...additional];
                  })().map(({ label, value }) => (
                    <div key={label} className="flex px-7 py-3.5 hover:bg-gray-50 transition-colors">
                      <dt className="w-44 text-sm font-medium text-gray-500 shrink-0">{label}</dt>
                      <dd className="text-sm text-gray-900 font-semibold">{value}</dd>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheckIcon, label: "Authorized Samsung Distributor" },
                { icon: TruckIcon, label: "Pan-India Delivery" },
                { icon: AwardIcon, label: "Certified Installation" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                >
                  <Icon size={22} className="text-slate-700" />
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Sticky info + quote ────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-5">

              {/* Product info card */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-[0_8px_30px_-4px_rgba(6,81,237,0.08)] border border-slate-200/60 p-8">
                {/* Series badge + rating */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50/80 text-blue-600 uppercase tracking-widest">
                    {product.series}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 mb-3 leading-snug tracking-tight">
                  {product.name}
                </h1>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Quick spec pills */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Resolution", value: product.specs.resolution },
                    { label: "Brightness", value: product.specs.brightness },
                    {
                      label: "Operation",
                      value: `${product.specs.operationTime} hrs`,
                    },
                    {
                      label: "Sizes",
                      value: formatSizeRange(product.specs.screenSizes),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 transition-colors hover:bg-blue-50/30 hover:border-blue-100/50">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                        {label}
                      </div>
                      <div className="text-[13px] font-semibold text-slate-800 truncate">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Size selector chips */}
                {product.specs.screenSizes.length > 1 && (
                  <div className="mb-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Available Sizes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.specs.screenSizes.map((s) => (
                        <span
                          key={s}
                          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[13px] font-semibold text-slate-700"
                        >
                          {formatSize(s)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  {/* Action buttons */}
                  <ProductActions product={product} />
                </div>

                {/* Spec sheet download (email-gated) */}
                <div className="mb-4">
                  <SpecSheetButton product={product} />
                </div>

                {/* Direct contact */}
                <div className="flex gap-3 mt-4">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}.%20Please%20share%20pricing.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-400 text-white py-3.5 rounded-xl font-semibold text-[14px] shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                  <a
                    href={PHONE_TEL}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-semibold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Phone size={15} />
                    Call Us
                  </a>
                </div>
              </div>

              {/* Quote form */}
              <QuoteForm productName={product.name} />

              {/* Assurance strip */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm">
                <p className="font-semibold text-blue-800 mb-3">Why buy from Aplus?</p>
                <ul className="space-y-2">
                  {[
                    "100% genuine Samsung products",
                    "Formal GST invoice provided",
                    "EMI options available for bulk orders",
                    "Free installation assessment",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-blue-700">
                      <Check size={13} strokeWidth={3} className="text-blue-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ─────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                More in {product.category}
              </h2>
              <Link
                href={`/categories/${categorySlug}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
              >
                View all{" "}
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <MobileProductScroller gridCols="sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all group relative block h-full"
                >
                  <CompareButton 
                    product={rel} 
                    className="absolute top-2 right-2 z-20" 
                  />
                  <div className="h-40 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                    {rel.images?.[0] ? (
                      <Image
                        src={rel.images[0]}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <MonitorIcon
                        size={40}
                        className="text-gray-300"
                        accentClassName="text-gray-300"
                      />
                    )}
                  </div>
                  <div className="p-4 relative z-10">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                      {rel.series}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                      <Link
                        href={`/products/${rel.id}`}
                        className="before:absolute before:inset-0 before:z-0 focus:outline-none cursor-pointer"
                      >
                        {rel.name}
                      </Link>
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{rel.specs.resolution}</span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5 relative z-10">
                        Details <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </MobileProductScroller>
          </section>
        )}

        {/* ── RECENTLY VIEWED ──────────────────────────────────────── */}
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </main>
  );
}
