"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ProductCategory } from "@/data/categories";
import {
  BRIGHTNESS_BANDS,
  MIN_SIZE_OPTIONS,
  OPERATION_OPTIONS,
  RESOLUTION_OPTIONS,
  type Filters,
} from "@/lib/productFilters";

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

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
      {label}
      <button onClick={onRemove}>
        <X size={11} />
      </button>
    </span>
  );
}

interface Props {
  productCategories: ProductCategory[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeCount: number;
  resultCount: number;
  onClearAll: () => void;
}

export default function ProductFilterBar({
  productCategories,
  filters,
  setFilters,
  filtersOpen,
  setFiltersOpen,
  activeCount,
  resultCount,
  onClearAll,
}: Props) {
  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
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

        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.category && (
              <ActivePill
                label={filters.category}
                onRemove={() => setFilters((f) => ({ ...f, category: null }))}
              />
            )}
            {filters.resolution && (
              <ActivePill
                label={filters.resolution}
                onRemove={() => setFilters((f) => ({ ...f, resolution: null }))}
              />
            )}
            {filters.brightness && (
              <ActivePill
                label={filters.brightness}
                onRemove={() => setFilters((f) => ({ ...f, brightness: null }))}
              />
            )}
            {filters.operation && (
              <ActivePill
                label={`${filters.operation} operation`}
                onRemove={() => setFilters((f) => ({ ...f, operation: null }))}
              />
            )}
            {filters.minSize > 0 && (
              <ActivePill
                label={`≥${filters.minSize}" screens`}
                onRemove={() => setFilters((f) => ({ ...f, minSize: 0 }))}
              />
            )}
            <button
              onClick={onClearAll}
              className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors px-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="ml-auto text-xs text-gray-400 font-medium shrink-0">
          {resultCount} product{resultCount !== 1 ? "s" : ""}
        </div>
      </div>

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
              {MIN_SIZE_OPTIONS.map((sz) => (
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
  );
}
