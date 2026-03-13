"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { PRODUCTS } from "@/lib/products";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart, updateQty, cartTotal, cartCount } = useCart();

  // Pick 2 random upsell products not already in cart
  const cartIds = new Set(cart.map((i) => i.product.id));
  const upsell = PRODUCTS.filter((p) => !cartIds.has(p.id)).slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[101] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0a0516 0%, #050508 100%)",
              borderLeft: "1px solid rgba(157,77,255,0.15)",
              boxShadow: "-24px 0 80px rgba(106,0,255,0.14)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" style={{ color: "#9D4DFF" }} />
                <span className="font-bold text-white">
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ background: "rgba(157,77,255,0.2)", color: "#C084FF" }}>
                      {cartCount}
                    </span>
                  )}
                </span>
              </div>
              <button onClick={closeCart} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <ShoppingBag className="w-14 h-14 mb-4" style={{ color: "rgba(157,77,255,0.25)" }} />
                  <p className="text-gray-400 font-semibold mb-1">Your cart is empty.</p>
                  <p className="text-xs text-gray-700 mb-8">Add an elite product to begin.</p>
                  <button
                    onClick={closeCart}
                    className="text-sm font-bold px-6 py-3 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 24px rgba(106,0,255,0.35)" }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ type: "spring", damping: 25 }}
                      className="flex gap-4 p-4 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid rgba(255,255,255,0.05)`,
                      }}
                    >
                      {/* Product visual thumbnail */}
                      <div
                        className="w-16 h-16 rounded-xl flex-shrink-0 relative overflow-hidden"
                        style={{
                          background: `radial-gradient(circle at 30% 40%, ${item.product.accentColor}35, ${item.product.accentColor}06)`,
                          border: `1px solid ${item.product.accentColor}30`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full blur-md opacity-60"
                            style={{ background: item.product.accentColor }} />
                        </div>
                        <div className="absolute bottom-1.5 right-1.5">
                          <div className="w-2 h-2 rounded-full opacity-60" style={{ background: item.product.accentColor }} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: `${item.product.accentColor}15`, color: item.product.accentColor }}>
                            {item.product.category}
                          </span>
                          <span className="text-xs text-gray-600">Size: {item.size}</span>
                        </div>
                        <p className="text-sm font-black mt-2" style={{ color: item.product.accentColor }}>
                          ${(item.product.price * item.qty).toLocaleString()}
                        </p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.07)" }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm font-bold w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.07)" }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="ml-auto text-gray-700 hover:text-red-400 transition-colors p-1 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Upsell section */}
              {cart.length > 0 && upsell.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#C084FF" }} />
                    <p className="text-xs font-mono tracking-widest" style={{ color: "#C084FF" }}>
                      YOU MIGHT ALSO LIKE
                    </p>
                  </div>
                  <div className="space-y-2">
                    {upsell.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={closeCart}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-white/5"
                        style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <div className="w-10 h-10 rounded-lg flex-shrink-0"
                          style={{
                            background: `radial-gradient(circle, ${p.accentColor}25, transparent)`,
                            border: `1px solid ${p.accentColor}20`,
                          }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate group-hover:opacity-80 transition-opacity">{p.name}</p>
                          <p className="text-xs font-bold" style={{ color: p.accentColor }}>${p.price}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t space-y-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Subtotal</span>
                  <span className="text-white font-black text-xl">${cartTotal.toLocaleString()}</span>
                </div>

                {cartTotal < 200 && (
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((cartTotal / 200) * 100, 100)}%`,
                        background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-600 font-mono">
                  {cartTotal >= 200
                    ? "🏆 FREE SHIPPING UNLOCKED!"
                    : `Add $${(200 - cartTotal).toFixed(0)} more for free shipping`}
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-white font-black text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                    boxShadow: "0 0 40px rgba(106,0,255,0.4)",
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="block text-center text-xs text-gray-600 hover:text-gray-300 transition-colors py-1"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
