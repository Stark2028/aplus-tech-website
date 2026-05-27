"use client";

import { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { computeSearchResults, type SearchResult } from "@/lib/searchResults";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import SearchResultsList from "@/components/search/SearchResultsList";
import SearchEmptyContent from "@/components/search/SearchEmptyContent";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { recent, add, clear } = useRecentSearches();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const openSearch = useCallback(() => {
    setQuery("");
    setActiveIndex(-1);
    setOpen(true);
  }, []);

  // Open via keyboard shortcut or custom event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) {
            setQuery("");
            setActiveIndex(-1);
          }
          return !v;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("aplus:search:open", openSearch);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("aplus:search:open", openSearch);
    };
  }, [openSearch]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on outside click — document-level mousedown so it works regardless of DOM nesting / stacking contexts
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => computeSearchResults(deferredQuery), [deferredQuery]);

  // Keyboard navigation within search results
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        const result = results[activeIndex];
        if (result) {
          add(query);
          trackEvent("search", { search_term: query, result_type: result.type });
          router.push(result.href);
          close();
        }
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIndex, query, add, close, router]);

  const handleSelect = (result: SearchResult) => {
    add(query || result.title);
    trackEvent("search", { search_term: query, result_type: result.type });
    close();
  };

  return (
    <>
      <button
        onClick={openSearch}
        className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition-all w-44 group"
        aria-label="Open search (Ctrl+K)"
      >
        <Search size={14} className="shrink-0" />
        <span className="flex-1 text-left text-gray-400 text-[13px]">Search…</span>
        <kbd className="flex items-center gap-0.5 text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 font-mono text-gray-400 leading-none">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          >
            {/* Dark background overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  placeholder="Search products, categories, guides…"
                  className="flex-1 text-gray-900 placeholder-gray-400 text-[15px] outline-none bg-transparent"
                  aria-label="Search"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                ) : null}
                <button
                  onClick={close}
                  className="sm:hidden text-sm font-semibold text-blue-600 active:text-blue-700 px-1 py-0.5 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <kbd className="hidden sm:flex text-[11px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[58vh] overflow-y-auto overscroll-contain">
                {query ? (
                  <SearchResultsList
                    results={results}
                    activeIndex={activeIndex}
                    query={query}
                    onSelect={handleSelect}
                  />
                ) : (
                  <SearchEmptyContent
                    recent={recent}
                    onClearRecent={clear}
                    onPickRecent={(term) => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    onLinkClick={close}
                  />
                )}
              </div>

              <div className="hidden sm:flex px-4 py-2.5 border-t border-gray-100 items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↵</kbd>
                  open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">esc</kbd>
                  close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
