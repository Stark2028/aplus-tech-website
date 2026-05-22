"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  RotateCcw,
  Monitor,
  LayoutGrid,
  MousePointerClick,
  Tv,
  Building2,
  GraduationCap,
  Store,
  Hotel,
  CheckCircle2,
} from "lucide-react";
import { products } from "@/data/products";

type Step = 1 | 2 | 3 | "results";

const INDUSTRIES = [
  { id: "hospitality", label: "Hospitality", sub: "Hotels & Resorts", Icon: Hotel },
  { id: "corporate", label: "Corporate", sub: "Offices & Boardrooms", Icon: Building2 },
  { id: "education", label: "Education", sub: "Schools & Universities", Icon: GraduationCap },
  { id: "retail", label: "Retail", sub: "Stores & Malls", Icon: Store },
];

const DISPLAY_TYPES = [
  { id: "Digital Signage", label: "Digital Signage", sub: "Lobbies & public areas", Icon: Monitor },
  { id: "Video Wall", label: "Video Wall", sub: "Large-format impact", Icon: LayoutGrid },
  { id: "Interactive Display", label: "Interactive Display", sub: "Touch & collaboration", Icon: MousePointerClick },
  { id: "Commercial TV", label: "Commercial TV", sub: "Hotel rooms & offices", Icon: Tv },
];

const SIZE_RANGES = [
  { id: "small",  label: "Compact",     sub: 'Under 50"',      min: 0,   max: 49  },
  { id: "medium", label: "Standard",    sub: '50" – 75"',      min: 50,  max: 75  },
  { id: "large",  label: "Large",       sub: '75" – 100"',     min: 75,  max: 100 },
  { id: "xlarge", label: "Extra Large", sub: '100" and above', min: 100, max: 999 },
];

export default function ProductFinderSection() {
  const [step, setStep] = useState<Step>(1);
  const [, setIndustry] = useState("");
  const [displayType, setDisplayType] = useState("");
  const [sizeRangeId, setSizeRangeId] = useState("");

  const getResults = () => {
    const sizeConfig = SIZE_RANGES.find((s) => s.id === sizeRangeId);
    return products
      .filter((p) => {
        if (p.category !== displayType) return false;
        if (!sizeConfig) return true;
        return p.specs.screenSizes.some((s) => {
          const n = parseInt(s);
          return n >= sizeConfig.min && n <= sizeConfig.max;
        });
      })
      .slice(0, 4);
  };

  const results = step === "results" ? getResults() : [];

  const reset = () => {
    setStep(1);
    setIndustry("");
    setDisplayType("");
    setSizeRangeId("");
  };

  const stepLabel = step === "results" ? "" : ["", "Your Industry", "Display Type", "Screen Size"][step as number];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            Product Finder
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Not Sure Which Display to Choose?
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Answer 3 quick questions and we&apos;ll match the right Samsung display to your needs.
          </p>
        </div>

        {/* Progress bar */}
        {step !== "results" && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300"
                  style={{
                    backgroundColor:
                      s < (step as number) ? "#2563eb" :
                      s === (step as number) ? "#2563eb" : "#f3f4f6",
                    color:
                      s <= (step as number) ? "#fff" : "#9ca3af",
                    boxShadow:
                      s === (step as number) ? "0 0 0 4px rgba(37,99,235,0.15)" : "none",
                  }}
                >
                  {s < (step as number) ? <CheckCircle2 size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className="w-16 h-0.5 rounded-full transition-all duration-300"
                    style={{ backgroundColor: s < (step as number) ? "#2563eb" : "#e5e7eb" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step question label */}
        {step !== "results" && (
          <p className="text-center text-lg font-semibold text-gray-800 mb-6">
            Step {step as number} of 3 — {stepLabel}
          </p>
        )}

        {/* ── Step 1: Industry ── */}
        {step === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map(({ id, label, sub, Icon }) => (
              <button
                key={id}
                onClick={() => { setIndustry(id); setStep(2); }}
                className="group p-6 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Icon size={28} className="mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div className="font-bold text-gray-900 text-sm">{label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{sub}</div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Display Type ── */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DISPLAY_TYPES.map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  onClick={() => { setDisplayType(id); setStep(3); }}
                  className="group p-6 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <Icon size={28} className="mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className="font-bold text-gray-900 text-sm">{label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto">
              ← Back
            </button>
          </>
        )}

        {/* ── Step 3: Size ── */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SIZE_RANGES.map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => { setSizeRangeId(id); setStep("results"); }}
                  className="group p-6 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="text-2xl font-black text-gray-200 group-hover:text-blue-100 mb-2 transition-colors">
                    {id === "small" ? "S" : id === "medium" ? "M" : id === "large" ? "L" : "XL"}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto">
              ← Back
            </button>
          </>
        )}

        {/* ── Results ── */}
        {step === "results" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-gray-800">
                {results.length > 0
                  ? `${results.length} product${results.length > 1 ? "s" : ""} matched for you`
                  : "No exact matches found"}
              </p>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <RotateCcw size={14} /> Start Over
              </button>
            </div>

            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      <div className="h-36 bg-gray-50 relative">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain p-4"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor size={40} className="text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 leading-snug">
                          {product.name}
                        </p>
                        <p className="text-blue-600 text-xs font-medium mb-3">
                          {product.series} Series
                        </p>
                        <div className="mt-auto flex items-center gap-2">
                          <Link
                            href="/contact"
                            className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                          >
                            Get Quote
                          </Link>
                          <Link
                            href={`/products/${product.id}`}
                            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg hover:border-blue-300 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href={`/products?category=${encodeURIComponent(displayType)}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                  >
                    View all {displayType} products <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 mb-5">
                  No products matched your exact criteria — try a different size or browse the full catalog.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <RotateCcw size={14} /> Try Again
                  </button>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Browse All Products <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
