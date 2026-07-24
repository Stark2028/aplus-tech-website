"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useQuote } from "@/context/QuoteContext";
import NavbarDesktop from "@/components/navbar/NavbarDesktop";
import NavbarMobile from "@/components/navbar/NavbarMobile";

// SearchModal is only needed when the user clicks the search icon.
// Lazy-loading it cuts it out of the critical bundle entirely.
const SearchModal = dynamic(() => import("@/components/SearchModal"), { ssr: false });

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { quoteItems } = useQuote();
  const pathname = usePathname();

  const cartCount = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  // When the home link / logo is clicked while already on the homepage,
  // Next.js won't navigate — so scroll back to the top ourselves.
  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sales console (/admin) is a standalone full-screen tool — no marketing chrome.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-300 print:hidden ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-glass border-b border-gray-200/50" 
          : "bg-white/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt="Aplus Technology Solutions"
              width={48}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
            <span
              style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e3a5f", lineHeight: "1.35" }}
            >
              Aplus Technology<br />Solutions Pvt. Ltd.
            </span>
          </Link>

          <NavbarDesktop cartCount={cartCount} onHomeClick={handleHomeClick} />
          <NavbarMobile cartCount={cartCount} onHomeClick={handleHomeClick} />
        </div>
      </div>
    </header>
    {/* SearchModal is rendered globally here so it works on ALL breakpoints (mobile + desktop) */}
    <SearchModal />
    </>
  );
}
