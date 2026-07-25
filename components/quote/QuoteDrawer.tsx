"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { MonitorIcon } from "@/components/icons";

// Interactive elements the Tab-trap can land focus on. Filtered at call time to
// what's actually rendered + visible + enabled, since the panel's contents
// change (empty state ⇄ line items ⇄ footer) and the minus button disables at
// quantity 1.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);
}

export default function QuoteDrawer() {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const {
    quoteItems,
    isQuoteOpen,
    closeQuote,
    updateQuantity,
    removeItem,
    clearQuote,
  } = useQuote();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isQuoteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isQuoteOpen]);

  // Move focus into the drawer when it opens and restore it to whatever was
  // focused before (the trigger — e.g. the toast's "View Quote" action) when it
  // closes. Guarded so nothing runs while the drawer sits closed in the portal.
  useEffect(() => {
    if (!isQuoteOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Defer to next frame so focus lands after the panel is painted/interactive.
    const raf = requestAnimationFrame(() => {
      const focusables = getFocusable(panel);
      (focusables[0] ?? panel).focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      const prev = previouslyFocusedRef.current;
      if (prev && document.contains(prev) && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isQuoteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuoteOpen) return;

      if (e.key === "Escape") {
        closeQuote();
        return;
      }

      // Tab-trap: keep focus cycling within the drawer while it's open.
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = getFocusable(panel);
        if (focusables.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuoteOpen, closeQuote]);

  if (!mounted) return null;

  const totalQuantity = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  return createPortal(
    <div
      // `inert` alone hides + de-focuses the closed drawer. aria-hidden here would
      // fire "aria-hidden on a focused ancestor" when a link inside (e.g. "Browse
      // Products", which calls closeQuote onClick) still holds focus as it closes.
      inert={!isQuoteOpen ? true : undefined}
      className={`fixed inset-0 z-[100] transition-opacity duration-300 motion-reduce:transition-none ${
        isQuoteOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={closeQuote}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          isQuoteOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quote Request Drawer"
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white shadow-2xl flex flex-col outline-none transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          isQuoteOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900">Your Quote</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {quoteItems.length} {quoteItems.length === 1 ? "product" : "products"}
            </span>
          </div>
          <button
            type="button"
            onClick={closeQuote}
            aria-label="Close quote drawer"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {quoteItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Your quote is empty
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Add products from our catalog to build your custom B2B quote request.
              </p>
              <Link
                href="/products"
                onClick={closeQuote}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Browse Products <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            quoteItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-xs hover:border-gray-200 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 relative bg-gray-50 rounded-lg p-1 shrink-0 flex items-center justify-center border border-gray-100">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <MonitorIcon size={24} className="text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate leading-snug">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {item.product.series ? `${item.product.series} Series` : item.product.category}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="p-1 hover:bg-white rounded text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className="p-1 hover:bg-white rounded text-gray-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  aria-label={`Remove ${item.product.name} from quote`}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {quoteItems.length > 0 && (
          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-gray-100 bg-gray-50/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Total Items</span>
              <span className="font-bold text-gray-900">
                {totalQuantity} {totalQuantity === 1 ? "unit" : "units"} ({quoteItems.length} {quoteItems.length === 1 ? "product" : "products"})
              </span>
            </div>

            <Link
              href="/quote"
              onClick={closeQuote}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
            >
              Proceed to Quote Request <ArrowRight size={16} />
            </Link>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={clearQuote}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors font-medium"
              >
                Clear Quote Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
