"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Package, FileText, ArrowRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogs";
import { trackEvent } from "@/lib/analytics";

const MAX_RECENT = 5;

interface SearchResult {
  type: "product" | "blog";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aplus_searches");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, MAX_RECENT);
      try { localStorage.setItem("aplus_searches", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem("aplus_searches"); } catch {}
  }, []);

  return { recent, add, clear };
}

const QUICK_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Video Walls", href: "/categories/video-wall" },
  { label: "Smart Signage", href: "/categories/digital-signage" },
  { label: "Hospitality TVs", href: "/categories/hospitality-tv" },
  { label: "Request a Quote", href: "/quote" },
];

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { recent, add, clear } = useRecentSearches();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  // Keyboard shortcut + custom event from mobile trigger
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("aplus:search:open", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("aplus:search:open", onEvent);
    };
  }, []);

  // Auto-focus when opening
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  // Search results
  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const productResults: SearchResult[] = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((p) => ({
        type: "product",
        id: p.id,
        title: p.name,
        subtitle: `${p.category} · ${p.specs.screenSizes.join(", ")}"`,
        href: `/products/${p.id}`,
      }));

    const blogResults: SearchResult[] = blogPosts
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((b) => ({
        type: "blog",
        id: b.slug,
        title: b.title,
        subtitle: b.excerpt.slice(0, 90) + "…",
        href: `/blogs/${b.slug}`,
      }));

    return [...productResults, ...blogResults];
  }, [query]);

  // Arrow-key + Enter navigation
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

  const productResults = results.filter((r) => r.type === "product");
  const blogResults = results.filter((r) => r.type === "blog");

  return (
    <>
      {/* Desktop trigger — pill search bar */}
      <button
        onClick={() => setOpen(true)}
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
            onClick={close}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input row */}
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
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                ) : null}
                <kbd className="hidden sm:flex text-[11px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-400">
                  ESC
                </kbd>
              </div>

              {/* Body */}
              <div className="max-h-[58vh] overflow-y-auto overscroll-contain">

                {/* No results */}
                {query && results.length === 0 && (
                  <div className="py-14 text-center text-gray-400">
                    <Search size={28} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium text-gray-500">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs mt-1 text-gray-400">Try &quot;video wall&quot;, &quot;hotel TV&quot;, or &quot;4K&quot;</p>
                  </div>
                )}

                {/* Product results */}
                {productResults.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Products
                      </span>
                    </div>
                    {productResults.map((result) => {
                      const idx = results.indexOf(result);
                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={() => handleSelect(result)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            activeIndex === idx ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                          </div>
                          <ArrowRight size={13} className="text-gray-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Blog results */}
                {blogResults.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Guides &amp; Articles
                      </span>
                    </div>
                    {blogResults.map((result) => {
                      const idx = results.indexOf(result);
                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={() => handleSelect(result)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            activeIndex === idx ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                          </div>
                          <ArrowRight size={13} className="text-gray-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Empty state: recents + quick links */}
                {!query && (
                  <div className="py-2">
                    {recent.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Recent
                          </span>
                          <button
                            onClick={clear}
                            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        {recent.map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setQuery(term);
                              inputRef.current?.focus();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                          >
                            <Clock size={13} className="text-gray-300 shrink-0" />
                            <span className="text-sm text-gray-600">{term}</span>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 mt-2" />
                      </div>
                    )}

                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Quick links
                      </span>
                    </div>
                    {QUICK_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowRight size={13} className="text-gray-300 shrink-0" />
                        <span className="text-sm text-gray-600">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400">
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
