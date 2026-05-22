"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Send,
} from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Digital Signage", href: "/categories/digital-signage" },
  { label: "Video Walls", href: "/categories/video-walls" },
  { label: "Interactive Displays", href: "/categories/interactive" },
  { label: "Hospitality & Business TV", href: "/categories/commercial-tv" },
  { label: "All Products", href: "/products" },
];

const SOLUTION_LINKS = [
  { label: "Hospitality", href: "/solutions/hospitality" },
  { label: "Corporate", href: "/solutions/corporate" },
  { label: "Education", href: "/solutions/education" },
  { label: "Retail", href: "/solutions/retail" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blogs & Insights", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
  { label: "Request a Quote", href: "/quote" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative bg-[#070b15] text-gray-400 overflow-hidden print:hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full filter blur-[180px] opacity-[0.08] pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-cyan-500 rounded-full filter blur-[160px] opacity-[0.06] pointer-events-none" />

      {/* ───────────────── Top CTA band ───────────────── */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">
                Get in touch
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                Need help choosing the right display !
              </h3>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <a
                href="tel:+919310509909"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Phone size={15} className="text-blue-300" />
                +91 93105 09909
              </a>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                Request a quote
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── Main grid ───────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-y-12 gap-x-8">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo.png"
                alt="Aplus Technology Solutions"
                width={48}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm mb-6">
              Authorized Samsung Display distributor providing<br></br>
              end-to-end commercial solutions across India.
            </p>

            {/* Authorized badge */}
            <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">
                  Samsung Authorized
                </p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Business Display Partner · India
                </p>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-2">
                Stay updated
              </p>
              <p className="text-xs text-gray-500 mb-3 max-w-sm">
                Quarterly product launches, display trends, and B2B offers.
              </p>
              {subscribed ? (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium rounded-lg px-3 py-2">
                  <CheckCircle2 size={14} />
                  You&apos;re subscribed.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    aria-label="Email address"
                    className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links: Products */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.18em] mb-5">
              Products
            </h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Solutions */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.18em] mb-5">
              Solutions
            </h4>
            <ul className="space-y-3">
              {SOLUTION_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.18em] mt-8 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-4">
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.18em] mb-5">
              Contact
            </h4>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-blue-300" />
                </div>
                <div className="text-sm leading-relaxed text-gray-400">
                  Office No. 855, 8th Floor,<br />
                  Supernova Astralis, Sector-94,<br />
                  Noida, UP — 201301
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-blue-300" />
                </div>
                <a
                  href="tel:+919310509909"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  +91 93105 09909
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-blue-300" />
                </div>
                <a
                  href="mailto:info@aplustechsol.com"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  info@aplustechsol.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-blue-300" />
                </div>
                <div className="text-sm text-gray-400">
                  Mon – Sat · 9:00 AM – 6:00 PM IST
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ───────────────── Bottom bar ───────────────── */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              CIN: U72900DL2020PTC374888 <span className="mx-2 text-gray-600">|</span> GSTIN: 07AAUCA5631L1Z6
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
