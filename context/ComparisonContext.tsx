"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/data/products";

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
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedProducts(JSON.parse(saved));
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
                if (prev.length >= 3) {
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
