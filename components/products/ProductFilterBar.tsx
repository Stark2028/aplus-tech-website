"use client";

import { useEffect, useRef } from "react";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
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
      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
        active
          ? "bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-900/10"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
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
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full font-bold shadow-sm">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors bg-white rounded-full p-0.5 shadow-sm ml-0.5">
        <X size={12} strokeWidth={3} />
      </button>
    </span>
  );
}

interface Props {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeCount: number;
  resultCount: number;
  onClearAll: () => void;
}

export default function ProductFilterBar({
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filtersOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFiltersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen, setFiltersOpen]);

  return (
    <div ref={containerRef} className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${
            activeCount > 0 || filtersOpen
              ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="bg-white text-slate-900 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={13}
            className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
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
              className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors px-2 underline decoration-transparent hover:decoration-red-500 underline-offset-4"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="ml-auto text-xs text-slate-500 font-bold shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          {resultCount} product{resultCount !== 1 ? "s" : ""}
        </div>
      </div>

      {filtersOpen && (
        <div className="border-t border-gray-100 bg-slate-50/50 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap gap-x-12 gap-y-8">


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
