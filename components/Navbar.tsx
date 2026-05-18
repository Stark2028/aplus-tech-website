"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, ShoppingBag, Phone, Search } from "lucide-react";
import { productCategories } from "@/data/categories";
import { useQuote } from "@/context/QuoteContext";
import SearchModal from "@/components/SearchModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileProducts, setMobileProducts] = useState(false);
  const [mobileSolutions, setMobileSolutions] = useState(false);
  const { quoteItems } = useQuote();

  const cartCount = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const SOLUTIONS = [
    { label: "Hospitality", href: "/solutions/hospitality" },
    { label: "Corporate & Workplace", href: "/solutions/corporate" },
    { label: "Education", href: "/solutions/education" },
    { label: "Retail & Public Spaces", href: "/solutions/retail" },
  ];

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-md border-b border-gray-100" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="https://www.aplustechsol.com/assets/img/logo.webp"
              alt="Aplus Technology Solutions"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
            <span
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#1e3a5f", lineHeight: "1.35" }}
            >
              Aplus Technology<br />Solutions Pvt. Ltd.
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              Home
            </Link>

            {/* Products dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                Products
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block">
                <div className="bg-white border border-gray-100 shadow-xl rounded-2xl py-2 px-2 w-60 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Categories
                    </span>
                  </div>
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {cat.navLabel}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                    <Link
                      href="/products"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                Solutions
                <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block">
                <div className="bg-white border border-gray-100 shadow-xl rounded-2xl py-2 px-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Industries
                    </span>
                  </div>
                  {SOLUTIONS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                    >
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/about"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search modal (desktop trigger + modal) */}
            <SearchModal />

            {/* Phone */}
            <a
              href="tel:+919310509909"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Phone size={14} />
              <span className="font-medium">+91 93105 09909</span>
            </a>

            {/* Quote cart */}
            <Link
              href="/quote"
              className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all"
              aria-label="View quote cart"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Request quote CTA */}
            <Link
              href="/quote"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
            >
              Request Quote
            </Link>
          </div>

          {/* Mobile: search + quote badge + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("aplus:search:open"))}
              className="p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <Link href="/quote" className="relative p-2">
              <ShoppingBag size={22} className="text-gray-700" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            {/* Mobile Products accordion */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={() => setMobileProducts(!mobileProducts)}
              >
                Products
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${mobileProducts ? "rotate-180" : ""}`}
                />
              </button>
              {mobileProducts && (
                <div className="pl-4 mt-1 space-y-1 border-l-2 border-blue-100 ml-4">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {cat.navLabel}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm font-semibold text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Products →
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Solutions accordion */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                onClick={() => setMobileSolutions(!mobileSolutions)}
              >
                Solutions
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${mobileSolutions ? "rotate-180" : ""}`}
                />
              </button>
              {mobileSolutions && (
                <div className="pl-4 mt-1 space-y-1 border-l-2 border-blue-100 ml-4">
                  {SOLUTIONS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              <a
                href="tel:+919310509909"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl"
              >
                <Phone size={16} />
                +91 93105 09909
              </a>
              <Link
                href="/quote"
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl text-center"
                onClick={() => setIsOpen(false)}
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
