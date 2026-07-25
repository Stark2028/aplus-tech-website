"use client";

import { AlertCircle } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";

/**
 * Transient notice shown when a visitor tries to add a new product beyond the
 * quote cart's distinct-item cap. The cap lives in QuoteContext, which flashes
 * `limitReached` for ~2.5s; this component just renders that flag.
 *
 * Anchored top-center to stay clear of the bottom-anchored compare bar, chat
 * widget, and mobile sticky CTA. Add-to-quote actions live on many routes, so
 * this is mounted globally in the layout shell rather than on the quote page.
 */
export default function QuoteLimitToast() {
  const { limitReached } = useQuote();

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-200 motion-reduce:transition-none"
      style={{
        opacity: limitReached ? 1 : 0,
        transform: limitReached ? "translateY(0)" : "translateY(-8px)",
        pointerEvents: limitReached ? "auto" : "none",
      }}
    >
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full shadow-md">
        <AlertCircle size={13} />
        Your quote cart is full — submit or remove an item to add more.
      </div>
    </div>
  );
}
