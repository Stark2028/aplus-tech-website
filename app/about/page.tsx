import {
  CheckCircle2,
  Users,
  Award,
  Headphones,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

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
      "Authorized Samsung distributor with 10+ years of experience, 500+ enterprise clients, and 1,000+ installations across India.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "About Aplus Technology Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Aplus Technology Solutions",
    description:
      "Authorized Samsung distributor with 10+ years of experience, 500+ enterprise clients, and 1,000+ installations across India.",
    images: ["/og-default.png"],
  },
};

const STATS = [
  { value: "10+", label: "Years in Business" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "1,000+", label: "Installations" },
  { value: "50+", label: "Cities Served" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Authorized & Genuine",
    desc: "Every product we supply is 100% genuine Samsung with full manufacturer warranty. We are an official Samsung Business Display partner.",
  },
  {
    icon: Users,
    title: "Client-First Approach",
    desc: "We don't push products — we understand your space, use case, and budget, then recommend exactly what's right for you.",
  },
  {
    icon: Truck,
    title: "End-to-End Service",
    desc: "From pre-sales consultation to post-installation support, we manage the entire journey. One point of contact, zero headaches.",
  },
  {
    icon: Headphones,
    title: "Always-On Support",
    desc: "Technical issues don't keep business hours. Our support team is available 24/7 with guaranteed response SLAs for enterprise accounts.",
  },
];

const TEAM = [
  {
    name: "Anurag Walia",
    role: "Director",
    bio: "Leads business strategy and enterprise partnerships at Aplus. 15+ years driving Samsung B2B display adoption across India's top sectors.",
  },
  {
    name: "Savita Walia",
    role: "Director",
    bio: "Oversees operations and client success. Her focus on process excellence has helped Aplus maintain a 5-star service track record.",
  },
  {
    name: "Sunil Kumar",
    role: "Director",
    bio: "Samsung-certified integration specialist with 1,000+ completed installations across hospitality, corporate, and retail projects.",
  },
];

const MILESTONES = [
  { year: "2014", event: "Founded in Noida with a focus on Samsung commercial displays." },
  { year: "2016", event: "Became an Authorized Samsung Business Display Distributor." },
  { year: "2018", event: "Crossed 100+ enterprise clients; opened Mumbai service center." },
  { year: "2020", event: "Launched dedicated hospitality and education verticals." },
  { year: "2022", event: "500+ clients milestone; expanded to 50+ cities pan-India." },
  { year: "2024", event: "Introduced AMC contracts and 24/7 remote support program." },
];

const STORY_PILLARS = [
  "Authorized Samsung Platinum Partner",
  "Pan-India delivery & installation (50+ cities)",
  "Dedicated account managers",
  "Volume-based B2B pricing",
  "AMC contracts with guaranteed SLA",
];

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-950 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-blue-100/70 mb-12">
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
          <p className="mt-6 text-base md:text-lg text-blue-100/80 leading-relaxed max-w-2xl">
            Since 2014, we&apos;ve been the trusted Samsung Business Display partner for India&apos;s
            leading hotels, corporate campuses, schools, and retail chains — supplying, installing,
            and supporting every screen we sell.
          </p>

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
      </section>

      {/* ───────────────── Trust Strip ───────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-2 md:px-6 ${i > 0 ? "md:border-l md:border-gray-100" : ""}`}
              >
                <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1.5 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Story ───────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
                Our story
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                More than a distributor — your long-term display partner.
              </h2>
              <div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
                <p>
                  Aplus Technology Solutions was founded on a simple belief: businesses deserve
                  more than just a box delivery. They deserve a partner who understands the space,
                  recommends the right technology, installs it correctly, and stands behind it
                  long-term.
                </p>
                <p>
                  As an Authorized Samsung Business Display Distributor, we combine manufacturer-backed
                  product quality with local expertise, a pan-India service network, and a team that
                  has completed over 1,000 installations across every major industry vertical.
                </p>
              </div>

              <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {STORY_PILLARS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Spec card */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative rounded-3xl border border-gray-100 bg-linear-to-br from-slate-900 via-blue-950 to-gray-900 p-8 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.35),transparent_55%)]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-lg">
                      A+
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">Aplus Technology</p>
                      <p className="text-[11px] text-blue-200/70 leading-tight">Solutions Pvt. Ltd.</p>
                    </div>
                  </div>

                  <dl className="space-y-5">
                    {[
                      { k: "Certification", v: "Authorized Samsung B2B Partner" },
                      { k: "Coverage", v: "Pan-India · 50+ cities" },
                      { k: "Support", v: "24 / 7 Technical Response" },
                      { k: "Founded", v: "2014 · Noida, India" },
                    ].map((row, i, arr) => (
                      <div
                        key={row.k}
                        className={`flex items-start justify-between gap-6 ${
                          i < arr.length - 1 ? "pb-5 border-b border-white/10" : ""
                        }`}
                      >
                        <dt className="text-[11px] uppercase tracking-[0.18em] text-blue-200/70 font-semibold pt-0.5">
                          {row.k}
                        </dt>
                        <dd className="text-sm font-semibold text-right">{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Award badge */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white shadow-sm px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Award className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Best AV Distributor</p>
                  <p className="text-xs text-gray-500 leading-tight">North India · 2023</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ───────────────── Values ───────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
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
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center mb-6 transition-colors">
                  <Icon className="text-blue-600 group-hover:text-white transition-colors" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Timeline ───────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              Our journey
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              A decade of building India&apos;s display backbone.
            </h2>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-6.5 h-px bg-gray-200" />
              <div className="grid grid-cols-6 gap-6 relative">
                {MILESTONES.map((m) => (
                  <div key={m.year} className="relative">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-blue-600 animate-ping opacity-20" />
                      </div>
                    </div>
                    <p className="text-center text-sm font-bold text-blue-600 mb-2">{m.year}</p>
                    <p className="text-center text-xs text-gray-500 leading-relaxed">{m.event}</p>
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
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
              Leadership
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              The people behind every install.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="group bg-white border border-gray-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 tracking-tight leading-tight">
                      {member.name}
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
