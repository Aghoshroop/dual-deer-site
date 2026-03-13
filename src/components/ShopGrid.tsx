"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { getProducts, onStoreUpdate } from "@/lib/store";
import { Product, CATEGORIES } from "@/lib/products";
import ProductImage from "./ProductImage";

// ─── Filter State ──────────────────────────────────────────────────────────────

interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  minRating: number;
  inStockOnly: boolean;
  sort: "default" | "price-asc" | "price-desc" | "rating" | "newest";
}

const DEFAULT_FILTER: FilterState = {
  category: "All",
  minPrice: 0,
  maxPrice: 500,
  sizes: [],
  minRating: 0,
  inStockOnly: false,
  sort: "default",
};

function applyFilters(products: Product[], filters: FilterState, searchQuery: string): Product[] {
  let result = [...products];

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technology.some(t => t.toLowerCase().includes(q))
    );
  }

  // Category
  if (filters.category !== "All") {
    result = result.filter(p => p.category === filters.category);
  }

  // Price
  result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

  // Sizes
  if (filters.sizes.length > 0) {
    result = result.filter(p => filters.sizes.some(s => p.sizes.includes(s)));
  }

  // Rating
  if (filters.minRating > 0) {
    result = result.filter(p => p.rating >= filters.minRating);
  }

  // In stock
  if (filters.inStockOnly) {
    result = result.filter(p => p.inStock);
  }

  // Sort
  switch (filters.sort) {
    case "price-asc": result.sort((a, b) => a.price - b.price); break;
    case "price-desc": result.sort((a, b) => b.price - a.price); break;
    case "rating": result.sort((a, b) => b.rating - a.rating); break;
    default: break;
  }

  return result;
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onReset, allSizes }: {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
  allSizes: string[];
}) {
  const hasActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTER);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-white">Filters</span>
        </div>
        {hasActive && (
          <button onClick={onReset} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-3">CATEGORY</p>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => onChange({ category: cat })}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: filters.category === cat ? "rgba(157,77,255,0.12)" : "transparent",
                color: filters.category === cat ? "#C084FF" : "#6b7280",
                border: filters.category === cat ? "1px solid rgba(157,77,255,0.2)" : "1px solid transparent",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-3">PRICE RANGE</p>
        <div className="flex items-center justify-between text-sm text-white mb-2">
          <span>${filters.minPrice}</span>
          <span>${filters.maxPrice}+</span>
        </div>
        <input type="range" min={0} max={500} step={10} value={filters.maxPrice}
          onChange={e => onChange({ maxPrice: +e.target.value })}
          className="w-full accent-purple-500 cursor-pointer" />
      </div>

      {/* Sizes */}
      {allSizes.length > 0 && (
        <div>
          <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-3">SIZES</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => {
              const active = filters.sizes.includes(size);
              return (
                <button key={size} onClick={() => onChange({
                  sizes: active ? filters.sizes.filter(s => s !== size) : [...filters.sizes, size]
                })}
                  className="px-3 py-1 rounded-lg text-xs font-mono transition-all"
                  style={{
                    background: active ? "rgba(157,77,255,0.2)" : "rgba(255,255,255,0.04)",
                    color: active ? "#C084FF" : "#6b7280",
                    border: active ? "1px solid rgba(157,77,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-3">MIN RATING</p>
        <div className="space-y-1">
          {[0, 4, 4.5, 4.8].map(r => (
            <button key={r} onClick={() => onChange({ minRating: r })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: filters.minRating === r ? "rgba(157,77,255,0.12)" : "transparent",
                color: filters.minRating === r ? "#C084FF" : "#6b7280",
                border: filters.minRating === r ? "1px solid rgba(157,77,255,0.2)" : "1px solid transparent",
              }}>
              {r === 0 ? "All Ratings" : (
                <span className="flex items-center gap-1">
                  {r}+ <Star className="w-3 h-3" fill="#9D4DFF" stroke="#9D4DFF" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">In Stock Only</p>
        <button onClick={() => onChange({ inStockOnly: !filters.inStockOnly })}
          className="relative w-10 h-5 rounded-full transition-colors"
          style={{ background: filters.inStockOnly ? "#9D4DFF" : "rgba(255,255,255,0.1)" }}>
          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            style={{ left: filters.inStockOnly ? "1.375rem" : "0.125rem" }} />
        </button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-3">SORT BY</p>
        <select value={filters.sort} onChange={e => onChange({ sort: e.target.value as FilterState["sort"] })}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", appearance: "none" }}>
          <option value="default">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}

// ─── Main ShopGrid ──────────────────────────────────────────────────────────────

function ShopGridContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const urlCat = searchParams?.get("cat") || "";
  const urlQuery = searchParams?.get("q") || "";

  // Load products from dynamic store + react to store updates
  const loadProducts = useCallback(() => setProducts(getProducts()), []);
  useEffect(() => {
    loadProducts();
    return onStoreUpdate(() => loadProducts());
  }, [loadProducts]);

  // Sync URL params to filters
  useEffect(() => {
    if (urlCat) setFilters(f => ({ ...f, category: urlCat }));
  }, [urlCat]);

  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes))).sort();
  const filtered = applyFilters(products, filters, urlQuery);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[2] || product.sizes[0]);
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(x => x !== product.id)), 2000);
  };

  const updateFilter = (partial: Partial<FilterState>) =>
    setFilters(f => ({ ...f, ...partial }));

  return (
    <section id="shop" className="py-32 px-6 md:px-12 relative overflow-hidden" style={{ background: "#050505" }}>
      {/* Background ambient glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at bottom right, rgba(106,0,255,0.08) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8 }} className="mb-12">
          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>SHOP ALL</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              The Full <span className="text-gradient">Arsenal.</span>
            </h2>
            <div className="flex items-center gap-3">
              {urlQuery && (
                <span className="text-sm text-gray-400">
                  Results for &ldquo;<span style={{ color: "#C084FF" }}>{urlQuery}</span>&rdquo;
                </span>
              )}
              <span className="text-gray-500 text-sm">{filtered.length} products</span>
              <button
                onClick={() => setFilterOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all lg:hidden"
                style={{ background: "rgba(157,77,255,0.1)", color: "#C084FF", border: "1px solid rgba(157,77,255,0.2)" }}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category Pills (mobile / below desktop sidebar) */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-wrap gap-3 mb-8 lg:hidden">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => updateFilter({ category: cat })}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: filters.category === cat ? "linear-gradient(135deg, #6A00FF, #9D4DFF)" : "rgba(255,255,255,0.04)",
                color: filters.category === cat ? "#fff" : "#9ca3af",
                border: filters.category === cat ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: filters.category === cat ? "0 0 20px rgba(106,0,255,0.3)" : "none",
              }}>
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28 rounded-2xl p-5"
              style={{ background: "rgba(10,5,20,0.8)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <FilterPanel filters={filters} onChange={updateFilter} onReset={() => setFilters(DEFAULT_FILTER)} allSizes={allSizes} />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden" style={{ background: "rgba(0,0,0,0.7)" }}
                onClick={() => setFilterOpen(false)}>
                <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute left-0 top-0 bottom-0 w-72 p-6 overflow-y-auto"
                  style={{ background: "rgba(8,4,16,0.99)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-bold text-white">Filters</span>
                    <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <FilterPanel filters={filters} onChange={updateFilter} onReset={() => setFilters(DEFAULT_FILTER)} allSizes={allSizes} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-400 text-lg mb-2">No products match your filters.</p>
                <button onClick={() => setFilters(DEFAULT_FILTER)}
                  className="text-sm mt-2 underline" style={{ color: "#9D4DFF" }}>Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product, i) => {
                  const isHovered = hoveredId === product.id;
                  const isAdded = addedIds.includes(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      onMouseEnter={() => setHoveredId(product.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="rounded-2xl overflow-hidden relative group"
                      style={{
                        background: "linear-gradient(180deg, #0A0A12 0%, #050508 100%)",
                        border: isHovered ? `1px solid ${product.accentColor}45` : "1px solid rgba(255,255,255,0.05)",
                        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        boxShadow: isHovered ? `0 20px 50px ${product.accentColor}25` : "none",
                      }}
                    >
                      {product.badge && (
                        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest font-bold"
                          style={{ background: `${product.accentColor}20`, color: product.accentColor, border: `1px solid ${product.accentColor}40` }}>
                          {product.badge}
                        </div>
                      )}

                      <Link href={`/product/${product.slug}`} className="block">
                        {/* Image area */}
                        <div className="relative h-52 overflow-hidden"
                          style={{ background: "linear-gradient(135deg, #0e0818 0%, #050508 100%)" }}>
                          <ProductImage
                            imageId={product.images[0]}
                            alt={product.name}
                            accentColor={product.accentColor}
                            productId={product.id}
                            className="absolute inset-0"
                          />
                          {/* Hover scale overlay */}
                          <div className="absolute inset-0 transition-opacity duration-500"
                            style={{ background: `radial-gradient(ellipse at center, ${product.accentColor}12 0%, transparent 65%)`, opacity: isHovered ? 1 : 0 }} />
                          <motion.div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-3 z-10"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
                            transition={{ duration: 0.2 }}>
                            <button onClick={(e) => handleAdd(e, product)}
                              className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full text-white"
                              style={{
                                background: isAdded ? "linear-gradient(135deg, #00C896, #00E5FF)" : `linear-gradient(135deg, ${product.accentColor}, ${product.accentColor}90)`,
                                boxShadow: `0 4px 16px ${product.accentColor}50`,
                              }}>
                              {isAdded ? "✓ Added" : <><ShoppingBag className="w-3 h-3" /> Quick Add</>}
                            </button>
                            <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: `${product.accentColor}90` }}>
                              View <ArrowRight className="w-3 h-3" />
                            </span>
                          </motion.div>
                        </div>

                        {/* Product info */}
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2 text-sm group-hover:opacity-80 transition-opacity">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star key={idx} className="w-3 h-3"
                                  fill={idx < Math.floor(product.rating) ? product.accentColor : "transparent"}
                                  stroke={product.accentColor} strokeWidth={1.5} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg" style={{ color: product.accentColor }}>${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-gray-600 text-sm line-through">${product.originalPrice}</span>
                              )}
                            </div>
                            <button onClick={(e) => handleAdd(e, product)}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                              style={{
                                background: isAdded ? "rgba(0,229,255,0.15)" : `${product.accentColor}18`,
                                border: `1px solid ${isAdded ? "#00E5FF" : product.accentColor}`,
                                color: isAdded ? "#00E5FF" : product.accentColor,
                              }}>
                              {isAdded ? "✓" : <ShoppingBag className="w-3 h-3" />}
                              {isAdded ? "Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ShopGrid() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] py-32 flex items-center justify-center text-white">Loading Shop...</div>}>
      <ShopGridContent />
    </Suspense>
  );
}
