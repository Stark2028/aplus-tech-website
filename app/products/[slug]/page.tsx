import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getCategoryByName } from "@/data/categories";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Monitor,
  Phone,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
} from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import SpecSheetButton from "@/components/SpecSheetButton";
import Image from "next/image";
import { Metadata } from "next";
import RecentlyViewed from "@/components/RecentlyViewed";
import { breadcrumbLd, productLd } from "@/lib/jsonLd";

export const revalidate = 3600;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── TOP CTA BAR ───────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white py-2.5 px-4 text-center text-sm">
        <span className="font-medium">Authorized Samsung Distributor</span>
        <span className="mx-2 opacity-50">·</span>
        Get B2B pricing in 24 hrs —{" "}
        <a href="tel:+919310509909" className="underline font-semibold hover:no-underline">
          Call +91 93105 09909
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT: Gallery + Features + Specs ─────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Image gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {product.images && product.images.length > 0 ? (
                <ProductGallery images={product.images} productName={product.name} />
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-300 gap-3">
                  <Monitor size={64} strokeWidth={1} />
                  <p className="text-sm">Product image coming soon</p>
                </div>
              )}
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
              <div className="divide-y divide-gray-50">
                {(() => {
                  const hardcoded = [
                    { label: "Resolution", value: product.specs.resolution },
                    { label: "Brightness", value: product.specs.brightness },
                    {
                      label: "Available Sizes",
                      value: product.specs.screenSizes.map((s) => `${s}"`).join(" · "),
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
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Authorized Samsung Distributor" },
                { icon: Truck, label: "Pan-India Delivery" },
                { icon: Award, label: "Certified Installation" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                >
                  <Icon size={22} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Spec sheet download */}
            <SpecSheetButton product={product} />
          </div>

          {/* ── RIGHT: Sticky info + quote ────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-5">

              {/* Product info card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                {/* Series badge + rating */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {product.series}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {product.description}
                </p>

                {/* Quick spec pills */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Resolution", value: product.specs.resolution },
                    { label: "Brightness", value: product.specs.brightness },
                    {
                      label: "Operation",
                      value: `${product.specs.operationTime} hrs`,
                    },
                    {
                      label: "Sizes",
                      value: `${product.specs.screenSizes[0]}\"–${product.specs.screenSizes[product.specs.screenSizes.length - 1]}\"`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        {label}
                      </div>
                      <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Size selector chips */}
                {product.specs.screenSizes.length > 1 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Available Sizes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.specs.screenSizes.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-semibold text-gray-700 cursor-default transition-colors"
                        >
                          {s}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <ProductActions product={product} />

                {/* Direct contact */}
                <div className="flex gap-2 mt-4">
                  <a
                    href={`https://wa.me/919310509909?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}.%20Please%20share%20pricing.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="tel:+919310509909"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold text-sm transition-all"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all group"
                >
                  <div className="h-40 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                    {rel.images?.[0] ? (
                      <Image
                        src={rel.images[0]}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Monitor size={40} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                      {rel.series}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                      {rel.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{rel.specs.resolution}</span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                        Details <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── RECENTLY VIEWED ──────────────────────────────────────── */}
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </main>
  );
}
