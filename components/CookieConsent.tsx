"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aplus_cookie_consent");
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("aplus_cookie_consent", "accepted");
    window.dispatchEvent(new Event("aplus:consent_accepted"));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("aplus_cookie_consent", "declined");
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-300 p-3 sm:p-4 transition-all duration-300"
      style={{
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
      role="dialog"
      aria-label="Cookie consent"
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="max-w-4xl mx-auto bg-gray-950 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-9 h-9 bg-blue-600/15 rounded-xl flex items-center justify-center shrink-0">
          <Cookie size={18} className="text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white mb-0.5">We use cookies</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            We use cookies to improve your experience and measure site usage, in compliance with the Digital Personal Data Protection Act (DPDP), India.{" "}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none text-xs text-gray-400 hover:text-white font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={decline}
            className="text-gray-600 hover:text-gray-300 transition-colors p-1.5"
            aria-label="Close cookie banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
