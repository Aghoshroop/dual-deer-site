"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Star, Zap } from "lucide-react";
import Link from "next/link";
import { getProducts, onStoreUpdate } from "@/lib/store";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/CartContext";
import ProductImage from "./ProductImage";

// Best sellers by slug (ordered)
const BESTSELLER_SLUGS = ["speed-suit-apex", "speed-suit-phantom", "heatmap-compression-set"];
const BADGES: { icon: React.ElementType; label: string; desc: string; color: string }[] = [
  { icon: Flame, label: "#1 BEST SELLER", desc: "Apex Speed Suit", color: "#FF6B35" },
  { icon: Star, label: "TOP RATED", desc: "Speed Suit Phantom", color: "#C084FF" },
  { icon: Zap, label: "BEST VALUE", desc: "HeatMap Set", color: "#00E5FF" },
];

export default function ShopHero() {
  const { addToCart } = useCart();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      const all = getProducts();
      const bs = BESTSELLER_SLUGS
        .map(slug => all.find(p => p && p.slug === slug))
        .filter((p): p is Product => !!p && !!p.id && !!p.name);
      setBestSellers(bs.length >= 2 ? bs : all.filter((p): p is Product => !!p && !!p.id).slice(0, 3));
    };
    load();
    return onStoreUpdate(() => load());
  }, []);

  if (!bestSellers.length) return null;

  return (
    <section className="relative overflow-hidden pt-4 pb-16">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(157,77,255,0.4), transparent)" }} />
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(106,0,255,0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)" }}>
            <Flame className="w-4 h-4" style={{ color: "#FF6B35" }} />
            <span className="text-xs font-black font-mono tracking-[0.3em]" style={{ color: "#FF6B35" }}>BEST SELLERS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            What Athletes{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B35, #FF9D73)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Choose
            </span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            The products our athletes reach for, race in, and train with every day.
          </p>
        </motion.div>

        {/* Best Seller Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {bestSellers.filter(p => p && p.id && p.accentColor).map((product, i) => {
            const badge = BADGES[i] || BADGES[0];
            const isHov = hoveredId === product.id;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative rounded-3xl overflow-hidden ${i === 0 ? "md:col-span-1 md:row-span-2" : ""}`}
                style={{
                  background: "linear-gradient(145deg, #0e0520 0%, #050508 100%)",
                  border: `1px solid ${isHov ? product.accentColor + "50" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: isHov ? `0 24px 60px ${product.accentColor}25, 0 0 0 1px ${product.accentColor}20` : "none",
                  transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: isHov ? "translateY(-6px)" : "translateY(0)",
                }}
              >
                {/* Image area */}
                <Link href={`/product/${product.slug}`}>
                  <div className="relative overflow-hidden"
                    style={{
                      height: i === 0 ? 340 : 220,
                      background: "linear-gradient(135deg, #0e0520, #050508)"
                    }}>
                    <ProductImage
                      imageId={product.images?.[0] || ""}
                      alt={product.name}
                      accentColor={product.accentColor}
                      productId={product.id}
                      className="absolute inset-0"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(5,5,8,0.85) 100%)" }} />
                    {/* Glow on hover */}
                    <div className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(ellipse at center, ${product.accentColor}20 0%, transparent 70%)`,
                        opacity: isHov ? 1 : 0,
                      }} />

                    {/* Star badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                      style={{ background: `${badge.color}18`, border: `1px solid ${badge.color}35` }}>
                      <badge.icon className="w-3 h-3" style={{ color: badge.color }} />
                      <span className="text-[9px] font-black font-mono tracking-wider" style={{ color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Price overlay on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-mono tracking-widest mb-1" style={{ color: product.accentColor }}>
                        {product.category.toUpperCase()}
                      </p>
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-black text-base leading-tight">{product.name.split("—")[0].trim()}</h3>
                        <span className="text-xl font-black" style={{ color: product.accentColor }}>${product.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Card footer */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className="w-3 h-3"
                          fill={j < Math.floor(product.rating) ? product.accentColor : "transparent"}
                          stroke={product.accentColor} strokeWidth={1.5} viewBox="0 0 24 24">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                      <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                    </div>
                    <p className="text-gray-500 text-xs truncate max-w-[180px]">{product.description}</p>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
                    onClick={() => addToCart(product, product.sizes?.[0] || "M")}
                    style={{
                      background: `${product.accentColor}15`,
                      color: product.accentColor,
                      border: `1px solid ${product.accentColor}30`,
                    }}
                  >
                    Shop <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}
        >
          {[
            { value: "10,000+", label: "Athletes Trust Us" },
            { value: "4.9★", label: "Average Rating" },
            { value: "50+", label: "Countries Shipped" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-600 font-mono tracking-wider mt-1">{label.toUpperCase()}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
