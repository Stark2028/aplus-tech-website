import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { ShoppingBagIcon } from "@/components/icons";
import { productCategories } from "@/data/categories";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export default function EmptyQuoteState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50 text-center">
      <div className="bg-white p-8 rounded-full shadow-lg mb-6 ring-1 ring-gray-100">
        <ShoppingBagIcon
          size={48}
          className="text-slate-300"
          accentClassName="text-blue-400"
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
        Your quote cart is empty
      </h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Add the displays you&apos;re interested in and we&apos;ll send a formal
        proposal with B2B pricing within one business day.
      </p>

      {/* Category shortcuts — derived from the canonical category list so it
          always covers every category (mirrors the 404 page). */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl">
        {productCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
          >
            {cat.navLabel}
          </Link>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Browse Products
        </Link>
        <a
          href={PHONE_TEL}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-7 py-3.5 rounded-xl font-semibold transition-all"
        >
          <Phone size={16} />
          Call {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
