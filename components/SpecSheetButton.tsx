"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown } from "lucide-react";
import type { Product } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import LeadGateModal from "@/components/LeadGateModal";
import { hasGated } from "@/lib/leadGate";
import { downloadPdf } from "@/lib/pdf/download";

interface Props {
  product: Product;
  // Compact: rides the Compare row inside ProductActions — shorter label, tighter padding.
  compact?: boolean;
}

export default function SpecSheetButton({ product, compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const triggerPdf = async () => {
    setIsGenerating(true);
    try {
      const { buildSpecSheetPdf } = await import("@/lib/pdf/specSheet");
      const bytes = await buildSpecSheetPdf(product);
      const filename = `${product.id}-spec-sheet.pdf`;
      downloadPdf(bytes, filename);
    } catch (err) {
      console.error("[spec sheet pdf]", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClick = useCallback(() => {
    if (isGenerating) return;
    // Smart gate: skip the modal if the visitor has already submitted any Aplus form
    if (hasGated()) {
      trackEvent("spec_sheet_downloaded_cached", { product_id: product.id });
      triggerPdf();
      return;
    }
    setIsOpen(true);
  }, [isGenerating, product.id]); // eslint-disable-line react-hooks/exhaustive-deps -- triggerPdf is a plain fn, not memoized

  return (
    <>
      {/* useSearchParams() forces the nearest Suspense boundary to bail out to
          client-side rendering during static prerender. This route has a
          loading.tsx, so that boundary is the ENTIRE page — leaving the static
          HTML with no h1, no body and no JSON-LD, which AI crawlers (they don't
          run JS) saw as an empty shell. Keeping the hook in its own boundary
          confines the bailout to this invisible node so the page still
          prerenders. Same pattern as components/Analytics.tsx. */}
      <Suspense fallback={null}>
        <SpecSheetAutoDownload onAutoDownload={handleClick} />
      </Suspense>

      <button
        onClick={handleClick}
        disabled={isGenerating}
        className={`flex items-center justify-center w-full py-3.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-slate-300 hover:text-blue-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 bg-white disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
          compact ? "gap-1.5 px-2 text-sm whitespace-nowrap" : "gap-2 text-[15px]"
        }`}
      >
        <FileDown size={compact ? 16 : 18} />
        {isGenerating
          ? compact ? "Preparing…" : "Preparing PDF…"
          : compact ? "Spec Sheet (PDF)" : "Download Spec Sheet (PDF)"}
      </button>

      <LeadGateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUnlock={() => {
          setIsOpen(false);
          trackEvent("spec_sheet_downloaded", {
            product_id: product.id,
            product_name: product.name,
          });
          triggerPdf();
        }}
        title={`Download the ${product.series} Spec Sheet`}
        subtitle="Enter your details to instantly access the full technical specification PDF."
        subject={`Spec Sheet Download — ${product.name}`}
        itemDescription={`• ${product.name} (${product.series}) — Spec Sheet Requested`}
        ctaLabel="Download Spec Sheet"
        privacyNote={`We'll only use this to send you pricing for the ${product.series}. No spam, ever.`}
        analyticsKey="spec_sheet_gate"
      />
    </>
  );
}

/**
 * A spec-sheet link sent from the sales console (lib/chat/links.ts) lands here
 * as ?download=spec. Fires the SAME gated path the button uses — not triggerPdf
 * directly — so the lead gate still applies.
 *
 * Split out of SpecSheetButton purely to contain the useSearchParams() render
 * bailout (see the Suspense wrapper at the call site). Renders nothing.
 */
function SpecSheetAutoDownload({ onAutoDownload }: { onAutoDownload: () => void }) {
  const searchParams = useSearchParams();
  // Guard with a ref (not state) so StrictMode's double-invoke in dev can't
  // fire it twice.
  const autoFired = useRef(false);

  useEffect(() => {
    if (autoFired.current) return;
    if (searchParams.get("download") !== "spec") return;
    autoFired.current = true;
    onAutoDownload();
  }, [searchParams, onAutoDownload]);

  return null;
}
