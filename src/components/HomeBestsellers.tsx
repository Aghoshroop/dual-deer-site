"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Check, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/CartContext";
import ProductImage from "./ProductImage";
import { getProducts, onStoreUpdate } from "@/lib/store";

const HOME_SLUGS = [
  "speed-suit-apex",
  "speed-suit-phantom",
  "carbon-training-tights",
  "heatmap-compression-set",
  "elite-compression-top",
  "performance-shorts",
];

export default function HomeBestsellers() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      if (cancelled) return;

      const all = getProducts();

      const ordered = HOME_SLUGS
        .map((slug) => all.find((p) => p?.slug === slug))
        .filter((p): p is Product => !!p);

      const final =
        ordered.length >= 3
          ? ordered
          : all.filter((p): p is Product => !!p?.id).slice(0, 6);

      setProducts(final);
    };

    load();

    const unsubscribe = onStoreUpdate((type) => {
      if (type === "products") load();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, product.sizes?.[0] || "M");

    setAddedIds((prev) => [...prev, product.id]);

    setTimeout(() => {
      setAddedIds((prev) => prev.filter((x) => x !== product.id));
    }, 2000);
  };

  return (
    <section
      className="py-24 px-6 md:px-12 relative overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* Side gradient strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: "linear-gradient(to bottom, transparent, #9D4DFF, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: "#9D4DFF" }} />
              <p
                className="text-xs font-mono tracking-[0.35em]"
                style={{ color: "#9D4DFF" }}
              >
                OUR BESTSELLERS
              </p>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              The Full{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#6A00FF,#C084FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arsenal.
              </span>
            </h2>

            <p className="text-gray-500 mt-3 text-sm max-w-md">
              Performance gear engineered for elite athletes.
            </p>
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
            style={{
              background: "rgba(157,77,255,0.1)",
              color: "#C084FF",
              border: "1px solid rgba(157,77,255,0.25)",
            }}
          >
            Shop All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* PRODUCT GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {products.slice(0, 4).map((product, i) => {
            const isHover = hoveredId === product.id;
            const isAdded = addedIds.includes(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: "linear-gradient(135deg,#0e0520,#050508)",
                  border: `1px solid ${
                    isHover
                      ? product.accentColor + "45"
                      : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                <Link href={`/product/${product.slug}`} className="flex h-44">

                  <div className="relative w-[40%] bg-[#080512]">
                    <ProductImage
                      imageId={product.images?.[0]}
                      alt={product.name}
                      accentColor={product.accentColor}
                      productId={product.id}
                      className="absolute inset-0"
                    />
                  </div>

                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <p
                        className="text-[10px] font-mono tracking-[0.3em]"
                        style={{ color: product.accentColor }}
                      >
                        {product.category.toUpperCase()}
                      </p>

                      <h3 className="text-white font-black">
                        {product.name}
                      </h3>

                      <p className="text-gray-500 text-xs">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span
                        className="text-xl font-black"
                        style={{ color: product.accentColor }}
                      >
                        ${product.price}
                      </span>

                      <button
                        onClick={(e) => handleAdd(e, product)}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg text-white"
                        style={{
                          background: isAdded
                            ? "#00E5FF"
                            : product.accentColor,
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}