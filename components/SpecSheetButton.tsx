"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import type { Product } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import LeadGateModal from "@/components/LeadGateModal";
import { hasGated } from "@/lib/leadGate";
import { downloadPdf } from "@/lib/pdf/download";

interface Props {
  product: Product;
}

export default function SpecSheetButton({ product }: Props) {
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

  const handleClick = () => {
    if (isGenerating) return;
    // Smart gate: skip the modal if the visitor has already submitted any Aplus form
    if (hasGated()) {
      trackEvent("spec_sheet_downloaded_cached", { product_id: product.id });
      triggerPdf();
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 w-full py-3.5 border border-slate-200 rounded-xl text-[15px] font-semibold text-slate-700 hover:border-slate-300 hover:text-blue-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 bg-white disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <FileDown size={18} />
        {isGenerating ? "Preparing PDF…" : "Download Spec Sheet (PDF)"}
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
