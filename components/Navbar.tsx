"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuote } from "@/context/QuoteContext";
import NavbarDesktop from "@/components/navbar/NavbarDesktop";
import NavbarMobile from "@/components/navbar/NavbarMobile";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { quoteItems } = useQuote();

  const cartCount = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-md border-b border-gray-100" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
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

          <NavbarDesktop cartCount={cartCount} />
          <NavbarMobile cartCount={cartCount} />
        </div>
      </div>
    </nav>
  );
}
