"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex fixed bottom-20 md:bottom-22 right-4 md:left-5 md:right-auto z-50 w-10 h-10 bg-gray-900/90 hover:bg-blue-600 backdrop-blur text-white rounded-xl items-center justify-center shadow-lg transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.8) translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label="Back to top"
      aria-hidden={!visible}
    >
      <ChevronUp size={18} />
    </button>
  );
}
