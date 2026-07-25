"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Link2, X } from "lucide-react";
import { searchCatalogue, buildProductLink, buildSpecSheetLink, buildCatalogueLink } from "@/lib/chat/links";
import type { ChatLink } from "@/lib/chat/types";

/**
 * Quick-send links (spec §4.1 A) — search the catalogue, send a product page or
 * its spec sheet as a titled card. The cheapest path: no upload, no egress, and
 * the visitor lands back on-site where the lead gate still applies.
 */
export default function LinkPicker({ onPick }: { onPick: (link: ChatLink) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const hits = searchCatalogue(query);

  const send = (link: ChatLink) => {
    onPick(link);
    setOpen(false);
    setQuery("");
  };

  // Dismiss on outside click while open, matching every other popover here.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Send a product link or spec sheet"
        aria-expanded={open}
        title="Send a product link or spec sheet"
        className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors"
      >
        <Link2 size={16} />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-10 w-80 max-w-[calc(100vw-32px)] bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // This input is a descendant of the composer <form>, so a bare
                // Enter would trigger implicit submission and send the agent's
                // half-typed draft to the customer. Swallow it; Escape closes.
                if (e.key === "Enter") e.preventDefault();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Search products…"
              aria-label="Search products"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => send(buildCatalogueLink())}
            className="w-full text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-2 transition-colors"
          >
            📚 Send the full catalogue
          </button>

          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {hits.map((product) => (
              <li key={product.id} className="py-2">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{product.name}</p>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => send(buildProductLink(product))}
                    className="flex-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    Product page
                  </button>
                  <button
                    type="button"
                    onClick={() => send(buildSpecSheetLink(product))}
                    className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <FileText size={11} /> Spec sheet
                  </button>
                </div>
              </li>
            ))}
            {query.trim() && hits.length === 0 && (
              <li className="py-3 text-xs text-gray-400 text-center">No products match.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
