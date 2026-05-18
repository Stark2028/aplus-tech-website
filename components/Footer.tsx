"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

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
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
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
    <footer className="bg-gray-950 text-gray-400">

      {/* Top CTA bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold mb-1">
                Get Expert Display Advice
              </h3>
              <p className="text-sm text-gray-500">
                Talk to a specialist — free consultation, no commitment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="tel:+919310509909"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-gray-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all"
              >
                <Phone size={16} className="text-blue-400" />
                +91 93105 09909
              </a>
              <Link
                href="/quote"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                Request a Quote
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="https://www.aplustechsol.com/assets/img/logo.webp"
                alt="Aplus Technology Solutions"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Authorized Samsung Business Display distributor serving enterprises, hotels, and
              institutions across India. End-to-end supply, installation, and support.
            </p>

            {/* Samsung authorized badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-gray-700 rounded-xl px-4 py-2.5 mb-6">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-none mb-0.5">
                  Samsung Authorized
                </p>
                <p className="text-[10px] text-gray-500 leading-none">Business Display Partner</p>
              </div>
            </div>

          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Products
            </h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions + Company */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Solutions
            </h4>
            <ul className="space-y-3">
              {SOLUTION_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mt-8 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs">
                  Office No. 855, 8th Floor,<br />
                  Supernova Astralis, Sector-94,<br />
                  Noida, UP — 201301
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-blue-500 shrink-0" />
                <a href="tel:+919310509909" className="hover:text-white transition-colors">
                  +91 93105 09909
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-blue-500 shrink-0" />
                <a href="mailto:info@aplustechsol.com" className="hover:text-white transition-colors text-xs">
                  info@aplustechsol.com
                </a>
              </li>
            </ul>

            <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-blue-300 font-semibold mb-0.5">Office Hours</p>
              <p className="text-xs text-gray-400">Mon – Sat: 9:00 AM – 6:00 PM IST</p>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">
                Stay Updated
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Get display tips and product updates.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                  <CheckCircle2 size={14} />
                  You&apos;re subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 min-w-0 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    <ArrowRight size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms &amp; Conditions</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
