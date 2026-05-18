"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuote } from "@/context/QuoteContext";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Send,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_NUMBER = "919310509909";

const STEPS = [
  { id: 1, label: "Select Products" },
  { id: 2, label: "Review & Submit" },
  { id: 3, label: "Get Quote" },
];

function ProgressStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 max-w-sm">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : step.id}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-semibold whitespace-nowrap ${
                  active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-12 sm:w-16 mx-1 mb-4 transition-colors ${
                  done ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function QuotePageClient() {
  const { quoteItems, removeItem, updateQuantity, clearQuote } = useQuote();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const totalItems = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  const generateEmailBody = () => {
    let body = "I would like to request a quote for the following items:\n\n";
    quoteItems.forEach((item, index) => {
      body += `${index + 1}. ${item.product.name} (Series: ${item.product.series})\n`;
      body += `   Quantity: ${item.quantity}\n`;
      body += `   Product ID: ${item.product.id}\n\n`;
    });
    return body;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const payload: Record<string, string> = {
      subject: `New Quote Request for ${totalItems} Items`,
      from_name: "Aplus Website Quote",
      items_list: generateEmailBody(),
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
      const data = await response.json();
      if (data.success) {
        setSubmittedName(name);
        setIsSubmitted(true);
        clearQuote();
        trackEvent("quote_cart_submitted", { total_items: totalItems });
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Empty state ── */
  if (quoteItems.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
        <div className="bg-white p-8 rounded-full shadow-lg mb-6 ring-1 ring-gray-100">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Your Quote Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8 text-center max-w-md leading-relaxed">
          Browse our catalog of Samsung commercial displays and add products to
          your quote list to receive a personalised bulk-pricing offer.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Browse Products
        </Link>
      </div>
    );
  }

  /* ── Success / confirmation state ── */
  if (isSubmitted) {
    const waMsg = encodeURIComponent(
      `Hi! I just submitted a quote request on your website${submittedName ? ` (${submittedName})` : ""}. Can you confirm receipt?`
    );
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator */}
          <div className="flex justify-center mb-10">
            <ProgressStepper current={3} />
          </div>

          {/* Success card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-linear-to-r from-blue-500 to-cyan-400" />

            <div className="p-8 sm:p-12 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 ring-8 ring-green-50/50">
                <CheckCircle size={40} className="text-green-500" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Quote Request Received!
              </h1>
              {submittedName && (
                <p className="text-gray-500 mb-2">
                  Thank you, <span className="font-semibold text-gray-700">{submittedName}</span>.
                </p>
              )}
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
                We&apos;ve received your enquiry and will send a formal PDF proposal
                with itemised pricing to your email.
              </p>

              {/* What happens next */}
              <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                  What happens next
                </p>
                <div className="space-y-5">
                  {[
                    {
                      icon: Clock,
                      color: "bg-blue-100 text-blue-600",
                      title: "We review your request",
                      desc: "Our sales team will review your product list within 1–2 business hours.",
                    },
                    {
                      icon: FileText,
                      color: "bg-indigo-100 text-indigo-600",
                      title: "Custom PDF quote prepared",
                      desc: "A formal quote with itemised pricing, GST details, and delivery timeline is prepared.",
                    },
                    {
                      icon: Send,
                      color: "bg-green-100 text-green-600",
                      title: "Quote delivered within 24 hours",
                      desc: "You receive the PDF via email. Our team may also follow up on WhatsApp.",
                    },
                  ].map(({ icon: Icon, color, title, desc }, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                >
                  <MessageCircle size={16} />
                  Follow up on WhatsApp
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                >
                  Browse More Products
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main quote form ── */
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="mb-4">
                <ProgressStepper current={2} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                Request a Quote
              </h1>
              <p className="text-gray-500">
                Review your {totalItems} item{totalItems !== 1 ? "s" : ""} and submit for a formal proposal.
              </p>
            </div>
            <Link
              href="/products"
              className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2 group transition-colors self-start md:self-auto"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left: Items list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <ShoppingBag size={18} className="text-gray-400" />
                  Items ({totalItems})
                </h2>
                <button
                  onClick={clearQuote}
                  className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {quoteItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center group hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative w-full sm:w-28 h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
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

                    {/* Qty + remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
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
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
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

            {/* Trust signals */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
              <p className="font-bold text-gray-900 mb-5">Why partner with Aplus?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
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
                ].map(({ icon: Icon, title, desc }) => (
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
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Request</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                We&apos;ll send a formal PDF quote with pricing to your email within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  name="message"
                  hidden
                  readOnly
                  value={generateEmailBody()}
                />

                {[
                  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
                  { id: "email", label: "Company Email", type: "email", placeholder: "you@company.com" },
                  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
                ].map(({ id, label, type, placeholder }) => (
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

                <div className="pt-2">
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
                </div>

                <p className="text-[11px] text-center text-gray-400 pt-1">
                  No credit card needed.{" "}
                  <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
