"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { QuoteItem } from "@/context/QuoteContext";
import WhatsAppIcon from "./WhatsAppIcon";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { getCachedLead, setCachedLead } from "@/lib/leadGate";

const FIELDS = [
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Company Email", type: "email", placeholder: "you@company.com" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
] as const;

function generateEmailBody(items: QuoteItem[]) {
  let body = "I would like to request a quote for the following items:\n\n";
  items.forEach((item, index) => {
    body += `${index + 1}. ${item.product.name} (Series: ${item.product.series})\n`;
    body += `   Quantity: ${item.quantity}\n`;
    body += `   Product ID: ${item.product.id}\n\n`;
  });
  return body;
}

function generateWhatsAppMessage(items: QuoteItem[]) {
  let msg = "Hi! I'd like to request a quote for the following Samsung displays from Aplus Technology Solutions:\n\n";
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.product.name} (${item.product.series}) — Qty: ${item.quantity}\n`;
  });
  msg += "\nPlease share pricing, availability, and delivery timeline. Thank you!";
  return encodeURIComponent(msg);
}

interface Props {
  items: QuoteItem[];
  totalItems: number;
  onSuccess: (name: string) => void;
}

export default function QuoteSubmitForm({ items, totalItems, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [prefill, setPrefill] = useState<Record<string, string>>({});

  // Prefill from the shared lead-gate cache (if visitor already gated a download)
  useEffect(() => {
    const cached = getCachedLead();
    if (cached) {
      setPrefill({
        name: cached.name,
        email: cached.email,
        phone: cached.phone,
      });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const payload: Record<string, string> = {
      subject: `New Quote Request for ${totalItems} Items`,
      from_name: "Aplus Website Quote",
      items_list: generateEmailBody(items),
    };
    fd.forEach((value, key) => {
      if (key !== "message") payload[key] = value as string;
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        // Cache submitted contact info so future downloads (spec sheet, compare PDF/Excel) skip the gate
        setCachedLead({
          name,
          email: payload.email ?? "",
          phone: payload.phone ?? "",
        });
        trackEvent("quote_cart_submitted", { total_items: totalItems });
        onSuccess(name);
      } else {
        // Surface a friendly failure message (never the raw API string) so the
        // user isn't left staring at a dead form.
        setSubmitError(
          response.status === 429
            ? "Too many requests. Please wait a few minutes and try again."
            : response.status === 413
            ? "Your request is too large. Please remove a few items or shorten your notes, then try again."
            : "Something went wrong sending your request. Please try again, or reach us on WhatsApp below."
        );
        trackEvent("quote_cart_submit_failed", { total_items: totalItems, status: response.status });
      }
    } catch (err) {
      console.error("Submission failed", err);
      setSubmitError(
        "We couldn't reach our server. Check your connection and try again, or message us on WhatsApp below."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 sm:p-8 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Request</h2>


      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot — hidden from users; bots that fill it are silently dropped */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />
        <textarea
          name="message"
          hidden
          readOnly
          value={generateEmailBody(items)}
        />

        {FIELDS.map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
            >
              {label}
            </label>
            <input
              required
              id={id}
              name={id}
              type={type}
              placeholder={placeholder}
              defaultValue={prefill[id] ?? ""}
              key={`${id}-${prefill[id] ?? ""}`}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm"
            />
          </div>
        ))}

        <div>
          <label
            htmlFor="requirements"
            className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"
          >
            Additional Notes{" "}
            <span className="text-gray-300 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={3}
            placeholder="Special requirements, site details, timeline..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm resize-none"
          />
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="pt-2 space-y-2.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              "Sending…"
            ) : (
              <>
                Request Pricing
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage(items)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("quote_whatsapp_click", { total_items: totalItems })}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <WhatsAppIcon />
            Send Cart via WhatsApp
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </div>

        <p className="text-[11px] text-center text-gray-400 pt-1">
          No credit card needed.{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </form>
    </div>
  );
}
