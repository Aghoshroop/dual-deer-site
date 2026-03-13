"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { searchProducts } from "@/lib/store";
import { Product } from "@/lib/products";

interface SearchBarProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchBar({ open, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("dd_recent_searches") || "[]");
      setRecentSearches(stored.slice(0, 5));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length > 1) {
      setResults(searchProducts(q));
    } else {
      setResults([]);
    }
  }, []);

  const saveSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("dd_recent_searches", JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200]"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative mx-auto mt-[10vh] max-w-2xl px-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: "rgba(10,5,20,0.98)",
              border: "1px solid rgba(157,77,255,0.3)",
              boxShadow: "0 0 60px rgba(106,0,255,0.15)",
            }}
          >
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: "#9D4DFF" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, categories, technology..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-600"
              autoComplete="off"
            />
            {query && (
              <button onClick={() => handleSearch("")} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose}
              className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors ml-1 flex-shrink-0">
              ESC
            </button>
          </div>

          {/* Results / suggestions */}
          <div className="mt-3 rounded-2xl overflow-hidden"
            style={{ background: "rgba(8,4,16,0.98)", border: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Search results */}
            {results.length > 0 && (
              <div>
                <div className="px-5 pt-4 pb-2">
                  <p className="text-[10px] font-mono tracking-widest text-gray-600">
                    {results.length} RESULT{results.length !== 1 ? "S" : ""}
                  </p>
                </div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => { saveSearch(query); onClose(); }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/4 transition-colors group"
                  >
                    {/* Color swatch */}
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${product.accentColor}18`, border: `1px solid ${product.accentColor}30` }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: product.accentColor, opacity: 0.7 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{product.category}</span>
                        <span className="text-gray-700">·</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" fill={product.accentColor} stroke={product.accentColor} strokeWidth={1.5} />
                          <span className="text-xs text-gray-500">{product.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-bold text-sm" style={{ color: product.accentColor }}>
                        ${product.price}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}

                {/* View all */}
                <Link
                  href={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={() => { saveSearch(query); onClose(); }}
                  className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium transition-colors hover:bg-white/4"
                  style={{ color: "#9D4DFF", borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* No results */}
            {query.length > 1 && results.length === 0 && (
              <div className="py-10 text-center">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-gray-500 text-sm">No products found for &ldquo;{query}&rdquo;</p>
                <p className="text-gray-600 text-xs mt-1">Try searching for: compression, speed suit, recovery</p>
              </div>
            )}

            {/* Empty state: recent searches + suggestions */}
            {query.length <= 1 && (
              <div className="py-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-mono tracking-widest text-gray-600 px-5 mb-2">RECENT</p>
                    {recentSearches.map((s) => (
                      <button key={s} onClick={() => handleSearch(s)}
                        className="flex items-center gap-3 w-full px-5 py-2.5 text-left hover:bg-white/4 transition-colors">
                        <Search className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-sm text-gray-400">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-mono tracking-widest text-gray-600 px-5 mb-2">POPULAR SEARCHES</p>
                  {["speed suit", "compression", "recovery sleeve", "training tights", "performance shorts"].map(s => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="flex items-center gap-3 w-full px-5 py-2.5 text-left hover:bg-white/4 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: "#9D4DFF" }} />
                      <span className="text-sm text-gray-400">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
