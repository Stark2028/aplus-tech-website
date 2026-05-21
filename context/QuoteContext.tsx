"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/data/products";

export interface QuoteItem {
    product: Product;
    quantity: number;
}

interface QuoteContextType {
    quoteItems: QuoteItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearQuote: () => void;
    isQuoteOpen: boolean;
    toggleQuote: () => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);

    useEffect(() => {
        const savedQuote = localStorage.getItem("b2b_quote_cart");
        if (savedQuote) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setQuoteItems(JSON.parse(savedQuote));
            } catch (e) {
                console.error("Failed to parse quote cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("b2b_quote_cart", JSON.stringify(quoteItems));
    }, [quoteItems]);

    const addItem = useCallback((product: Product, quantity = 1) => {
        setQuoteItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
        setIsQuoteOpen(true);
    }, []);

    const removeItem = useCallback((productId: string) => {
        setQuoteItems((prev) => prev.filter((item) => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity < 1) return;
        setQuoteItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearQuote = useCallback(() => {
        setQuoteItems([]);
    }, []);

    const toggleQuote = useCallback(() => setIsQuoteOpen((prev) => !prev), []);

    const value = useMemo<QuoteContextType>(
        () => ({
            quoteItems,
            addItem,
            removeItem,
            updateQuantity,
            clearQuote,
            isQuoteOpen,
            toggleQuote,
        }),
        [quoteItems, isQuoteOpen, addItem, removeItem, updateQuantity, clearQuote, toggleQuote]
    );

    return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
    const context = useContext(QuoteContext);
    if (context === undefined) {
        throw new Error("useQuote must be used within a QuoteProvider");
    }
    return context;
}
