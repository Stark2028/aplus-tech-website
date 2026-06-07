"use client";

import { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
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

  // Focus input when opened — try immediately and with a small delay for mobile browsers
  useEffect(() => {
    if (open) {
      // Try immediately (works on desktop)
      inputRef.current?.focus();
      // Also schedule retries for mobile browsers that need a tick after mount
      const t1 = setTimeout(() => inputRef.current?.focus(), 50);
      const t2 = setTimeout(() => inputRef.current?.focus(), 150);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [open]);

  // Close on outside click/tap — handles both mouse and touch events
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : (e.target as Node);
      if (modalRef.current && target && !modalRef.current.contains(target as Node)) {
        close();
      }
    };

    let active = true;
    const registerListeners = () => {
      if (!active) return;
      document.addEventListener("mousedown", handler as EventListener);
      document.addEventListener("touchstart", handler as EventListener, { passive: true });
    };

    // Defer registration to the next tick to prevent the opening click from immediately closing the modal
    const timer = setTimeout(registerListeners, 0);

    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler as EventListener);
      document.removeEventListener("touchstart", handler as EventListener);
    };
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
      } else if (e.key === "Tab" && modalRef.current) {
        // Focus trap: keep Tab / Shift+Tab cycling inside the modal.
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-150">
            {/* Dark background overlay — tappable so users can dismiss by tapping outside on mobile */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
              onClick={close}
              onTouchEnd={(e) => { e.preventDefault(); close(); }}
            />

            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site search"
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  // autoFocus triggers the mobile keyboard reliably when the modal mounts
                  autoFocus
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
            </div>
        </div>
      )}
    </>
  );
}
