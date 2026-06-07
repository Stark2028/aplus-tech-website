"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Product, products } from "@/data/products";

const MAX_COMPARE = 3;

/**
 * Sanitise a persisted compare list: keep only well-formed entries whose product
 * id still exists in the current catalog, dedupe by id, and cap at MAX_COMPARE.
 * Guards against stale/oversized/malformed localStorage breaking the compare table.
 */
function sanitizeCompareList(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  const validIds = new Set(products.map((p) => p.id));
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const id = (item as { id?: unknown }).id;
    if (typeof id !== "string" || !validIds.has(id) || seen.has(id)) continue;
    // Re-hydrate from the canonical product to avoid stale shapes from old data.
    const canonical = products.find((p) => p.id === id);
    if (!canonical) continue;
    seen.add(id);
    out.push(canonical);
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
        if (saved) {
            try {
                const cleaned = sanitizeCompareList(JSON.parse(saved));
                // eslint-disable-next-line react-hooks/set-state-in-effect
                if (cleaned.length > 0) setSelectedProducts(cleaned);
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
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
