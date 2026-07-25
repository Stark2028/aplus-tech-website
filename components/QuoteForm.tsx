"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/formSchemas";
import { registerIndianPhone } from "@/lib/phone";

/** Tiny helper — renders a red error message beneath a field */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export default function QuoteForm({ productName }: { productName: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({ resolver: zodResolver(quoteFormSchema) });

  const onSubmit = async (values: QuoteFormValues) => {
    const payload: Record<string, string> = {
      subject: `New Quote Request: ${productName}`,
      from_name: "Aplus Tech Website",
      product: productName,
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message ?? "",
      // Honeypot: not in the Zod schema, read directly from the form. Humans
      // leave it empty; bots that fill it are silently dropped server-side.
      company_website: (getValues() as Record<string, string>).company_website ?? "",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        toast.success("Quote request sent successfully!");
        trackEvent("quote_form_submitted", { product_name: productName });
      } else {
        toast.error(data.message || "Failed to send request.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div role="alert" className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-600 w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
        <p className="text-gray-600">
          We have received your inquiry for the <span className="font-semibold">{productName}</span>.{" "}
          Our sales team will email you a formal quote within 24 hours.
        </p>
        <button
          onClick={() => { setIsSubmitted(false); reset(); }}
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Honeypot — hidden from users; bots that fill it are silently dropped */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
          {...register("company_website" as keyof QuoteFormValues)}
        />

        {/* Full Name */}
        <div>
          <label htmlFor="qf-name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="qf-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "qf-name-error" : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
              errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            {...register("name")}
          />
          <span id="qf-name-error">
            <FieldError message={errors.name?.message} />
          </span>
        </div>

        {/* Work Email */}
        <div>
          <label htmlFor="qf-email" className="block text-sm font-medium text-gray-700 mb-1">
            Work Email <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="qf-email"
            type="email"
            autoComplete="email"
            placeholder="john@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "qf-email-error" : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
              errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            {...register("email")}
          />
          <span id="qf-email-error">
            <FieldError message={errors.email?.message} />
          </span>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="qf-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="qf-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "qf-phone-error" : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
              errors.phone ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            {...registerIndianPhone(register("phone"))}
          />
          <span id="qf-phone-error">
            <FieldError message={errors.phone?.message} />
          </span>
        </div>

        {/* Requirements (optional) */}
        <div>
          <label htmlFor="qf-message" className="block text-sm font-medium text-gray-700 mb-1">
            Requirements
          </label>
          <textarea
            id="qf-message"
            rows={3}
            placeholder="I need 5 units for a conference room..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "qf-message-error" : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
              errors.message ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            {...register("message")}
          />
          <span id="qf-message-error">
            <FieldError message={errors.message?.message} />
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? "Sending quote request…" : "Send quote request"}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
          {isSubmitting ? "Sending..." : "Send Request"}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Your information is secure. We do not spam.
        </p>
      </form>
    </div>
  );
}