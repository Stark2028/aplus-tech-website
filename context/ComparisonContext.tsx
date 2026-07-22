"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import type { ProductSummary } from "@/data/productIndex";

const MAX_COMPARE = 3;

/**
 * Sanitise a persisted compare list: keep only well-formed entries whose product
 * id still exists in the current catalog, dedupe by id, and cap at MAX_COMPARE.
 * Guards against stale/oversized/malformed localStorage breaking the compare table.
 *
 * Validates against `productIndex` (a light id/name/image projection) rather
 * than value-importing the whole catalog. The index is passed in — the caller
 * loads it with a dynamic import so data/products.ts stays OUT of every route's
 * first-load JS (this provider is mounted globally). The stored objects are
 * full Products (state is Product[] and callers pass full products), so we keep
 * the persisted shape for the heavy fields the /compare table reads and only
 * refresh the light name/images from the canonical index.
 */
function sanitizeCompareList(
  raw: unknown,
  index: Record<string, ProductSummary>
): Product[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const id = (item as { id?: unknown }).id;
    if (typeof id !== "string" || seen.has(id)) continue;
    const summary = index[id];
    if (!summary) continue; // id no longer in the catalog — drop it
    seen.add(id);
    out.push({ ...(item as Product), name: summary.name, images: summary.images });
    if (out.length >= MAX_COMPARE) break;
  }
  return out;
}

interface ComparisonContextType {
    selectedProducts: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
    limitReached: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [limitReached, setLimitReached] = useState(false);
    const limitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("b2b_compare_list");
        // Nothing persisted (or an empty list) ⇒ never pull the catalog chunk.
        if (!saved || saved === "[]") return;
        let cancelled = false;
        (async () => {
            try {
                const parsed = JSON.parse(saved);
                // Dynamic import so data/products.ts (pulled in transitively by
                // productIndex) is a lazy chunk, not part of any route's
                // first-load JS. It loads only for a returning visitor who has a
                // saved compare list, after mount and off the LCP critical path.
                const { productIndex } = await import("@/data/productIndex");
                if (cancelled) return;
                const cleaned = sanitizeCompareList(parsed, productIndex);
                // Functional update: child effects run before this provider
                // effect, so /compare?ids=… may have already loaded a shared
                // list — a direct set here would clobber it with the persisted
                // one. Restore from storage only when nothing was added yet.
                if (cleaned.length > 0) {
                    // No eslint-disable needed here: the setState runs inside an
                    // async callback, not synchronously in the effect body.
                    setSelectedProducts((prev) => (prev.length > 0 ? prev : cleaned));
                }
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("b2b_compare_list", JSON.stringify(selectedProducts));
    }, [selectedProducts]);

    const isInCompare = useCallback(
        (productId: string) => selectedProducts.some((p) => p.id === productId),
        [selectedProducts]
    );

    const addToCompare = useCallback(
        (product: Product) => {
            setSelectedProducts((prev) => {
                if (prev.length >= MAX_COMPARE) {
                    setLimitReached(true);
                    if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
                    limitTimerRef.current = setTimeout(() => setLimitReached(false), 2500);
                    return prev;
                }
                if (prev.some((p) => p.id === product.id)) return prev;
                return [...prev, product];
            });
        },
        []
    );

    const removeFromCompare = useCallback((productId: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    }, []);

    const clearCompare = useCallback(() => setSelectedProducts([]), []);

    const value = useMemo<ComparisonContextType>(
        () => ({
            selectedProducts,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            limitReached,
        }),
        [selectedProducts, addToCompare, removeFromCompare, clearCompare, isInCompare, limitReached]
    );

    return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }
    return context;
}
