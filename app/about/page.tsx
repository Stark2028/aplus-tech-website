import { CheckCircle2, Users, Award, Headphones, Truck, ShieldCheck, MapPin, Phone, Mail, Star } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Aplus Technology Solutions",
  description:
    "Aplus Technology Solutions is an authorized Samsung Business Display distributor serving enterprises across India. Learn about our team, values, and track record.",
};

const STATS = [
  { value: "10+", label: "Years in Business" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "1,000+", label: "Installations Done" },
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
    name: "Vikram Agarwal",
    role: "Founder & CEO",
    bio: "20+ years in commercial AV and display technology. Built Aplus from the ground up with a focus on enterprise-grade quality.",
  },
  {
    name: "Neha Singh",
    role: "Head of Sales",
    bio: "Former Samsung channel manager with deep expertise in B2B display solutions across hospitality, corporate, and retail verticals.",
  },
  {
    name: "Arjun Kapoor",
    role: "Lead Installation Engineer",
    bio: "Samsung-certified AV integrator with over 1,000 completed installations across India, including flagship hotel and corporate projects.",
  },
];

const MILESTONES = [
  { year: "2014", event: "Founded in Noida with a focus on Samsung commercial displays" },
  { year: "2016", event: "Became an Authorized Samsung Business Display Distributor" },
  { year: "2018", event: "Crossed 100+ enterprise clients; opened Mumbai service center" },
  { year: "2020", event: "Launched dedicated hospitality and education verticals" },
  { year: "2022", event: "500+ clients milestone; expanded to 50+ cities pan-India" },
  { year: "2024", event: "Introduced AMC contracts and 24/7 remote support program" },
];

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* Hero */}
      <section className="relative bg-[#0d1526] py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[140px] opacity-15" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500 rounded-full filter blur-[120px] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full mb-6">
            About Aplus Technology
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Empowering India&apos;s Enterprises with{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
              Visual Excellence
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Since 2014, Aplus Technology Solutions has been the trusted partner for
            commercial display technology — supplying, installing, and supporting Samsung
            Business Displays across India&apos;s leading hotels, corporate campuses,
            educational institutions, and retail chains.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {s.value}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-5">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                More Than a Distributor — We&apos;re Your Display Partner
              </h2>
              <p className="text-gray-500 mb-5 leading-relaxed">
                Aplus Technology Solutions was founded on a simple belief: businesses deserve
                more than just a box delivery. They deserve a partner who understands the
                space, recommends the right technology, installs it correctly, and stands
                behind it long-term.
              </p>
              <p className="text-gray-500 mb-8 leading-relaxed">
                As an Authorized Samsung Business Display Distributor, we combine
                manufacturer-backed product quality with local expertise, a pan-India
                service network, and a team that has completed over 1,000 installations
                across every major industry vertical.
              </p>
              <ul className="space-y-3">
                {[
                  "Authorized Samsung Platinum Partner",
                  "Pan-India delivery & installation network (50+ cities)",
                  "Dedicated account managers for enterprise clients",
                  "Competitive B2B pricing with volume discounts",
                  "AMC contracts with guaranteed SLA response times",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-blue-600 shrink-0 mt-0.5"
                      size={18}
                    />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="bg-linear-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    A+
                  </div>
                  <div>
                    <div className="font-bold text-lg">Aplus Technology</div>
                    <div className="text-blue-200 text-sm">Solutions Pvt. Ltd.</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Certification</div>
                    <div className="font-bold">Authorized Samsung Business Display Partner</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Coverage</div>
                    <div className="font-bold">Pan-India · 50+ Cities</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Support</div>
                    <div className="font-bold">24 / 7 Technical Support</div>
                  </div>
                </div>
                <div className="mt-6 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-300 text-yellow-300" />
                  ))}
                  <span className="text-sm text-blue-100 ml-2">5.0 from 200+ reviews</span>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3">
                <Award className="text-blue-600" size={24} />
                <div>
                  <div className="text-xs font-bold text-gray-900">Best AV Distributor</div>
                  <div className="text-xs text-gray-400">North India, 2023</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What Drives Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-blue-100 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <Icon className="text-blue-600 group-hover:text-white transition-colors" size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Milestones */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              10 Years of Growth
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {MILESTONES.map((m) => (
                <div key={m.year} className="relative flex gap-8 items-start">
                  <div className="shrink-0 w-14 text-right">
                    <span className="text-sm font-bold text-blue-600">{m.year}</span>
                  </div>
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10" />
                  </div>
                  <div className="pb-2">
                    <p className="text-gray-700 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              The People Behind Aplus
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white border border-gray-100 rounded-2xl p-7 text-center hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-md shadow-blue-500/20">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office / Contact CTA */}
      <section className="py-20 bg-[#0d1526]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full mb-5">
                Visit Us
              </span>
              <h2 className="text-3xl font-bold text-white mb-6">
                Come See Our Demo Center
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Experience our full product range in person at our Noida demo center. Schedule a visit and our specialists will walk you through every display category relevant to your needs.
              </p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 text-gray-300">
                  <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  Office No. 855, 8th Floor, Supernova Astralis,<br />Sector-94, Noida, UP — 201301
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Phone size={18} className="text-blue-400 shrink-0" />
                  <a href="tel:+919310509909" className="hover:text-white transition-colors">+91 93105 09909</a>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Mail size={18} className="text-blue-400 shrink-0" />
                  <a href="mailto:info@aplustechsol.com" className="hover:text-white transition-colors">info@aplustechsol.com</a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-center transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
              >
                Schedule a Demo Visit
              </Link>
              <Link
                href="/quote"
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-white px-8 py-4 rounded-xl font-semibold text-center transition-all"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
