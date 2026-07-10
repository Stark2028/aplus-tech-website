"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  RotateCcw,
  Monitor,
  LayoutGrid,
  MousePointerClick,
  Tv,
  Cpu,
  Building2,
  GraduationCap,
  Store,
  Hotel,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Check,
} from "lucide-react";
import { products, Product } from "@/data/products";
import { useQuote } from "@/context/QuoteContext";
import { trackEvent } from "@/lib/analytics";
import {
  DISPLAY_TYPES as DISPLAY_TYPE_DATA,
  SIZE_RANGES,
  INDUSTRY_CATEGORY_SCORE,
  availableSizeRangeIds,
  categoryEnabledForIndustry,
  finderCategoryHref,
  sizeInRange,
} from "@/components/finderConfig";

type Step = 1 | 2 | 3 | "results";

type IndustryId = "hospitality" | "corporate" | "education" | "retail" | "any";

const INDUSTRIES: { id: IndustryId; label: string; sub: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "hospitality", label: "Hospitality", sub: "Hotels & Resorts", Icon: Hotel },
  { id: "corporate", label: "Corporate", sub: "Offices & Boardrooms", Icon: Building2 },
  { id: "education", label: "Education", sub: "Schools & Universities", Icon: GraduationCap },
  { id: "retail", label: "Retail", sub: "Stores & Malls", Icon: Store },
];

// Re-attach icons to the shared, test-covered display-type data (keyed by the
// category name in DISPLAY_TYPE_DATA[].id). SIZE_RANGES + the URL/size helpers
// live in finderConfig.ts so their logic is unit-testable.
const DISPLAY_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "Digital Signage": Monitor,
  "Video Wall": LayoutGrid,
  "Interactive Display": MousePointerClick,
  "Commercial TV": Tv,
  "LED Signage": Cpu,
};
const DISPLAY_TYPES = DISPLAY_TYPE_DATA.map((d) => ({ ...d, Icon: DISPLAY_TYPE_ICONS[d.id] }));

type ScoredProduct = { product: Product; score: number; sizeFit: "exact" | "near" | "any" };

export default function ProductFinderSection() {
  const [step, setStep] = useState<Step>(1);
  const [industry, setIndustry] = useState<IndustryId | "">("");
  const [displayType, setDisplayType] = useState("");
  const [sizeRangeId, setSizeRangeId] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useQuote();

  const sizeConfig = SIZE_RANGES.find((s) => s.id === sizeRangeId);
  const availableSizes = step === 3 ? availableSizeRangeIds(displayType) : null;

  const { primary, fallbackKind, fallbackProducts } = useMemo(() => {
    if (step !== "results") {
      return { primary: [] as ScoredProduct[], fallbackKind: "none" as const, fallbackProducts: [] as ScoredProduct[] };
    }

    const scoreFor = (p: Product) =>
      industry && industry !== "any"
        ? INDUSTRY_CATEGORY_SCORE[industry][p.category] ?? 0
        : 0;

    const inSize = (p: Product) => {
      if (!sizeConfig) return true;
      return p.specs.screenSizes.some((s) => sizeInRange(parseInt(s), sizeConfig));
    };

    // Primary: must match category exactly; size matters if chosen.
    const exact = products
      .filter((p) => p.category === displayType && inSize(p))
      .map<ScoredProduct>((p) => ({ product: p, score: scoreFor(p), sizeFit: sizeConfig ? "exact" : "any" }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (exact.length > 0) {
      return { primary: exact, fallbackKind: "none" as const, fallbackProducts: [] as ScoredProduct[] };
    }

    // Fallback 1: same category, ignore size — "different size, same type"
    const sameCategoryDifferentSize = products
      .filter((p) => p.category === displayType)
      .map<ScoredProduct>((p) => ({ product: p, score: scoreFor(p), sizeFit: "near" }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (sameCategoryDifferentSize.length > 0) {
      return {
        primary: [] as ScoredProduct[],
        fallbackKind: "size" as const,
        fallbackProducts: sameCategoryDifferentSize,
      };
    }

    // Fallback 2: industry-recommended alternatives (different category)
    if (industry && industry !== "any") {
      const ranked = products
        .filter((p) => (INDUSTRY_CATEGORY_SCORE[industry][p.category] ?? 0) > 0)
        .map<ScoredProduct>((p) => ({ product: p, score: scoreFor(p), sizeFit: "any" }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      if (ranked.length > 0) {
        return {
          primary: [] as ScoredProduct[],
          fallbackKind: "industry" as const,
          fallbackProducts: ranked,
        };
      }
    }

    return { primary: [] as ScoredProduct[], fallbackKind: "none" as const, fallbackProducts: [] as ScoredProduct[] };
  }, [step, industry, displayType, sizeConfig]);

  const handleAddToQuote = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId((prev) => (prev === product.id ? null : prev)), 1800);
    trackEvent("add_to_quote", {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      source: "product_finder",
    });
  };

  const reset = () => {
    setStep(1);
    setIndustry("");
    setDisplayType("");
    setSizeRangeId("");
  };

  const goToResults = () => {
    setStep("results");
    trackEvent("product_finder_complete", {
      industry: industry || "any",
      display_type: displayType,
      size_range: sizeRangeId || "any",
    });
  };

  const stepLabel = step === "results" ? "" : ["", "Your Industry", "Display Type", "Screen Size"][step as number];

  const industryLabel = industry && industry !== "any"
    ? INDUSTRIES.find((i) => i.id === industry)?.label
    : null;

  const renderProductCard = (sp: ScoredProduct) => {
    const { product, score } = sp;
    const isAdded = addedId === product.id;
    const isRecommended = industryLabel && score >= 2;

    return (
      <div
        key={product.id}
        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
      >
        {isRecommended && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow">
            <Sparkles size={10} aria-hidden="true" />
            Recommended for {industryLabel}
          </div>
        )}
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
            <button
              type="button"
              onClick={(e) => handleAddToQuote(e, product)}
              disabled={isAdded}
              aria-label={`Add to Quote — ${product.name}`}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${
                isAdded
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={13} aria-hidden="true" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={13} aria-hidden="true" /> Get Quote
                </>
              )}
            </button>
            <Link
              href={`/products/${product.id}`}
              aria-label={`View ${product.name}`}
              className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-lg hover:border-blue-300 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    );
  };

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
                  aria-current={s === (step as number) ? "step" : undefined}
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

        {/* Step 1: Industry */}
        {step === 1 && (
          <>
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
            <button
              onClick={() => { setIndustry("any"); setStep(2); }}
              className="mt-5 text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2 transition-colors block mx-auto"
            >
              Skip — no specific industry
            </button>
          </>
        )}

        {/* Step 2: Display Type */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {DISPLAY_TYPES.map(({ id, label, sub, Icon }) => {
                const enabled = categoryEnabledForIndustry(id, industry);
                return (
                  <button
                    key={id}
                    onClick={() => { setDisplayType(id); setStep(3); }}
                    disabled={!enabled}
                    aria-disabled={!enabled}
                    className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                      enabled
                        ? "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <Icon
                      size={28}
                      className={`mb-3 transition-colors ${
                        enabled ? "text-gray-400 group-hover:text-blue-500" : "text-gray-300"
                      }`}
                    />
                    <div className={`font-bold text-sm ${enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {enabled ? sub : `Not typical for ${industryLabel ?? "your industry"}`}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(1)} className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto">
              ← Back
            </button>
          </>
        )}

        {/* Step 3: Size */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SIZE_RANGES.map(({ id, label, sub }) => {
                const enabled = availableSizes?.has(id) ?? true;
                return (
                  <button
                    key={id}
                    onClick={() => { setSizeRangeId(id); goToResults(); }}
                    disabled={!enabled}
                    aria-disabled={!enabled}
                    className={`group p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                      enabled
                        ? "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`text-2xl font-black mb-2 transition-colors ${
                        enabled ? "text-gray-200 group-hover:text-blue-100" : "text-gray-100"
                      }`}
                    >
                      {id === "small" ? "S" : id === "medium" ? "M" : id === "large" ? "L" : "XL"}
                    </div>
                    <div className={`font-bold text-sm ${enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {enabled ? sub : `Not available in ${displayType}`}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={() => { setSizeRangeId(""); goToResults(); }}
                className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2 transition-colors"
              >
                Skip — show all sizes
              </button>
              <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Back
              </button>
            </div>
          </>
        )}

        {/* Results */}
        {step === "results" && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="font-semibold text-gray-800">
                  {primary.length > 0
                    ? `${primary.length} product${primary.length > 1 ? "s" : ""} matched for you`
                    : fallbackProducts.length > 0
                      ? "No exact matches — here are close alternatives"
                      : "No matches found"}
                </p>
                {industryLabel && (primary.length > 0 || fallbackProducts.length > 0) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ranked for <span className="font-medium text-gray-700">{industryLabel}</span>
                    {sizeConfig && <> · {sizeConfig.sub}</>}
                  </p>
                )}
              </div>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <RotateCcw size={14} /> Start Over
              </button>
            </div>

            {primary.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {primary.map(renderProductCard)}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href={finderCategoryHref(displayType)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                  >
                    View all {displayType} products <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}

            {primary.length === 0 && fallbackProducts.length > 0 && (
              <>
                <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
                  {fallbackKind === "size" && sizeConfig && (
                    <>
                      We couldn&apos;t find <span className="font-semibold">{displayType}</span> in the {sizeConfig.sub} range —
                      showing other sizes in the same category instead.
                    </>
                  )}
                  {fallbackKind === "industry" && industryLabel && (
                    <>
                      No <span className="font-semibold">{displayType}</span> matches — here are displays we recommend
                      for <span className="font-semibold">{industryLabel}</span>.
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fallbackProducts.map(renderProductCard)}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                  >
                    Browse the full catalog <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}

            {primary.length === 0 && fallbackProducts.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 mb-5">
                  We couldn&apos;t find anything matching your criteria — try a different combination or browse the full catalog.
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
