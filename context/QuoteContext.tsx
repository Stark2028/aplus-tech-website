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
    limitReached: boolean;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// Cap distinct line items so a quote can never grow an unbounded payload. The
// contact API rejects bodies whose serialized fields exceed 5000 chars (~45
// items); 30 stays comfortably under that while exceeding any realistic B2B
// cart. Adding more quantity to an existing item is always allowed.
const MAX_QUOTE_ITEMS = 30;

/** Runtime shape guard — ensures localStorage data matches QuoteItem[] before use. */
function isValidQuoteItems(data: unknown): data is QuoteItem[] {
    return (
        Array.isArray(data) &&
        data.every(
            (item) =>
                item !== null &&
                typeof item === "object" &&
                typeof (item as QuoteItem).product?.id === "string" &&
                typeof (item as QuoteItem).quantity === "number"
        )
    );
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const limitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const savedQuote = localStorage.getItem("b2b_quote_cart");
        if (savedQuote) {
            try {
                const parsed: unknown = JSON.parse(savedQuote);
                // Defence-in-depth: validate shape before trusting localStorage data.
                if (isValidQuoteItems(parsed)) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setQuoteItems(parsed);
                } else {
                    localStorage.removeItem("b2b_quote_cart");
                }
            } catch (e) {
                console.error("Failed to parse quote cart", e);
                localStorage.removeItem("b2b_quote_cart");
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
            // Adding a new distinct product would exceed the cap: flash a notice
            // and leave the cart unchanged rather than building an oversized
            // payload the contact API would later reject with an opaque error.
            if (prev.length >= MAX_QUOTE_ITEMS) {
                setLimitReached(true);
                if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
                limitTimerRef.current = setTimeout(() => setLimitReached(false), 2500);
                return prev;
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
            limitReached,
        }),
        [quoteItems, isQuoteOpen, addItem, removeItem, updateQuantity, clearQuote, toggleQuote, limitReached]
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
