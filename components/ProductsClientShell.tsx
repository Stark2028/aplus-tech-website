"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilterBar from "@/components/products/ProductFilterBar";
import type { Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import {
  DEFAULT_FILTERS,
  applyFilters,
  countActive,
  type Filters,
} from "@/lib/productFilters";

interface Props {
  products: Product[];
  productCategories: ProductCategory[];
}

export default function ProductsClientShell({ products, productCategories }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = countActive(filters);
  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);

  const grouped = useMemo(() => {
    return productCategories
      .map((cat) => ({
        category: cat,
        items: filtered.filter((p) => p.category === cat.name).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
      }))
      .filter((g) => g.items.length > 0);
  }, [productCategories, filtered]);

  return (
    <>
      <ProductFilterBar
        filters={filters}
        setFilters={setFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        activeCount={activeCount}
        resultCount={filtered.length}
        onClearAll={clearAll}
      />

      {/* Live region: announces result count changes to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeCount > 0
          ? `${filtered.length} product${filtered.length !== 1 ? "s" : ""} match your filters`
          : ""}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {grouped.length === 0 ? (
          <div role="status" className="text-center py-24">
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
            <section
              key={category.id}
              id={category.id}
              aria-label={`${category.name}, ${items.length} product${items.length !== 1 ? "s" : ""}`}
              className="scroll-mt-40"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{category.name}</h2>
                </div>
                <a
                  href={`/categories/${category.id}`}
                  aria-label={`View all ${category.name}`}
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
