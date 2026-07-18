"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  TimerIcon,
} from "@/components/icons";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const PRODUCT_LINKS = [
  { label: "Digital Signage", href: "/categories/digital-signage" },
  { label: "Video Walls", href: "/categories/video-walls" },
  { label: "Interactive Displays", href: "/categories/interactive" },
  { label: "Hospitality & Business TV", href: "/categories/commercial-tv" },
  { label: "Video Conferencing", href: "/categories/video-conferencing" },
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
  const pathname = usePathname();

  // On the homepage the logo link won't navigate, so scroll to top instead.
  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#070b15] text-gray-400 overflow-hidden print:hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="absolute -top-40 left-1/4 w-150 h-150 bg-blue-600 rounded-full filter blur-[180px] opacity-[0.08] pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-125 h-125 bg-cyan-500 rounded-full filter blur-[160px] opacity-[0.06] pointer-events-none" />

      {/* ───────────────── Top CTA band ───────────────── */}
      <div className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">
                Get in touch
              </p>
              <h3 className="text-white text-2xl font-bold tracking-tight leading-tight">
                Need help choosing the right display?
              </h3>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Phone size={15} className="text-blue-300" />
                {PHONE_DISPLAY}
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
          <div className="col-span-2 lg:col-span-3 pr-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <Link href="/" onClick={handleHomeClick} className="inline-flex items-center justify-center bg-white p-2 rounded-lg shadow-sm shrink-0 self-start sm:self-auto">
                <Image
                  src="/logo.png"
                  alt="Aplus Technology Solutions"
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">
                Authorized Samsung Display distributor providing end-to-end commercial solutions across India.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheckIcon size={16} className="text-slate-200" accentClassName="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    Samsung Authorized
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Business Display Partner
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <BadgeCheckIcon size={16} className="text-slate-200" accentClassName="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    ISO 9001:2015
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    Certified Quality Management
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Links: Products */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-widest mb-6">
              Products
            </h4>
            <ul className="space-y-3.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Solutions */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-widest mb-6">
              Solutions
            </h4>
            <ul className="space-y-3.5">
              {SOLUTION_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Company */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-3.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-3">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-widest mb-6">
              Contact
            </h4>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPinIcon size={14} className="text-slate-300" accentClassName="text-blue-400" />
                </div>
                <div className="text-sm leading-relaxed text-slate-400">
                  Office No. 855, 8th Floor,<br />
                  Supernova Astralis, Sector-94,<br />
                  Noida, UP — 201301
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0">
                  <PhoneIcon size={14} className="text-slate-300" accentClassName="text-blue-400" />
                </div>
                <a
                  href={PHONE_TEL}
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0">
                  <MailIcon size={14} className="text-slate-300" accentClassName="text-blue-400" />
                </div>
                <a
                  href="mailto:info@aplustechsol.com"
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  info@aplustechsol.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center shrink-0">
                  <TimerIcon size={14} className="text-slate-300" accentClassName="text-blue-400" />
                </div>
                <div className="text-sm text-slate-400">
                  Mon – Sat : 10:00 – 18:00 IST
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ───────────────── Bottom bar ───────────────── */}
      <div className="relative border-t border-slate-800 pb-28 md:pb-0">
        {/* Reserve generous space below the bar on every breakpoint so the
            fixed floating buttons (Back-to-Top on mobile bottom-right, "Find
            Your Display" on md+ bottom-left) never overlap the legal links. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:pb-24 flex flex-col sm:flex-row justify-between items-center gap-5 sm:gap-4 text-xs text-slate-400">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd. All rights reserved.
            </p>
            {/* CIN + GSTIN: each value kept whole (whitespace-nowrap) so it never
                splits mid-string on narrow phones. Stacked on mobile, inline with
                a divider from sm up. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-slate-500">
              <span className="whitespace-nowrap">CIN: U72900DL2020PTC374888</span>
              <span className="hidden sm:inline mx-2 text-slate-600">|</span>
              <span className="whitespace-nowrap">GSTIN: 07AAUCA5631L1Z6</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 max-w-xl">
              Logitech® is a trademark of Logitech. Aplus Technology Solutions is
              an independent reseller of Logitech products and is not affiliated
              with or endorsed by Logitech.
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
