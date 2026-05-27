import Link from "next/link";
import { ChevronDown, Phone, ShoppingBag } from "lucide-react";
import { productCategories } from "@/data/categories";
import { PHONE_NUMBER, PHONE_TEL, SOLUTIONS } from "./navConfig";

interface Props {
  cartCount: number;
}

export default function NavbarDesktop({ cartCount }: Props) {
  return (
    <>
      <nav className="hidden xl:flex items-center gap-1" aria-label="Primary">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          Home
        </Link>

        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            aria-haspopup="menu"
          >
            Products
            <ChevronDown
              size={14}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:rotate-180"
            />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block">
            <div className="bg-white border border-gray-100 shadow-xl rounded-2xl py-2 px-2 w-60 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500" aria-hidden="true">
                  Categories
                </span>
              </div>
              {productCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" aria-hidden="true" />
                  {cat.navLabel}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  View All Products →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            aria-haspopup="menu"
          >
            Solutions
            <ChevronDown
              size={14}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:rotate-180"
            />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block">
            <div className="bg-white border border-gray-100 shadow-xl rounded-2xl py-2 px-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500" aria-hidden="true">
                  Industries
                </span>
              </div>
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" aria-hidden="true" />
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/about"
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          Contact
        </Link>
      </nav>

      <div className="hidden xl:flex items-center gap-3">
        {/* Search trigger — actual modal is rendered globally in Navbar.tsx */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("aplus:search:open"))}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-all w-44 group"
          aria-label="Open search (Ctrl+K)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span className="flex-1 text-left text-gray-500 text-[13px]" aria-hidden="true">Search…</span>
          <kbd className="flex items-center gap-0.5 text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-gray-500 leading-none">
            ⌘K
          </kbd>
        </button>

        <a
          href={PHONE_TEL}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Phone size={14} aria-hidden="true" />
          <span className="font-medium">{PHONE_NUMBER}</span>
        </a>

        <Link
          href="/quote"
          className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all"
          aria-label={cartCount > 0 ? `View quote cart, ${cartCount} items` : "View quote cart"}
        >
          <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <Link
          href="/quote"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
        >
          Request Quote
        </Link>
      </div>
    </>
  );
}
