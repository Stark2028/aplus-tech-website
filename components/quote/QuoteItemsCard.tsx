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

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 print:space-y-0">
      {/* ─── PRINT-ONLY LETTERHEAD ───────────────────────────────────── */}
      <header className="hidden print:block mb-6 pb-5 border-b-2 border-gray-300 avoid-break">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Aplus Technology Solutions"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              unoptimized
            />
            <div>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                Aplus Technology Solutions Pvt. Ltd.
              </p>
              <p className="text-[11px] text-gray-600 leading-snug mt-1">
                Office No. 855, 8th Floor, Supernova Astralis<br />
                Sector-94, Noida, Uttar Pradesh 201301
              </p>
              <p className="text-[11px] text-gray-600 mt-1">
                +91 93105 09909 · info@aplustechsol.com · aplustechsol.com
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1 print-text-brand">
              Quote Request
            </p>
            <p className="text-sm font-bold text-gray-900">{quoteRef}</p>
            <p className="text-[11px] text-gray-600 mt-2">
              Issued: <span className="font-semibold">{quoteDate}</span>
            </p>
            <p className="text-[11px] text-gray-600">
              Valid until: <span className="font-semibold">{validUntil}</span>
            </p>
          </div>
        </div>
      </header>

      {/* ─── ITEMS CARD ───────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm print:border-0 print:shadow-none print:rounded-none">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4 print:hidden">
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

        {/* Print-only items header — table style */}
        <div className="hidden print:block px-0 pb-3 mb-2 border-b border-gray-300 print-border">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            <div className="col-span-1">#</div>
            <div className="col-span-7">Product</div>
            <div className="col-span-3">Specifications</div>
            <div className="col-span-1 text-right">Qty</div>
          </div>
        </div>

        {/* Interactive items (hidden in print) */}
        <div className="divide-y divide-gray-50 print:hidden">
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

        {/* Print-only items table */}
        <div className="hidden print:block">
          {items.map((item, idx) => (
            <div
              key={item.product.id}
              className="grid grid-cols-12 py-3 border-b border-gray-200 print-border avoid-break text-[11px]"
            >
              <div className="col-span-1 text-gray-500">{String(idx + 1).padStart(2, "0")}</div>
              <div className="col-span-7 pr-3">
                <p className="font-bold text-gray-900 leading-snug">{item.product.name}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Series: {item.product.series} · Category: {item.product.category}
                </p>
              </div>
              <div className="col-span-3 text-[10px] text-gray-700 leading-relaxed">
                <p>{item.product.specs.resolution}</p>
                <p>{item.product.specs.brightness}</p>
                <p>
                  Sizes: {item.product.specs.screenSizes.map((s) => `${s}"`).join(" · ")}
                </p>
              </div>
              <div className="col-span-1 text-right font-bold text-gray-900">
                {item.quantity}
              </div>
            </div>
          ))}

          {/* Print-only summary line */}
          <div className="grid grid-cols-12 py-3 mt-2 text-[11px] font-bold">
            <div className="col-span-11">Total items</div>
            <div className="col-span-1 text-right">{totalItems}</div>
          </div>

          {/* Print-only pricing notice */}
          <div className="mt-4 p-3 border border-gray-300 print-border bg-gray-50 text-[10px] text-gray-700 leading-relaxed avoid-break">
            <p className="font-bold text-gray-900 mb-1">Pricing</p>
            <p>
              Final pricing will be issued by our sales team within 24 business hours
              of submission. Volume discounts apply on orders of 5+ units. Prices are
              exclusive of GST; formal GST invoice issued with order confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE TRUST STRIP (hidden in print) ────────────────── */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 print:hidden">
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

      {/* ─── PRINT-ONLY FOOTER ────────────────────────────────────────── */}
      <footer className="hidden print:block mt-6 pt-4 border-t border-gray-300 print-border text-[10px] text-gray-600 avoid-break">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="font-bold text-gray-900 mb-1">Next steps</p>
            <p className="leading-relaxed">
              Submit this quote online or share this PDF with our team to receive
              formal pricing within 24 business hours.
            </p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">Reach us</p>
            <p>+91 93105 09909</p>
            <p>info@aplustechsol.com</p>
            <p>aplustechsol.com/quote</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">Validity</p>
            <p className="leading-relaxed">
              This is a quote request, not an invoice. Pricing subject to confirmation.
              Reference {quoteRef} valid until {validUntil}.
            </p>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4 pt-3 border-t border-gray-200 print-border">
          Aplus Technology Solutions Pvt. Ltd. · Authorized Samsung B2B Display Distributor · Pan-India
        </p>
      </footer>
    </div>
  );
}
