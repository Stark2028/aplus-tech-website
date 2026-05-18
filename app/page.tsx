import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Headphones,
  Truck,
  Award,
  Monitor,
  Building2,
  GraduationCap,
  Store,
  MessageSquare,
  Package,
  Wrench,
  LifeBuoy,
  CheckCircle2,
  Phone,
  Tv,
  LayoutGrid,
  MousePointerClick,
} from "lucide-react";
import { products } from "@/data/products";
import { Metadata } from "next";
import ProductCatalogSection from "@/components/ProductCatalogSection";
import AnimatedCounter from "@/components/AnimatedCounter";
import AnimatedSection from "@/components/AnimatedSection";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "Aplus Technology Solutions — Samsung B2B Display Partner, India",
  description:
    "Authorized Samsung distributor for Smart Signage, Video Walls, Interactive Displays & Hospitality TVs. Pan-India delivery, certified installation, 24/7 support.",
  keywords: [
    "Samsung Business TV",
    "Video Wall",
    "Digital Signage",
    "Interactive Display",
    "Hotel TV",
    "Samsung Distributor India",
    "B2B Display Solutions",
  ],
};

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "10+", label: "Years in Business" },
  { value: "1,000+", label: "Installations Done" },
  { value: "100%", label: "Genuine Samsung" },
];

const PROCESS_STEPS = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Consult",
    desc: "Tell us your space, use case, and budget. Our display specialists assess your exact requirements.",
  },
  {
    icon: Package,
    step: "02",
    title: "Select",
    desc: "We recommend the right products from our full Samsung catalog — no upsell, just the right fit.",
  },
  {
    icon: Wrench,
    step: "03",
    title: "Install",
    desc: "Our certified technicians handle mounting, cabling, and software configuration at your location.",
  },
  {
    icon: LifeBuoy,
    step: "04",
    title: "Support",
    desc: "Ongoing 24/7 technical support, AMC contracts, and warranty management — we're with you long-term.",
  },
];

const CLIENT_SECTORS = [
  { name: "Marriott Hotels", sector: "Hospitality" },
  { name: "ITC Hotels", sector: "Hospitality" },
  { name: "Radisson Group", sector: "Hospitality" },
  { name: "TCS Campus", sector: "Corporate" },
  { name: "DLF Office Spaces", sector: "Corporate" },
  { name: "Infosys Park", sector: "Corporate" },
  { name: "Delhi Public School", sector: "Education" },
  { name: "Ryan International", sector: "Education" },
  { name: "Reliance Retail", sector: "Retail" },
  { name: "Phoenix Mall", sector: "Retail" },
  { name: "Shoppers Stop", sector: "Retail" },
  { name: "AIIMS Delhi", sector: "Healthcare" },
];


const CATEGORY_CARDS = [
  {
    id: "digital-signage",
    Icon: Monitor,
    title: "Digital Signage",
    tagline: "Lobbies, retail & campuses",
    href: "/products?category=digital-signage",
    iconColor: "#2563eb",
    iconColorLight: "rgba(37, 99, 235, 0.1)",
    count: products.filter((p) => p.category === "Digital Signage").length,
  },
  {
    id: "video-walls",
    Icon: LayoutGrid,
    title: "Video Walls",
    tagline: "Seamless large-format impact",
    href: "/products?category=video-walls",
    iconColor: "#4f46e5",
    iconColorLight: "rgba(79, 70, 229, 0.1)",
    count: products.filter((p) => p.category === "Video Wall").length,
  },
  {
    id: "interactive",
    Icon: MousePointerClick,
    title: "Interactive Displays",
    tagline: "Collaboration & smart classrooms",
    href: "/products?category=interactive",
    iconColor: "#7c3aed",
    iconColorLight: "rgba(124, 58, 237, 0.1)",
    count: products.filter((p) => p.category === "Interactive Display").length,
  },
  {
    id: "commercial-tv",
    Icon: Tv,
    title: "Commercial & Hotel TV",
    tagline: "Hotel rooms, offices & lobbies",
    href: "/products?category=commercial-tv",
    iconColor: "#0891b2",
    iconColorLight: "rgba(8, 145, 178, 0.1)",
    count: products.filter((p) => p.category === "Commercial TV").length,
  },
];

export default function Home() {
  const SITE = "https://www.aplustechsol.com";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${SITE}/#organization`,
      name: "Aplus Technology Solutions Pvt. Ltd.",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/assets/img/logo.webp`,
      },
      telephone: "+91-9310509909",
      email: "info@aplustechsol.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Office No. 855, 8th Floor, Supernova Astralis, Sector-94",
        addressLocality: "Noida",
        addressRegion: "Uttar Pradesh",
        postalCode: "201301",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-9310509909",
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: "en",
      },
      openingHours: "Mo-Sa 09:00-18:00",
      sameAs: [
        "https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: SITE,
      name: "Aplus Technology Solutions",
      description:
        "Authorized Samsung Business Display distributor serving enterprises across India.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/products?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#050b15]">
        {/* Background video */}
        <video
          src="/videos/hero.mp4"
          poster="/images/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Cinematic overlay — dark on the left where text lives, fades right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(5,11,21,0.97) 0%, rgba(5,11,21,0.92) 40%, rgba(5,11,21,0.65) 70%, rgba(5,11,21,0.30) 100%)",
          }}
        />
        {/* Subtle blue atmosphere */}
        <div className="absolute inset-0 bg-blue-950/20" />

        {/* ── Main content ── */}
        <div className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center py-28 md:py-36">
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-gray-300 text-sm font-semibold tracking-[0.2em] uppercase">
                Authorized Samsung Business Partner
              </span>
              <span
                className="h-px flex-1 max-w-[52px]"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              />
            </div>

            {/* Headline */}
            <h1
              className="font-black text-white tracking-tight mb-8"
              style={{
                fontSize: "clamp(38px, 4.8vw, 72px)",
                lineHeight: "1.0",
                textShadow:
                  "0 0 80px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)",
              }}
            >
              India&apos;s Premier
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #60a5fa 0%, #a5b4fc 100%)",
                  whiteSpace: "nowrap",
                }}
              >
                Display Technology
              </span>
              <br />
              Partner
            </h1>


            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors"
                  style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.45)" }}
                >
                  Request a Free Quote
                  <ArrowRight size={18} />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2.5 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  Browse Products
                  <ArrowRight size={18} style={{ opacity: 0.45 }} />
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div
          className="relative"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            backgroundColor: "rgba(5,11,21,0.6)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="flex-1 py-5 text-center"
                  style={{
                    minWidth: "110px",
                    borderRight:
                      i < STATS.length - 1
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "none",
                  }}
                >
                  <div className="text-2xl md:text-3xl font-black text-white">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="text-xs font-medium text-gray-500 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENT LOGO STRIP ─────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Trusted by Leading Enterprises Across India
          </p>
        </div>
        <div className="relative">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...CLIENT_SECTORS, ...CLIENT_SECTORS].map((c, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm shrink-0"
              >
                <span className="text-gray-800 font-semibold text-sm">{c.name}</span>
                <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                  {c.sector}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ─────────────────────────────────────────── */}
      <section className="pt-14 pb-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Shop by Category
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Colored top accent */}
                <div className="h-1" style={{ backgroundColor: cat.iconColor }} />

                <div className="p-7">
                  {/* Icon + decorative count */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: cat.iconColorLight }}
                    >
                      <cat.Icon size={26} style={{ color: cat.iconColor }} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">{cat.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{cat.tagline}</p>

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-400">
                      {cat.count} products
                    </span>
                    <span
                      className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                      style={{ color: cat.iconColor }}
                    >
                      Browse <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATALOG ──────────────────────────────────────────── */}
      <ProductCatalogSection />

      {/* ── INDUSTRY SOLUTIONS ───────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0d1526]">
          <div className="absolute inset-0 bg-linear-to-b from-[#0d1526] via-[#0d1526] to-blue-950/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Built for Your Industry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Building2,
                title: "Hospitality",
                desc: "Guest-room TVs, lobby video walls, and digital concierge displays for hotels and resorts.",
                link: "/solutions/hospitality",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Monitor,
                title: "Corporate",
                desc: "Interactive whiteboards, boardroom displays, and operations center video walls.",
                link: "/solutions/corporate",
                color: "from-indigo-500 to-blue-500",
              },
              {
                icon: GraduationCap,
                title: "Education",
                desc: "Smart classroom displays, campus signage, and hybrid learning solutions.",
                link: "/solutions/education",
                color: "from-violet-500 to-indigo-500",
              },
              {
                icon: Store,
                title: "Retail",
                desc: "Window displays, digital menu boards, and in-store visual merchandising.",
                link: "/solutions/retail",
                color: "from-blue-500 to-violet-500",
              },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.link}
                className="group bg-white/5 backdrop-blur-md border border-white/10 p-7 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 bg-linear-to-br ${s.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}
                >
                  <s.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-blue-400 group-hover:text-blue-300 text-sm font-semibold transition">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Inquiry to Installation in 4 Steps
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="relative group">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-linear-to-r from-blue-200 to-transparent z-10" />
                )}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-7 h-full group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <step.icon className="text-white" size={22} />
                    </div>
                    <span className="text-4xl font-bold text-gray-100 group-hover:text-blue-100 transition-colors">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Phone size={18} />
              Talk to a Display Specialist
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Why Aplus
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              The Aplus Advantage
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Authorized Distributor",
                desc: "Official Samsung partner. Every unit is genuine, warranty-valid, and fully supported.",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Dedicated account managers and technical support available around the clock.",
              },
              {
                icon: Truck,
                title: "Pan-India Delivery",
                desc: "Warehouses in 4 cities with express delivery to 100+ locations nationwide.",
              },
              {
                icon: Award,
                title: "Certified Installation",
                desc: "Samsung-certified install teams with 1,000+ completed projects and zero-compromise quality.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-blue-100 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <Icon
                    className="text-blue-600 group-hover:text-white transition-colors"
                    size={24}
                  />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">{title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-[#0d1526] text-center px-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-15 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500 rounded-full filter blur-[120px] opacity-10 animate-pulse delay-1000" />
        <div className="relative max-w-3xl mx-auto z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[ShieldCheck, Award, Truck].map((Icon, i) => (
              <div key={i} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon size={16} className="text-blue-300" />
              </div>
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Upgrade Your Displays?
          </h2>
          <p className="text-lg text-blue-200/70 mb-10 max-w-xl mx-auto">
            Get a personalised quote in 24 hours. Our display specialists are
            standing by to help you choose the perfect setup.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-gray-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              Contact Sales Team
            </Link>
            <Link
              href="/products"
              className="bg-transparent border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:bg-white/5"
            >
              Browse Products
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {[
              "No minimum order",
              "Free site assessment",
              "GST invoice provided",
              "EMI available",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
