"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Download,
  Headphones,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Scale,
} from "lucide-react";
import type { QuoteItem } from "@/context/QuoteContext";
import LeadGateModal from "@/components/LeadGateModal";
import { hasGated } from "@/lib/leadGate";
import { trackEvent } from "@/lib/analytics";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Authorized Distributor",
    desc: "Official Samsung partner — every unit is genuine and warranty-valid.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    desc: "Dedicated technical team for installation, setup, and AMC.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    desc: "Warehouses in 4 cities, express delivery to 100+ locations.",
  },
];

interface Props {
  items: QuoteItem[];
  totalItems: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Quote reference number, stable per page-load. Format: Q-YYYYMMDD-XXXX. */
function useQuoteRef(): { ref: string; date: string; validUntil: string } {
  const [{ ref, date, validUntil }] = useState(() => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const refStr = `Q-${ymd}-${rand}`;
    const valid = new Date(now);
    valid.setDate(valid.getDate() + 30);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return { ref: refStr, date: fmt(now), validUntil: fmt(valid) };
  });
  return { ref, date, validUntil };
}

export default function QuoteItemsCard({
  items,
  totalItems,
  onUpdateQuantity,
  onRemove,
  onClear,
}: Props) {
  const { ref: quoteRef, date: quoteDate, validUntil } = useQuoteRef();
  const [isGateOpen, setIsGateOpen] = useState(false);

  const doDownload = () => {
    if (typeof window === "undefined") return;
    const html = buildQuotePdfHtml({
      items,
      totalItems,
      quoteRef,
      quoteDate,
      validUntil,
    });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const handleDownload = () => {
    // Smart gate: skip if visitor has already submitted any Aplus form
    if (hasGated()) {
      trackEvent("quote_pdf_downloaded_cached", { total_items: totalItems });
      doDownload();
      return;
    }
    setIsGateOpen(true);
  };

  const itemsSummary = items
    .map((i) => `• ${i.product.name} (${i.product.series}) — Qty: ${i.quantity}`)
    .join("\n");

  return (
    <div className="space-y-6">
      {/* ─── ITEMS CARD ───────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-400" />
            Items ({totalItems})
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {items.length > 0 && (
              <>
                <button
                  onClick={handleDownload}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <Link
                  href={`/compare?ids=${items.map((i) => i.product.id).join(",")}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Scale size={15} />
                  Compare
                </Link>
              </>
            )}
            <button
              onClick={onClear}
              className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Interactive items */}
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center group hover:bg-gray-50/60 transition-colors"
            >
              <Link
                href={`/products/${item.product.id}`}
                className="flex flex-col sm:flex-row gap-5 sm:items-center flex-1 min-w-0 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-full sm:w-28 h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 112px"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    {item.product.series}
                  </p>
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 w-fit px-2.5 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    In Stock
                  </div>
                </div>
              </Link>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-600 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TRUST STRIP ──────────────────────────────────────────────── */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
        <p className="font-bold text-gray-900 mb-5">Why partner with Aplus?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── LEAD GATE MODAL ──────────────────────────────────────────── */}
      <LeadGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onUnlock={() => {
          setIsGateOpen(false);
          trackEvent("quote_pdf_downloaded", { total_items: totalItems });
          doDownload();
        }}
        title="Download Your Quote PDF"
        subtitle={`Enter your details to download the formal quote PDF for your ${totalItems} item${totalItems !== 1 ? "s" : ""}. Our sales team will follow up with pricing.`}
        subject={`Quote PDF Download — ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
        itemDescription={itemsSummary || "Quote cart PDF requested"}
        eyebrow="Quote Document"
        ctaLabel="Download Quote PDF"
        privacyNote="Same details used for the Submit Request form below — we'll prefill it for you."
        analyticsKey="quote_pdf_gate"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Quote PDF builder — opens a dedicated print-ready window
 * (Minimal Samsung-style layout, mirrors the spec sheet design)
 * ────────────────────────────────────────────────────────────────────── */

interface QuotePdfParams {
  items: QuoteItem[];
  totalItems: number;
  quoteRef: string;
  quoteDate: string;
  validUntil: string;
}

function buildQuotePdfHtml({
  items,
  totalItems,
  quoteRef,
  quoteDate,
  validUntil,
}: QuotePdfParams): string {
  const itemRows = items
    .map(
      (item, idx) => `
      <tr>
        <td class="col-num">${String(idx + 1).padStart(2, "0")}</td>
        <td class="col-product">
          <div class="product-name">${escapeHtml(item.product.name)}</div>
          <div class="product-meta">${escapeHtml(item.product.series)} · ${escapeHtml(item.product.category)}</div>
        </td>
        <td class="col-specs">
          <div>${escapeHtml(item.product.specs.resolution)}</div>
          <div>${escapeHtml(item.product.specs.brightness)}</div>
          <div>Sizes: ${item.product.specs.screenSizes
            .map((s) => `${s}"`)
            .join(" · ")}</div>
        </td>
        <td class="col-qty">${item.quantity}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quote Request ${quoteRef} | Aplus Technology Solutions</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #fff;
      color: #111;
      font-size: 10pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      max-width: 210mm;
      margin: 0 auto;
      padding: 18mm 16mm;
      background: #fff;
    }

    /* HEADER */
    .head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 1px solid #111;
    }
    .head .brand-block { max-width: 60%; }
    .head .brand {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: .12em;
      color: #111;
      text-transform: uppercase;
    }
    .head .addr {
      font-size: 8.5pt;
      color: #6b7280;
      margin-top: 6px;
      line-height: 1.55;
    }
    .head .meta {
      text-align: right;
      font-size: 8pt;
      color: #6b7280;
      line-height: 1.6;
    }
    .head .meta .doc-type {
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #2563eb;
      margin-bottom: 4px;
    }
    .head .meta .ref {
      font-size: 11.5pt;
      font-weight: 700;
      color: #111;
      letter-spacing: -.01em;
      margin-bottom: 6px;
    }
    .head .meta strong { color: #111; font-weight: 600; }

    /* TITLE BLOCK */
    .title-block { padding: 22px 0 18px; }
    .title-block h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #111;
      letter-spacing: -.02em;
      line-height: 1.15;
      margin-bottom: 4px;
    }
    .title-block .subtitle {
      font-size: 10pt;
      color: #6b7280;
    }

    /* ITEMS TABLE */
    .section { margin-bottom: 24px; }
    .section h2 {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .16em;
      color: #111;
      padding-bottom: 8px;
      border-bottom: 1px solid #111;
      margin-bottom: 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table thead th {
      text-align: left;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #9ca3af;
      padding: 12px 8px 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table thead th.col-qty { text-align: right; }
    .items-table tbody td {
      padding: 12px 8px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
      font-size: 9.5pt;
    }
    .items-table .col-num {
      width: 36px;
      color: #9ca3af;
      font-variant-numeric: tabular-nums;
    }
    .items-table .col-product { width: 54%; }
    .items-table .product-name {
      font-weight: 600;
      color: #111;
      line-height: 1.35;
      margin-bottom: 3px;
    }
    .items-table .product-meta {
      font-size: 8.5pt;
      color: #6b7280;
    }
    .items-table .col-specs {
      font-size: 8.5pt;
      color: #374151;
      line-height: 1.6;
    }
    .items-table .col-qty {
      width: 60px;
      text-align: right;
      font-weight: 700;
      color: #111;
      font-variant-numeric: tabular-nums;
    }

    /* TOTAL ROW */
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 8px;
      border-top: 2px solid #111;
      margin-top: 4px;
    }
    .total-row .label {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #111;
    }
    .total-row .value {
      font-size: 13pt;
      font-weight: 700;
      color: #111;
      letter-spacing: -.01em;
    }

    /* PRICING NOTE */
    .pricing-note {
      margin-top: 18px;
      padding: 14px 16px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
      font-size: 8.5pt;
      color: #374151;
      line-height: 1.65;
    }
    .pricing-note .label {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #2563eb;
      margin-bottom: 4px;
    }

    /* INFO GRID */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      margin-top: 26px;
      padding-top: 18px;
      border-top: 1px solid #111;
    }
    .info-col {
      padding: 0 16px;
      border-right: 1px solid #e5e7eb;
    }
    .info-col:first-child { padding-left: 0; }
    .info-col:last-child { border-right: none; padding-right: 0; }
    .info-col .label {
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .info-col .body {
      font-size: 9pt;
      color: #111;
      line-height: 1.65;
    }
    .info-col .body strong {
      font-weight: 600;
      color: #111;
    }

    /* FOOTER */
    .footer {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      font-size: 7.5pt;
      color: #9ca3af;
      line-height: 1.65;
    }
    .footer .legal { letter-spacing: .04em; }
    .footer .legal .label {
      color: #6b7280;
      font-weight: 600;
      margin-right: 4px;
    }
    .footer .copy { text-align: right; }
    .footer .copy .tag {
      font-weight: 600;
      color: #475569;
    }

    /* PRINT */
    @media print {
      body { background: #fff; }
      .sheet { padding: 0; max-width: 100%; }
      .head, .title-block, .section, .total-row, .pricing-note, .info-grid, .footer { break-inside: avoid; }
      tr { break-inside: avoid; }
      @page { size: A4; margin: 14mm 14mm 12mm; }
    }
  </style>
</head>
<body>
<div class="sheet">

  <!-- HEADER -->
  <div class="head">
    <div class="brand-block">
      <div class="brand">Aplus Technology Solutions</div>
      <div class="addr">
        Office No. 855, 8th Floor, Supernova Astralis<br/>
        Sector-94, Noida, Uttar Pradesh 201301<br/>
        +91 93105 09909 · info@aplustechsol.com
      </div>
    </div>
    <div class="meta">
      <div class="doc-type">Quote Request</div>
      <div class="ref">${quoteRef}</div>
      <div>Issued <strong>${quoteDate}</strong></div>
      <div>Valid until <strong>${validUntil}</strong></div>
    </div>
  </div>

  <!-- TITLE -->
  <div class="title-block">
    <h1>Request for Quote</h1>
    <div class="subtitle">${totalItems} item${totalItems !== 1 ? "s" : ""} · Authorized Samsung Commercial Display Distributor</div>
  </div>

  <!-- ITEMS -->
  <div class="section">
    <h2>Items Requested</h2>
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-num">#</th>
          <th class="col-product">Product</th>
          <th class="col-specs">Specifications</th>
          <th class="col-qty">Qty</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="total-row">
      <div class="label">Total Items</div>
      <div class="value">${totalItems}</div>
    </div>

    <div class="pricing-note">
      <div class="label">Pricing</div>
      Final pricing will be issued by our sales team within 24 business hours of
      submission. Volume discounts apply on orders of 5+ units. All prices are
      exclusive of GST; a formal GST invoice is issued with order confirmation.
    </div>
  </div>

  <!-- INFO GRID -->
  <div class="info-grid">
    <div class="info-col">
      <div class="label">Next Steps</div>
      <div class="body">
        Submit this quote online or share this PDF with our team to receive
        formal pricing within 24 business hours.
      </div>
    </div>
    <div class="info-col">
      <div class="label">Reach Us</div>
      <div class="body">
        <strong>+91 93105 09909</strong><br/>
        info@aplustechsol.com<br/>
        aplustechsol.com/quote
      </div>
    </div>
    <div class="info-col">
      <div class="label">Validity</div>
      <div class="body">
        This is a quote request, not an invoice. Pricing subject to
        confirmation. Reference ${quoteRef} valid until ${validUntil}.
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="legal">
      <div><span class="label">CIN</span>U72900DL2020PTC374888</div>
      <div><span class="label">GSTIN</span>07AAUCA5631L1Z6</div>
    </div>
    <div class="copy">
      <div class="tag">Aplus Technology Solutions Pvt. Ltd.</div>
      <div>Authorized Samsung B2B Display Distributor · Pan-India</div>
      <div>© ${new Date().getFullYear()} All rights reserved.</div>
    </div>
  </div>

</div>
<script>
  window.onload = function(){
    setTimeout(function(){ window.print(); }, 300);
  };
</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
