"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

    // Hydrate from localStorage on mount
    useEffect(() => {
        const savedQuote = localStorage.getItem("b2b_quote_cart");
        if (savedQuote) {
            try {
                setQuoteItems(JSON.parse(savedQuote));
            } catch (e) {
                console.error("Failed to parse quote cart", e);
            }
        }
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("b2b_quote_cart", JSON.stringify(quoteItems));
    }, [quoteItems]);

    const addItem = (product: Product, quantity = 1) => {
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
        setIsQuoteOpen(true); // Auto-open cart on add
    };

    const removeItem = (productId: string) => {
        setQuoteItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setQuoteItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearQuote = () => {
        setQuoteItems([]);
    };

    const toggleQuote = () => setIsQuoteOpen((prev) => !prev);

    return (
        <QuoteContext.Provider
            value={{
                quoteItems,
                addItem,
                removeItem,
                updateQuantity,
                clearQuote,
                isQuoteOpen,
                toggleQuote,
            }}
        >
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuote() {
    const context = useContext(QuoteContext);
    if (context === undefined) {
        throw new Error("useQuote must be used within a QuoteProvider");
    }
    return context;
}
