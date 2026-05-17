"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/products";

interface ComparisonContextType {
    selectedProducts: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    // Hydrate from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("b2b_compare_list");
        if (saved) {
            try {
                setSelectedProducts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("b2b_compare_list", JSON.stringify(selectedProducts));
    }, [selectedProducts]);

    const addToCompare = (product: Product) => {
        if (selectedProducts.length >= 3) {
            alert("You can compare up to 3 products at a time.");
            return;
        }
        if (!isInCompare(product.id)) {
            setSelectedProducts((prev) => [...prev, product]);
        }
    };

    const removeFromCompare = (productId: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const clearCompare = () => setSelectedProducts([]);

    const isInCompare = (productId: string) => {
        return selectedProducts.some((p) => p.id === productId);
    };

    return (
        <ComparisonContext.Provider
            value={{
                selectedProducts,
                addToCompare,
                removeFromCompare,
                clearCompare,
                isInCompare,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error("useComparison must be used within a ComparisonProvider");
    }
    return context;
}
