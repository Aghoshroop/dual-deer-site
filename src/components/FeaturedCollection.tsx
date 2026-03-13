"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Check } from "lucide-react";
import Link from "next/link";
import { getProducts, onStoreUpdate } from "@/lib/store";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/CartContext";
import ProductImage from "./ProductImage";

// Pick 4 featured products from the dynamic store
const FEATURED_SLUGS = ["speed-suit-apex", "elite-compression-top", "carbon-training-tights", "performance-shorts"];

export default function FeaturedCollection() {
  const { addToCart } = useCart();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getProducts();
      const f = FEATURED_SLUGS.map(slug => all.find(p => p.slug === slug)).filter(Boolean) as Product[];
      // Fall back to first 4 if slugs not found
      setFeatured(f.length >= 2 ? f : all.slice(0, 4));
    };
    load();
    return onStoreUpdate(() => load());
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // stop Link navigation when clicking the button
    e.stopPropagation();
    addToCart(product, product.sizes?.[2] || product.sizes?.[0] || "One Size");
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const safeFeatured = featured?.filter(p => p?.id) ?? [];

  return (
    <section id="collection" className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Background ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(106,0,255,0.06) 0%, transparent 70%)" }}
      />
      <div className="neon-line absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between"
        >
          <div>
            <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>
              FEATURED COLLECTION
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Engineered to <span className="text-gradient">Dominate.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-6 md:mt-0 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            View All Products
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safeFeatured.map((product, i) => (
            <motion.div
              key={`${product.id}-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-2xl overflow-hidden group"
              style={{
                background: "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(5,5,5,1) 100%)",
                border: hoveredId === product.id
                  ? `1px solid ${product.accentColor}50`
                  : "1px solid rgba(255,255,255,0.06)",
                transform: hoveredId === product.id ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
                transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                boxShadow: hoveredId === product.id
                  ? `0 24px 60px ${product.accentColor}30, 0 0 0 1px ${product.accentColor}30`
                  : "none",
              }}
            >
                {/* Entire card is a link to product page */}
                <Link href={`/product/${product.slug}`} className="block">
                  {/* Product image area */}
                  <div className="relative h-64 overflow-hidden"
                    style={{ background: "linear-gradient(180deg, #0e0520 0%, #050508 100%)" }}>
                    {product.images?.length > 0 && (
                      <ProductImage
                        imageId={product.images[0]}
                        alt={product.name}
                        accentColor={product.accentColor}
                        productId={product.id}
                        className="absolute inset-0"
                      />
                    )}
                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at center, ${product.accentColor}20 0%, transparent 70%)`,
                        opacity: hoveredId === product.id ? 0.6 : 0,
                      }}
                    />
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest font-bold z-10"
                        style={{
                          background: `${product.accentColor}20`,
                          color: product.accentColor,
                          border: `1px solid ${product.accentColor}40`,
                        }}>
                        {product.badge}
                      </div>
                    )}

                    {/* Hover: Quick Add to Cart overlay */}
                    <motion.div
                      className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4 z-10"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: hoveredId === product.id ? 1 : 0, y: hoveredId === product.id ? 0 : 8 }}
                      transition={{ duration: 0.2 }}
                    >
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex items-center gap-2 text-xs font-bold tracking-widest px-4 py-2 rounded-full text-white transition-all"
                      style={{
                        background: addedId === product.id
                          ? "linear-gradient(135deg, #00C896, #00E5FF)"
                          : `linear-gradient(135deg, ${product.accentColor}, ${product.accentColor}99)`,
                        boxShadow: `0 4px 20px ${product.accentColor}50`,
                      }}
                    >
                      {addedId === product.id ? (
                        <><Check className="w-3 h-3" /> ADDED</>
                      ) : (
                        <><Plus className="w-3 h-3" /> QUICK ADD</>
                      )}
                    </button>
                  </motion.div>
                </div>

                {/* Product info */}
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:opacity-80 transition-opacity">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold" style={{ color: product.accentColor }}>
                      ${product.price}
                    </span>
                    {/* Bottom add-to-cart — stops propagation to keep on-page */}
                    <button
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {addedId === product.id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="neon-line absolute bottom-0 left-0 right-0" />
    </section>
  );
}
