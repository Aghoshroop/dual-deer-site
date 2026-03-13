"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Check, Heart, Star, ChevronLeft,
  ChevronRight, ArrowRight, Shield, RotateCcw, Truck,
} from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/CartContext";
import ProductImage from "@/components/ProductImage";

// ─── Magnetic Button Hook ───────────────────────────────────────────────
function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (left + width / 2)) * strength;
    const dy = (e.clientY - (top + height / 2)) * strength;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };
  return { ref, handleMouseMove, handleMouseLeave };
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductPageClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeGallery, setActiveGallery] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const addBtn = useMagnetic(0.3);

  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ["start start", "end end"],
  });

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <main className="min-h-screen bg-[#050508] text-white pt-20" ref={containerRef}>

      {/* ─── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-2">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-2 text-xs font-mono text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-400 transition-colors">Shop</Link>
          <span>/</span>
          <span style={{ color: product.accentColor }}>{product.name}</span>
        </motion.div>
      </div>

      {/* ─── Hero: Two-column Layout ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-start">

          {/* LEFT: Cinematic Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-4"
          >
            {/* Main active frame */}
            <motion.div
              key={activeGallery}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ height: 520, background: "linear-gradient(145deg, #0e0520 0%, #050508 100%)", border: `1px solid ${product.accentColor}20` }}
            >
              <ProductImage
                imageId={product.images[activeGallery] || product.images[0]}
                alt={`${product.name} view ${activeGallery + 1}`}
                accentColor={product.accentColor}
                productId={product.id}
                className="absolute inset-0"
              />
              {/* Glow overlay */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: `inset 0 0 80px ${product.accentColor}08` }} />
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[9px] font-mono tracking-[0.3em] px-3 py-1 rounded-full"
                  style={{ background: `${product.accentColor}15`, color: product.accentColor, border: `1px solid ${product.accentColor}30` }}>
                  PRODUCT VIEW
                </span>
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveGallery(i)}
                  className="flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 relative"
                  style={{
                    width: 80, height: 80,
                    background: `linear-gradient(145deg, #0e0520 0%, #050508 100%)`,
                    border: `1.5px solid ${i === activeGallery ? product.accentColor : "rgba(255,255,255,0.07)"}`,
                    boxShadow: i === activeGallery ? `0 0 16px ${product.accentColor}40` : "none",
                  }}
                >
                  <ProductImage
                    imageId={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    accentColor={product.accentColor}
                    productId={product.id}
                    className="absolute inset-0"
                  />
                </button>
              ))}
            </div>

            {/* Parallax scroll-reveal gallery (below fold) */}
            <div ref={galleryRef} className="space-y-6 mt-4">
              {product.images.slice(1).map((img, i) => (
                <ParallaxCard key={i} imageId={img} index={i + 1} accentColor={product.accentColor} productId={product.id} progress={galleryProgress} />
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Product Info Panel — sticky */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:sticky lg:top-24 space-y-6"
          >
            {/* Category + Badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono tracking-[0.3em]" style={{ color: product.accentColor }}>
                {product.category.toUpperCase()}
              </span>
              {product.badge && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${product.accentColor}20`, color: product.accentColor, border: `1px solid ${product.accentColor}40` }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Product Name — word-by-word animation */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white">
                {product.name.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4"
                    fill={i < Math.floor(product.rating) ? product.accentColor : "transparent"}
                    stroke={product.accentColor} strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">{product.rating} · {product.reviews} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black" style={{ color: product.accentColor }}>
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-600 line-through">${product.originalPrice}</span>
                  <span className="text-sm font-bold text-green-400">Save ${savings}</span>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="text-gray-400 leading-relaxed text-sm border-l-2 pl-4" style={{ borderColor: `${product.accentColor}40` }}>
              {product.description}
            </p>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs font-mono tracking-widest text-gray-500 mb-3">
                  COLOR — <span className="text-white">{product.colors[selectedColor].name}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      title={c.name}
                      onClick={() => setSelectedColor(i)}
                      className="w-8 h-8 rounded-full transition-all duration-200"
                      style={{
                        background: c.hex,
                        border: `2px solid ${i === selectedColor ? product.accentColor : "rgba(255,255,255,0.1)"}`,
                        boxShadow: i === selectedColor ? `0 0 12px ${product.accentColor}60` : "none",
                        transform: i === selectedColor ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono tracking-widest text-gray-500">
                  SIZE — <span className="text-white">{selectedSize}</span>
                </p>
                <button className="text-xs text-gray-600 hover:text-gray-300 transition-colors underline underline-offset-2">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: selectedSize === size ? product.accentColor : "rgba(255,255,255,0.04)",
                      color: selectedSize === size ? "#fff" : "#9ca3af",
                      border: `1px solid ${selectedSize === size ? product.accentColor : "rgba(255,255,255,0.08)"}`,
                      boxShadow: selectedSize === size ? `0 0 20px ${product.accentColor}50` : "none",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {/* Add to Cart */}
              <button
                ref={addBtn.ref}
                onMouseMove={addBtn.handleMouseMove}
                onMouseLeave={addBtn.handleMouseLeave}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white text-sm tracking-wide transition-all duration-300"
                style={{
                  background: added
                    ? "linear-gradient(135deg, #00C896, #00E5FF)"
                    : `linear-gradient(135deg, #6A00FF, ${product.accentColor})`,
                  boxShadow: added
                    ? "0 0 40px rgba(0,229,255,0.35)"
                    : `0 0 40px ${product.accentColor}50`,
                  transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2">
                      <Check className="w-5 h-5" /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Add to Cart — ${product.price}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Buy Now + Wishlist */}
              <div className="flex gap-3">
                <Link
                  href="/checkout"
                  onClick={() => addToCart(product, selectedSize)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    border: `1.5px solid ${product.accentColor}60`,
                    color: product.accentColor,
                    background: `${product.accentColor}08`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${product.accentColor}18`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${product.accentColor}08`)}
                >
                  Buy Now <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200"
                  style={{
                    border: `1.5px solid ${wishlisted ? "#ff4d6d" : "rgba(255,255,255,0.1)"}`,
                    background: wishlisted ? "rgba(255,77,109,0.12)" : "rgba(255,255,255,0.03)",
                    boxShadow: wishlisted ? "0 0 20px rgba(255,77,109,0.25)" : "none",
                  }}
                >
                  <Heart className="w-5 h-5" fill={wishlisted ? "#ff4d6d" : "transparent"} stroke={wishlisted ? "#ff4d6d" : "#6b7280"} />
                </button>
              </div>
            </div>

            {/* Trust chips */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders $200+" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "No questions" },
                { icon: Shield, label: "Elite Quality", sub: "Guaranteed" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center py-3 px-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: product.accentColor }} />
                  <p className="text-[10px] text-white font-semibold">{label}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Tech list */}
            <div>
              <p className="text-[10px] font-mono tracking-[0.3em] mb-3" style={{ color: product.accentColor }}>
                EMBEDDED TECHNOLOGY
              </p>
              <div className="space-y-2">
                {product.technology.map((tech) => (
                  <div key={tech} className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: product.accentColor }} />
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Neon divider ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-2">
        <div className="neon-line" />
      </div>

      {/* ─── Performance Engineering Section ────────────────────────────── */}
      <PerformanceSection product={product} />

      {/* ─── Fabric Highlight Cards ─────────────────────────────────────── */}
      <FabricSection product={product} activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

      {/* ─── Athlete Reviews ─────────────────────────────────────────────── */}
      <ReviewsSection product={product} />

      {/* ─── Similar Products ──────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && <SimilarProducts products={relatedProducts} accentColor={product.accentColor} />}

    </main>
  );
}

// ─── Parallax Card ──────────────────────────────────────────────────────────
import { MotionValue } from "framer-motion";

function ParallaxCard({ imageId, index, accentColor, productId, progress }: {
  imageId: string; index: number; accentColor: string; productId: number; progress: MotionValue<number>;
}) {
  const y = useTransform(progress, [0, 1], [index * 30, -index * 30]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return (
    <motion.div style={{ y, scale, opacity, height: 260 }} className="relative rounded-2xl overflow-hidden"
    >
      <ProductImage
        imageId={imageId}
        alt={`Product detail ${index}`}
        accentColor={accentColor}
        productId={productId}
        className="absolute inset-0"
        style={{ height: 260 }}
      />
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] font-mono tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.6)", color: accentColor, border: `1px solid ${accentColor}30`, backdropFilter: "blur(8px)" }}>
          DETAIL {index}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Performance Section ────────────────────────────────────────────────────
function PerformanceSection({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const stats = [
    { value: "64", unit: "Layer", label: "Carbon Micro-Fiber" },
    { value: "0.04", unit: "cd", label: "Drag Coefficient" },
    { value: "12", unit: "Zones", label: "Compression Mapping" },
    { value: "3yr", unit: "", label: "R&D Investment" },
  ];

  return (
    <section ref={ref} className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div style={{ y, opacity }}>
          <p className="text-xs font-mono tracking-[0.4em] mb-4" style={{ color: product.accentColor }}>
            PERFORMANCE ENGINEERING
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Built for<br />
            <span className="text-gradient">Extremes.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-16">
            {product.longDescription}
          </p>

          {/* Stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, unit, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${product.accentColor}20` }}
              >
                <p className="text-4xl font-black" style={{ color: product.accentColor }}>
                  {value}<span className="text-xl ml-1 opacity-60">{unit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Fabric Section ──────────────────────────────────────────────────────────
function FabricSection({ product, activeFeature, setActiveFeature }: {
  product: Product; activeFeature: number | null; setActiveFeature: (i: number | null) => void;
}) {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent via-[#070512] to-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono tracking-[0.4em] mb-4" style={{ color: product.accentColor }}>FABRIC TECHNOLOGY</p>
          <h2 className="text-4xl md:text-6xl font-black text-white">
            Engineering<br />
            <span className="text-gradient-cyan">at the Fiber Level</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {product.features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onHoverStart={() => setActiveFeature(i)}
              onHoverEnd={() => setActiveFeature(null)}
              className="relative p-8 rounded-3xl cursor-default overflow-hidden transition-all duration-300"
              style={{
                background: activeFeature === i
                  ? `linear-gradient(135deg, ${product.accentColor}15, rgba(5,5,8,0.9))`
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeFeature === i ? product.accentColor + "50" : "rgba(255,255,255,0.06)"}`,
                boxShadow: activeFeature === i ? `0 8px 40px ${product.accentColor}20` : "none",
                transform: activeFeature === i ? "translateY(-4px)" : "translateY(0)",
              }}
            >
              {/* Glow blob on hover */}
              {activeFeature === i && (
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: `${product.accentColor}25` }} />
              )}
              <div className="text-4xl mb-4">{feat.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.body}</p>
              <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, ${product.accentColor}40, transparent)` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Reviews Section ─────────────────────────────────────────────────────────
function ReviewsSection({ product }: { product: Product }) {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs font-mono tracking-[0.4em] mb-3" style={{ color: product.accentColor }}>ATHLETE REVIEWS</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Trusted by<br />Elite Performers
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5" fill={product.accentColor} stroke={product.accentColor} strokeWidth={1} />
              ))}
            </div>
            <span className="text-2xl font-black text-white">{product.rating}</span>
            <span className="text-gray-500 text-sm">/ 5.0 · {product.reviews} reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {product.reviewsList.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="p-8 rounded-3xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4" fill={product.accentColor} stroke={product.accentColor} strokeWidth={1} />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">&quot;{review.body}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base"
                  style={{ background: `${product.accentColor}20`, color: product.accentColor }}>
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{review.name}</p>
                  <p className="text-gray-600 text-xs">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Similar Products ─────────────────────────────────────────────────────────
function SimilarProducts({ products, accentColor }: { products: Product[]; accentColor: string }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-transparent via-[#070512] to-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <p className="text-xs font-mono tracking-[0.4em] mb-2" style={{ color: accentColor }}>YOU MAY ALSO LIKE</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Complete Your Setup</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ border: `1px solid rgba(255,255,255,0.1)`, background: "rgba(255,255,255,0.04)" }}>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ border: `1px solid ${accentColor}40`, background: `${accentColor}12` }}>
              <ChevronRight className="w-4 h-4" style={{ color: accentColor }} />
            </button>
          </div>
        </motion.div>

        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-shrink-0 snap-start"
              style={{ width: 300 }}
            >
              <Link href={`/product/${p.slug}`} className="group block">
                <div className="rounded-2xl overflow-hidden mb-4 relative transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    height: 200,
                    background: "linear-gradient(145deg, #0e0520 0%, #050508 100%)",
                    border: `1px solid ${p.accentColor}20`,
                    boxShadow: `0 0 0 0 ${p.accentColor}30`,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${p.accentColor}25`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${p.accentColor}30`; }}
                >
                  <ProductImage
                    imageId={p.images[0]}
                    alt={p.name}
                    accentColor={p.accentColor}
                    productId={p.id}
                    className="absolute inset-0"
                  />
                </div>
                <div className="space-y-1 px-1">
                  <p className="text-[10px] font-mono tracking-widest" style={{ color: p.accentColor }}>{p.category.toUpperCase()}</p>
                  <p className="text-white font-bold truncate group-hover:opacity-80 transition-opacity">{p.name}</p>
                  <p className="font-black" style={{ color: p.accentColor }}>${p.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
