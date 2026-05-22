"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import EmptyQuoteState from "@/components/quote/EmptyQuoteState";
import QuoteSuccessState from "@/components/quote/QuoteSuccessState";
import ProgressStepper from "@/components/quote/ProgressStepper";
import QuoteItemsCard from "@/components/quote/QuoteItemsCard";
import QuoteSubmitForm from "@/components/quote/QuoteSubmitForm";

export default function QuotePageClient() {
  const { quoteItems, removeItem, updateQuantity, clearQuote } = useQuote();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const totalItems = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  if (quoteItems.length === 0 && !isSubmitted) {
    return <EmptyQuoteState />;
  }

  if (isSubmitted) {
    return <QuoteSuccessState submittedName={submittedName} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 print:hidden">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0 print:max-w-none print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 print:block">
          <div className="lg:col-span-2 print:col-span-3">
            <QuoteItemsCard
              items={quoteItems}
              totalItems={totalItems}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onClear={clearQuote}
            />
          </div>

          <div className="lg:col-span-1 print:hidden">
            <QuoteSubmitForm
              items={quoteItems}
              totalItems={totalItems}
              onSuccess={(name) => {
                setSubmittedName(name);
                setIsSubmitted(true);
                clearQuote();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
