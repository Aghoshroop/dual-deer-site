"use client";

/**
 * FeaturedCollection — fresh rewrite.
 * Design: auto-advancing carousel with thumbnail strip.
 * Data: fully guarded; no property access on undefined is possible.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import ProductImage from "./ProductImage";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface SafeProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  images: string[];
  technology: string[];
  sizes: string[];
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const ACCENT = "#9D4DFF";
const DELAY = 4500;
const SLUGS = [
  "speed-suit-apex", "speed-suit-phantom",
  "heatmap-compression-set", "carbon-training-tights", "elite-compression-top",
];

/** Convert ANY raw product object to a safe, fully-typed SafeProduct.
 *  Every field is explicitly read and given a fallback — no implicit access. */
function normalize(raw: unknown): SafeProduct | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "number" ? r.id : 0;
  if (!id) return null; // discard products with no id
  const accentColor = typeof r.accentColor === "string" && r.accentColor ? r.accentColor : ACCENT;
  return {
    id,
    slug: typeof r.slug === "string" ? r.slug : "",
    name: typeof r.name === "string" && r.name ? r.name : "Product",
    category: typeof r.category === "string" ? r.category : "",
    description: typeof r.description === "string" ? r.description : "",
    accentColor,
    price: typeof r.price === "number" ? r.price : 0,
    originalPrice: typeof r.originalPrice === "number" ? r.originalPrice : null,
    badge: typeof r.badge === "string" && r.badge ? r.badge : null,
    images: Array.isArray(r.images) ? (r.images as unknown[]).filter((x): x is string => typeof x === "string") : [],
    technology: Array.isArray(r.technology) ? (r.technology as unknown[]).filter((x): x is string => typeof x === "string") : [],
    sizes: Array.isArray(r.sizes) && r.sizes.length > 0 ? (r.sizes as unknown[]).filter((x): x is string => typeof x === "string") : ["M"],
  };
}

/* ── Component ────────────────────────────────────────────────────────────── */
export default function FeaturedCollection() {
const { addToCart } = useCart();
  const [products, setProducts] = useState<SafeProduct[]>([]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"l" | "r">("r");
  const [hovered, setHovered] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Load products lazily on client only */
  useEffect(() => {
    let cancelled = false;
    const unsubRef = { current: (() => {}) as () => void };

    async function load() {
      try {
        const { getProducts, onStoreUpdate } = await import("@/lib/store");
        if (cancelled) return;
        const build = () => {
          if (cancelled) return;
          try {
  const raw = getProducts?.();

  const all = Array.isArray(raw)
    ? raw.map(normalize).filter((p): p is SafeProduct => p !== null)
    : [];

  const ordered = SLUGS
    .map(s => all.find(p => p.slug === s))
    .filter((p): p is SafeProduct => p !== null);

  const final = ordered.length >= 3 ? ordered : all.slice(0, 5);

  setProducts(final);
  setIdx(i => final.length > 0 ? Math.min(i, final.length - 1) : 0);
} catch (e) {
            console.warn("[FeaturedCollection] load error:", e);
          }
        };
        build();
        unsubRef.current = onStoreUpdate(build);
      } catch (e) {
        console.warn("[FeaturedCollection] import error:", e);
      }
    }

    load();
  return () => {
  cancelled = true;
  if (typeof unsubRef.current === "function") {
    unsubRef.current();
  }
};
  }, []);

  /* Auto-advance */
  useEffect(() => {
    if (hovered || products.length < 2) return;
    timer.current = setTimeout(() => {
      setDir("r");
      setIdx(i => (i + 1) % products.length);
    }, DELAY);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, hovered, products.length]);

  const go = useCallback((to: number, d: "l" | "r") => {
    setDir(d);
    setIdx(to);
  }, []);
  const prev = useCallback(() => {
    if (!products.length) return;
    go((idx - 1 + products.length) % products.length, "l");
  }, [idx, products.length, go]);
  const next = useCallback(() => {
    if (!products.length) return;
    go((idx + 1) % products.length, "r");
  }, [idx, products.length, go]);

 const addCart = (e: React.MouseEvent, p: SafeProduct) => {
  e.preventDefault();
  e.stopPropagation();

  if (addToCart) {
   addToCart?.(p as any, p.sizes?.[0] ?? "M");
  }

  setAddedId(p.id);
  setTimeout(() => setAddedId(null), 1800);
};

  /* Guard: show nothing until products are ready */
  if (products.length === 0) return null;
  const safeIdx = Math.min(Math.max(0, idx), products.length - 1);
  const active = products[safeIdx];
  if (!active) return null;

  const variants = {
    enter: (d: "l" | "r") => ({ x: d === "r" ? "6%" : "-6%", opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: "l" | "r") => ({ x: d === "r" ? "-6%" : "6%", opacity: 0, scale: 0.97 }),
  };

  return (
    <section
      id="collection"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#050508 0%,#08050f 100%)", minHeight: "90vh" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient glow */}
      <AnimatePresence>
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.35, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 60% 50%,${active.accentColor}30 0%,transparent 65%)` }}
        />
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-0">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-xs font-mono tracking-[0.35em] mb-3" style={{ color: "#9D4DFF" }}>
              FEATURED COLLECTION
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Engineered to{" "}
              <span style={{
                background: `linear-gradient(135deg,${active.accentColor},#C084FF)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                transition: "all 0.8s ease",
              }}>
                Dominate.
              </span>
            </h2>
          </div>
          <Link href="/shop"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-white transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Hero card */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden relative"
            style={{
              height: "clamp(340px,50vw,520px)",
              background: "linear-gradient(135deg,#0e0520 0%,#050508 100%)",
              border: `1px solid ${active.accentColor}25`,
              boxShadow: `0 0 80px ${active.accentColor}20`,
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={safeIdx}
                custom={dir}
                variants={variants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 grid grid-cols-1 md:grid-cols-2"
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0e0520,#050508)" }}>
                  <ProductImage
                    imageId={active.images[0] ?? ""}
                    alt={active.name}
                    accentColor={active.accentColor}
                    productId={active.id}
                    className="absolute inset-0"
                  />
                  <div className="absolute inset-0 hidden md:block"
                    style={{ background: "linear-gradient(to right,transparent 50%,rgba(5,5,8,0.95) 100%)" }} />
                  {active.badge && (
                    <div className="absolute top-5 left-5 px-3 py-1 rounded-full text-[11px] font-black font-mono tracking-widest"
                      style={{ background: `${active.accentColor}25`, color: active.accentColor, border: `1px solid ${active.accentColor}40` }}>
                      {active.badge}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="space-y-5"
                  >
                    <p className="text-xs font-mono tracking-[0.3em]" style={{ color: active.accentColor }}>
                      {active.category.toUpperCase()}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{active.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{active.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {active.technology.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                          style={{ background: `${active.accentColor}10`, color: active.accentColor, border: `1px solid ${active.accentColor}25` }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-3xl font-black" style={{ color: active.accentColor }}>${active.price}</span>
                      {active.originalPrice && (
                        <span className="text-gray-600 line-through text-lg">${active.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Link href={`/product/${active.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white text-sm hover:scale-[1.03] transition-transform"
                        style={{ background: `linear-gradient(135deg,#6A00FF,${active.accentColor})`, boxShadow: `0 0 30px ${active.accentColor}40` }}>
                        View Product <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={e => addCart(e, active)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm hover:scale-[1.03] transition-transform"
                        style={{ border: `1.5px solid ${active.accentColor}50`, color: active.accentColor, background: `${active.accentColor}08` }}
                      >
                        {addedId === active.id
                          ? <><Check className="w-4 h-4" /> Done</>
                          : <><ShoppingBag className="w-4 h-4" /> Add</>}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            <button onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${active.accentColor}40`, backdropFilter: "blur(8px)" }}>
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
              {!hovered && (
                <motion.div
                  key={`pb-${safeIdx}`}
                  initial={{ width: "0%" }} animate={{ width: "100%" }}
                  transition={{ duration: DELAY / 1000, ease: "linear" }}
                  className="h-full"
                  style={{ background: `linear-gradient(to right,${active.accentColor},#C084FF)` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="mt-5 pb-5">
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {products.map((p, i) => {
              const isActive = i === safeIdx;
              return (
                <motion.button
                  key={p.id}
                  onClick={() => go(i, i > safeIdx ? "r" : "l")}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0 relative rounded-2xl overflow-hidden"
                  style={{
                    width: isActive ? 200 : 120,
                    height: 80,
                    background: "linear-gradient(135deg,#0e0520,#050508)",
                    border: `1.5px solid ${isActive ? p.accentColor : "rgba(255,255,255,0.07)"}`,
                    boxShadow: isActive ? `0 0 24px ${p.accentColor}40` : "none",
                    transition: "all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
                  }}
                >
                  <ProductImage
                    imageId={p.images[0] ?? ""}
                    alt={p.name}
                    accentColor={p.accentColor}
                    productId={p.id}
                    className="absolute inset-0"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-2"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%)", opacity: isActive ? 1 : 0.4 }}>
                    {isActive && (
                      <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-bold text-white truncate font-mono tracking-wider">
                        {p.name.split(" ").at(-1) ?? p.name}
                      </motion.p>
                    )}
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: p.accentColor }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {products.map((p, i) => (
              <button key={i} onClick={() => go(i, i > safeIdx ? "r" : "l")}
                className="transition-all duration-300"
                style={{
                  width: i === safeIdx ? 24 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === safeIdx ? active.accentColor : "rgba(255,255,255,0.15)",
                  boxShadow: i === safeIdx ? `0 0 8px ${active.accentColor}60` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
