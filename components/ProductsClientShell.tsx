"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";

// ── helpers ──────────────────────────────────────────────────────────────────

function parseBrightnessNit(brightness: string): number {
  const cleaned = brightness.replace(/,/g, "");
  const nums = cleaned.match(/\d+/g);
  if (!nums) return 0;
  if (nums.length === 1) return parseInt(nums[0]);
  // range like "250–300 nit" → midpoint
  return Math.round((parseInt(nums[0]) + parseInt(nums[nums.length - 1])) / 2);
}

function parseMaxSize(screenSizes: string[]): number {
  const nums = screenSizes.flatMap((s) => {
    const n = parseInt(s);
    return isNaN(n) ? [] : [n];
  });
  return nums.length ? Math.max(...nums) : 0;
}

const RESOLUTION_OPTIONS = [
  { label: "4K UHD", match: (r: string) => r.includes("4K") || r.includes("3,840") },
  { label: "Full HD", match: (r: string) => r.includes("FHD") || r.includes("1,920") || r.includes("Full HD") },
  { label: "Custom / LED", match: (r: string) => r.includes("Custom") },
];

const BRIGHTNESS_BANDS = [
  { label: "Under 350 nit", min: 0, max: 349 },
  { label: "350–500 nit", min: 350, max: 500 },
  { label: "500–700 nit", min: 501, max: 700 },
  { label: "700 nit +", min: 701, max: Infinity },
];

const OPERATION_OPTIONS = ["16/7", "24/7"];

// ── types ─────────────────────────────────────────────────────────────────────

interface Filters {
  category: string | null;
  brightness: string | null;
  resolution: string | null;
  operation: string | null;
  minSize: number;
}

const DEFAULT_FILTERS: Filters = {
  category: null,
  brightness: null,
  resolution: null,
  operation: null,
  minSize: 0,
};

// ── sub-components ────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  products: Product[];
  productCategories: ProductCategory[];
}

export default function ProductsClientShell({ products, productCategories }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const activeCount = Object.values(filters).filter(
    (v) => v !== null && v !== 0
  ).length;

  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;

      if (filters.resolution) {
        const opt = RESOLUTION_OPTIONS.find((o) => o.label === filters.resolution);
        if (opt && !opt.match(p.specs.resolution)) return false;
      }

      if (filters.brightness) {
        const band = BRIGHTNESS_BANDS.find((b) => b.label === filters.brightness);
        if (band) {
          const nit = parseBrightnessNit(p.specs.brightness);
          if (nit < band.min || nit > band.max) return false;
        }
      }

      if (filters.operation && p.specs.operationTime !== filters.operation) {
        // allow partial match (e.g., some have combined values)
        if (!p.specs.operationTime.includes(filters.operation)) return false;
      }

      if (filters.minSize > 0) {
        const max = parseMaxSize(p.specs.screenSizes);
        if (max < filters.minSize && max !== 0) return false;
      }

      return true;
    });
  }, [products, filters]);

  const grouped = useMemo(() => {
    return productCategories
      .map((cat) => ({
        category: cat,
        items: filtered.filter((p) => p.category === cat.name),
      }))
      .filter((g) => g.items.length > 0);
  }, [productCategories, filtered]);

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
          {/* Toggle button (mobile) */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
              activeCount > 0
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={13}
              className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Active filter pills (always visible) */}
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.category && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  {filters.category}
                  <button onClick={() => setFilters((f) => ({ ...f, category: null }))}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {filters.resolution && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  {filters.resolution}
                  <button onClick={() => setFilters((f) => ({ ...f, resolution: null }))}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {filters.brightness && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  {filters.brightness}
                  <button onClick={() => setFilters((f) => ({ ...f, brightness: null }))}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {filters.operation && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  {filters.operation} operation
                  <button onClick={() => setFilters((f) => ({ ...f, operation: null }))}>
                    <X size={11} />
                  </button>
                </span>
              )}
              {filters.minSize > 0 && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  ≥{filters.minSize}&quot; screens
                  <button onClick={() => setFilters((f) => ({ ...f, minSize: 0 }))}>
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors px-1"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="ml-auto text-xs text-gray-400 font-medium shrink-0">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="border-t border-gray-100 bg-gray-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap gap-8">
              <FilterGroup title="Category">
                {productCategories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    active={filters.category === cat.name}
                    onClick={() => toggle("category", cat.name)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Resolution">
                {RESOLUTION_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.label}
                    label={opt.label}
                    active={filters.resolution === opt.label}
                    onClick={() => toggle("resolution", opt.label)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Brightness">
                {BRIGHTNESS_BANDS.map((band) => (
                  <FilterChip
                    key={band.label}
                    label={band.label}
                    active={filters.brightness === band.label}
                    onClick={() => toggle("brightness", band.label)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Operation Hours">
                {OPERATION_OPTIONS.map((op) => (
                  <FilterChip
                    key={op}
                    label={`${op} rated`}
                    active={filters.operation === op}
                    onClick={() => toggle("operation", op)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Min Screen Size">
                {[32, 43, 55, 75].map((sz) => (
                  <FilterChip
                    key={sz}
                    label={`${sz}" +`}
                    active={filters.minSize === sz}
                    onClick={() =>
                      setFilters((f) => ({ ...f, minSize: f.minSize === sz ? 0 : sz }))
                    }
                  />
                ))}
              </FilterGroup>
            </div>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {grouped.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-bold text-gray-900 mb-3">No products match your filters</p>
            <p className="text-gray-500 mb-6">Try removing one or more filters to see more results.</p>
            <button
              onClick={clearAll}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          grouped.map(({ category, items }) => (
            <section key={category.id} id={category.id} className="scroll-mt-40">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{category.name}</h2>
                  <p className="text-sm text-gray-500 mb-3">{category.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.useCases.map((uc) => (
                      <span
                        key={uc}
                        className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={`/categories/${category.id}`}
                  className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-1"
                >
                  View all →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
