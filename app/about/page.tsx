import { ChevronRight, ArrowRight, Linkedin } from "lucide-react";
import {
  CheckCircleIcon,
  UsersIcon,
  AwardIcon,
  HeadphonesIcon,
  TruckIcon,
  ShieldCheckIcon,
  IconTile,
} from "@/components/icons";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { aboutPageLd, breadcrumbLd, organizationLd, jsonLdString } from "@/lib/jsonLd";

const ABOUT_URL = "https://www.aplustechsol.com/about";

export const metadata: Metadata = {
  title: "About Us — Aplus Technology Solutions",
  description:
    "Aplus Technology Solutions is an authorized Samsung Business Display distributor serving enterprises across India. Learn about our team, values, and track record.",
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    type: "website",
    url: ABOUT_URL,
    title: "About Us | Aplus Technology Solutions",
    description:
      "Authorized Samsung distributor with 5+ years of experience, 500+ enterprise clients, and 10,000+ installations across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "About Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Aplus Technology Solutions",
    description:
      "Authorized Samsung distributor with 5+ years of experience, 500+ enterprise clients, and 10,000+ installations across India.",
    images: ["/og-default.png"],
  },
};

const STATS = [
  { value: "5+", label: "Years in Business" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "10,000+", label: "Installations" },
  { value: "50+", label: "Cities Served" },
];

const VALUES = [
  {
    icon: ShieldCheckIcon,
    title: "Authorized & Genuine",
    desc: "Every product we supply is 100% genuine Samsung with full manufacturer warranty. We are an official Samsung Business Display partner with an ISO 9001:2015-certified quality management system.",
  },
  {
    icon: UsersIcon,
    title: "Client-First Approach",
    desc: "We don't push products — we understand your space, use case, and budget, then recommend exactly what's right for you.",
  },
  {
    icon: TruckIcon,
    title: "End-to-End Service",
    desc: "From pre-sales consultation to post-installation support, we manage the entire journey. One point of contact, zero headaches.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    desc: "A responsive support team that resolves issues fast, with guaranteed response SLAs for enterprise accounts.",
  },
];

const TEAM = [
  {
    name: "Anurag Walia",
    role: "Director",
    image: "/team/anurag-walia-v4.jpg",
    linkedin: "https://www.linkedin.com/in/anurag-walia-bba9103/",
  },
  {
    name: "Savita Walia",
    role: "Director",
    image: "/team/savita-walia.jpg",
  },
  {
    name: "Sunil Kumar",
    role: "Director",
    image: "/team/sunil-kumar.jpg",
    linkedin: "https://www.linkedin.com/in/sunil-kumar-a5850217/",
  },
  {
    name: "R.K Dasgupta",
    role: "Director",
    image: "/team/rk-dasgupta.jpg",
    linkedin: "https://www.linkedin.com/in/ramkrishna-dasgupta-75b61294",
  },
];

const MILESTONES = [
  { year: "2020", event: "Founded in Noida and became an Authorized Samsung Business Display Distributor." },
  { year: "2022", event: "Crossed 100+ enterprise clients; opened Mumbai service center." },
  { year: "2023", event: "Launched dedicated hospitality and education verticals." },
  { year: "2024", event: "500+ clients milestone; expanded to 50+ cities pan-India." },
  { year: "2025", event: "Introduced AMC contracts and a dedicated remote support program." },
  { year: "2026", event: "Achieved ISO 9001:2015 certification; expanding into Tier-2 cities with a new national service partner network." },
];

const STORY_PILLARS = [
  "Authorized Samsung Platinum Partner",
  "Pan-India delivery & installation (50+ cities)",
  "Dedicated account managers",
  "Volume-based B2B pricing",
  "AMC contracts with guaranteed SLA",
];

export default function AboutPage() {
  const jsonLd = [
    organizationLd(),
    aboutPageLd(),
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ]),
  ];

  return (
    <main className="bg-white bg-waves">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-end gap-1.5 text-xs text-blue-100/70 mb-12">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90 font-medium">About</span>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-4">
            About Aplus Technology Solutions
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl">
            Empowering India&apos;s enterprises with visual excellence.
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Talk to our team
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Browse the catalog
            </Link>
          </div>
        </div>

        {/* Stats bar — inside the hero, 1x4 format */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-white/10 flex">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-6 md:py-7 text-center flex-1 ${i < STATS.length - 1 ? "border-r border-white/10" : ""}`}
              >
                <p className="text-xl md:text-3xl font-black text-white leading-none tracking-tight">{s.value}</p>
                <p className="text-[9px] sm:text-[11px] md:text-xs font-medium text-blue-200/70 uppercase tracking-wider mt-2 px-1 sm:px-2 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Story ───────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
                Our Mission
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-8">
                Your end-to-end commercial display partner.
              </h2>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STORY_PILLARS.map((item) => (
                  <div key={item} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-blue-50/50 hover:border-blue-100/60 transition-colors">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100/80 flex items-center justify-center">
                      <CheckCircleIcon className="text-slate-700" size={18} />
                    </div>
                    <span className="text-slate-800 text-[14px] font-bold leading-snug block">{item}</span>
                  </div>
                ))}
                <div className="flex items-center gap-4 bg-linear-to-br from-blue-50/50 to-white border border-blue-100/60 rounded-2xl p-4 hover:shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-blue-200/60 transition-colors duration-500" />
                  <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100/80 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-500">
                    <AwardIcon className="text-slate-700" size={18} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-slate-900 text-[14px] font-extrabold leading-snug block mb-0.5">Best AV Distributor</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-tight block">North India · 2023</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spec card */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative rounded-[2rem] shadow-xl shadow-slate-200/60 bg-linear-to-br from-white via-slate-50 to-blue-50/40 p-8 text-slate-800 overflow-hidden border border-slate-200/80">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.08),transparent_50%)]" />
                <div className="relative">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2.5 shrink-0">
                      <Image src="/logo.png" alt="Aplus Technology" width={44} height={44} className="object-contain" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[16px] leading-tight mb-0.5 tracking-wide text-slate-900">Aplus Technology</p>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-blue-600 leading-tight">Solutions Pvt. Ltd.</p>
                    </div>
                  </div>

                  <dl className="space-y-5">
                    {[
                      { k: "Certification", v: "Authorized Samsung B2B Partner" },
                      { k: "Quality System", v: "ISO 9001:2015 Certified" },
                      { k: "Coverage", v: "Pan-India · 50+ cities" },
                      { k: "Support", v: "Dedicated Technical Support" },
                      { k: "Founded", v: "2020 · India" },
                      { k: "CIN", v: "U72900DL2020PTC374888" },
                      { k: "GSTIN", v: "07AAUCA5631L1Z6" },
                    ].map((row, i, arr) => (
                      <div
                        key={row.k}
                        className={`flex items-start justify-between gap-6 ${i < arr.length - 1 ? "pb-5 border-b border-slate-200/70" : ""
                          }`}
                      >
                        <dt className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold pt-0.5">
                          {row.k}
                        </dt>
                        <dd className="text-[13px] font-semibold text-right text-slate-900">{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ───────────────── Values ───────────────── */}
      <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              What we stand for
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Four principles that shape every project.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-3xl overflow-hidden border border-gray-100">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white p-8 hover:bg-linear-to-br hover:from-white hover:to-blue-50/40 transition-colors"
              >
                <IconTile className="mb-6">
                  <Icon className="text-current" size={22} />
                </IconTile>
                <h3 className="font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Timeline ───────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              Our journey
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Building India&apos;s display backbone since 2020.
            </h2>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-[7px] h-px bg-gray-200" />
              <div className="grid grid-cols-6 gap-x-3 relative">
                {MILESTONES.map((m) => (
                  <div key={m.year} className="relative">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-blue-600 animate-ping opacity-20" />
                      </div>
                    </div>
                    <p className="text-center text-sm font-bold text-blue-600 mb-2">{m.year}</p>
                    <p className="text-center text-[11px] text-gray-500 leading-relaxed">{m.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden">
            <div className="relative pl-8">
              <div className="absolute left-1.75 top-2 bottom-2 w-px bg-gray-200" />
              <div className="space-y-6">
                {MILESTONES.map((m) => (
                  <div key={m.year} className="relative">
                    <div className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <p className="text-sm font-bold text-blue-600 mb-1">{m.year}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{m.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Team ───────────────── */}
      <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              Leadership
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              The people behind every install.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="group bg-white border border-gray-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  {member.image ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-md shadow-blue-500/10 shrink-0">
                      <Image src={member.image} alt={member.name} width={64} height={64} className="object-cover object-top w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-200 font-semibold text-2xl shadow-md shadow-slate-900/10 shrink-0 border border-slate-700">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 tracking-tight leading-tight flex items-center gap-2">
                      {member.name}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 ml-1 rounded-md bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center hover:bg-[#0a66c2] hover:text-white transition-all shadow-[0_2px_8px_rgba(10,102,194,0.15)] hover:shadow-[0_4px_12px_rgba(10,102,194,0.3)]"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <Linkedin size={13} strokeWidth={2.5} fill="currentColor" />
                        </a>
                      )}
                    </h3>
                    <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
