"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

export default function QuoteForm({ productName }: { productName: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult("Sending...");

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      subject: `New Quote Request: ${productName}`,
      from_name: "Aplus Tech Website",
      product: productName,
    };
    fd.forEach((value, key) => { payload[key] = value as string; });

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      setIsSubmitted(true);
      setResult("Form Submitted Successfully");
      toast.success("Quote request sent successfully!");
      trackEvent("quote_form_submitted", { product_name: productName });
    } else {
      setResult(data.message || "Something went wrong.");
      toast.error(data.message || "Failed to send request.");
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-600 w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
        <p className="text-gray-600">
          We have received your inquiry for the <span className="font-semibold">{productName}</span>. 
          Our sales team will email you a formal quote within 24 hours.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="mt-6 text-blue-600 hover:underline font-medium"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Request a Quote</h3>
      <p className="text-sm text-gray-500 mb-6">
        Get pricing and availability for this item.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden Configuration Fields for Email */}
        <input type="hidden" name="subject" value={`New Quote Request: ${productName}`} />
        <input type="hidden" name="from_name" value="Aplus Tech Website" />

        {/* Honeypot — hidden from users; bots that fill it are silently dropped */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {/* Visible Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            required 
            name="name" 
            type="text" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
          <input 
            required 
            name="email" 
            type="email" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="john@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            required 
            name="phone" 
            type="tel" 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
          <textarea 
            name="message"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="I need 5 units for a conference room..."
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={result === "Sending..."}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {result === "Sending..." ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {result === "Sending..." ? "Sending..." : "Send Request"}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Your information is secure. We do not spam.
        </p>
      </form>
    </div>
  );
}