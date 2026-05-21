"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Headphones,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import type { QuoteItem } from "@/context/QuoteContext";

const TRUST_ITEMS = [
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
];

interface Props {
  items: QuoteItem[];
  totalItems: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function QuoteItemsCard({
  items,
  totalItems,
  onUpdateQuantity,
  onRemove,
  onClear,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <ShoppingBag size={18} className="text-gray-400" />
            Items ({totalItems})
          </h2>
          <button
            onClick={onClear}
            className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center group hover:bg-gray-50/60 transition-colors"
            >
              <Link
                href={`/products/${item.product.id}`}
                className="flex flex-col sm:flex-row gap-5 sm:items-center flex-1 min-w-0 hover:opacity-90 transition-opacity"
              >
                <div className="relative w-full sm:w-28 h-28 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 112px"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

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
              </Link>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
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
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.product.id)}
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

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
        <p className="font-bold text-gray-900 mb-5">Why partner with Aplus?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
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
  );
}
