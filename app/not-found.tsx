import Link from "next/link";
import { ArrowLeft, Monitor, Search, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-black text-gray-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Monitor className="text-blue-600" size={40} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "Browse Products", href: "/products", icon: Search },
            { label: "Contact Sales", href: "/contact", icon: Phone },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-700 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
