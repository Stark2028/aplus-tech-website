import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function EmptyQuoteState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
      <div className="bg-white p-8 rounded-full shadow-lg mb-6 ring-1 ring-gray-100">
        <ShoppingBag size={48} className="text-gray-300" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
        Your Quote Cart is Empty
      </h1>

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
