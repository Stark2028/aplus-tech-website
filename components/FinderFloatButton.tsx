"use client";

import Link from "next/link";
import { ScanSearch } from "lucide-react";

export default function FinderFloatButton() {
  return (
    <Link
      href="/product-finder"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-blue-600/30 font-semibold text-sm transition-all hover:scale-105 hover:shadow-blue-500/40"
      style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}
    >
      <ScanSearch size={18} />
      Find Your Display
    </Link>
  );
}
