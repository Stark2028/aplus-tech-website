import Link from "next/link";
import { ShieldCheck, Award, Truck, CheckCircle2 } from "lucide-react";

const ICONS = [ShieldCheck, Award, Truck];
const PROMISES = [
  "No minimum order",
  "Bulk pricing available",
  "GST invoice provided",
  "EMI available",
];

export default function FinalCTA() {
  return (
    <section className="relative py-10 md:py-16 overflow-hidden bg-[#0d1526] text-center px-4">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] animate-slow-glow pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500 rounded-full filter blur-[120px] animate-slow-glow-delayed pointer-events-none" />
      <div className="relative max-w-3xl mx-auto z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          {ICONS.map((Icon, i) => (
            <div key={i} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Icon size={16} className="text-blue-300" />
            </div>
          ))}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Upgrade Your Displays?
        </h2>
        <p className="text-lg text-blue-200/70 mb-10 max-w-xl mx-auto">
          Get a personalised quote in 24 hours. Our display specialists are
          standing by to help you choose the perfect setup.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/contact"
            className="bg-white text-gray-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all hover:scale-105"
          >
            Contact Sales Team
          </Link>
          <Link
            href="/products"
            className="bg-transparent border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:bg-white/5"
          >
            Browse Products
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
          {PROMISES.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
