"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { productCategories } from "@/data/categories";
import { PHONE_NUMBER, PHONE_TEL, SOLUTIONS } from "./navConfig";

interface Props {
  cartCount: number;
}

export default function NavbarMobile({ cartCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("aplus:search:open"))}
          className="p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          aria-label="Search"
        >
          <Search size={22} aria-hidden="true" />
        </button>
        <Link
          href="/quote"
          className="relative p-2"
          aria-label={cartCount > 0 ? `View quote cart, ${cartCount} items` : "View quote cart"}
        >
          <ShoppingBag size={22} className="text-gray-700" strokeWidth={1.8} aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-0 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={close}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              Home
            </Link>

            <div>
              <button
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                aria-controls="mobile-products-panel"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                Products
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {productsOpen && (
                <div id="mobile-products-panel" className="pl-4 mt-1 space-y-1 border-l-2 border-blue-100 ml-4">
                  {productCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg"
                    >
                      {cat.navLabel}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    onClick={close}
                    className="block px-4 py-2 text-sm font-semibold text-blue-600"
                  >
                    View All Products →
                  </Link>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setSolutionsOpen((v) => !v)}
                aria-expanded={solutionsOpen}
                aria-controls="mobile-solutions-panel"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                Solutions
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${solutionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {solutionsOpen && (
                <div id="mobile-solutions-panel" className="pl-4 mt-1 space-y-1 border-l-2 border-blue-100 ml-4">
                  {SOLUTIONS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/room-configurator"
              onClick={close}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              Room Configurator
            </Link>

            <Link
              href="/about"
              onClick={close}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={close}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              Contact
            </Link>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              <a
                href={PHONE_TEL}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl"
              >
                <Phone size={16} aria-hidden="true" />
                {PHONE_NUMBER}
              </a>
              <Link
                href="/quote"
                onClick={close}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl text-center"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
