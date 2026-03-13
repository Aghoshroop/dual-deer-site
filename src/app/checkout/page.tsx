"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronRight, Lock, Package, CreditCard, Truck,
  Zap, Apple, Check, ShieldCheck, Star,
} from "lucide-react";
import Link from "next/link";
import { saveOrder, notifyNewOrder, requestNotificationPermission, Order } from "@/lib/store";


type Step = "shipping" | "payment" | "review";

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "shipping", label: "Shipping", num: 1 },
  { id: "payment", label: "Payment", num: 2 },
  { id: "review", label: "Review", num: 3 },
];

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", sub: "5–7 business days", price: 0, icon: Truck },
  { id: "express", label: "Express Delivery", sub: "2–3 business days", price: 15, icon: Zap },
  { id: "overnight", label: "Overnight Express", sub: "Next business day", price: 35, icon: Star },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Card", icon: CreditCard, sub: "Stripe", color: "#6772E5" },
  { id: "razorpay", label: "Razorpay", icon: CreditCard, sub: "UPI / Cards", color: "#3395FF" },
  { id: "applepay", label: "Apple Pay", icon: Apple, sub: "Touch ID", color: "#f0f0f0" },
  { id: "googlepay", label: "Google Pay", icon: CreditCard, sub: "G Pay", color: "#4285F4" },
];

function InputField({
  label, name, type = "text", placeholder, value, onChange, required = true, span = false,
}: {
  label: string; name: string; type?: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2">
        {label.toUpperCase()}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(157,77,255,0.5)";
          e.target.style.boxShadow = "0 0 0 3px rgba(157,77,255,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.07)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("shipping");
  const [delivery, setDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [ordered, setOrdered] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Ask for notification permission so admin gets alerted on order
  useEffect(() => { requestNotificationPermission(); }, []);

  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
    discount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const applyDiscount = () => {
    if (form.discount.toUpperCase() === "DUAL10") {
      setDiscountApplied(true);
      setDiscountError("");
    } else {
      setDiscountError("Invalid code. Try DUAL10.");
    }
  };

  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === delivery);
  const deliveryPrice = deliveryOption?.price ?? 0;
  const discount = discountApplied ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount + deliveryPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "shipping") { setStep("payment"); return; }
    if (step === "payment") { setStep("review"); return; }

    // ── Build and save the order ──────────────────────────────────────────────
    const order: Order = {
      id: `ORD-${Date.now()}`,
      placedAt: Date.now(),
      customer: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        address: form.address,
        city: form.city,
        zip: form.zip,
        country: form.country,
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        qty: item.qty,
        unitPrice: item.product.price,
      })),
      subtotal: cartTotal,
      deliveryPrice,
      discountAmount: discount,
      total,
      deliveryMethod: delivery,
      paymentMethod,
      status: "new",
      read: false,
    };

    saveOrder(order);
    notifyNewOrder(order);
    clearCart();
    setOrdered(true);
  };


  // ─── Empty cart state ────────────────────────────────────────────────
  if (cart.length === 0 && !ordered) {
    return (
      <main className="min-h-screen bg-[#050508] pt-24 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(157,77,255,0.08)", border: "1px solid rgba(157,77,255,0.2)" }}>
            <Package className="w-8 h-8" style={{ color: "rgba(157,77,255,0.5)" }} />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Your cart is empty.</h1>
          <p className="text-gray-500 mb-8">Add some products before checking out.</p>
          <Link href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-bold"
            style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 30px rgba(106,0,255,0.35)" }}>
            Shop Now <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    );
  }

  // ─── Order success ────────────────────────────────────────────────────
  if (ordered) {
    return (
      <main className="min-h-screen bg-[#050508] pt-24 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }}
          className="text-center max-w-lg">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg, rgba(0,200,150,0.2), rgba(0,229,255,0.2))", border: "1px solid rgba(0,229,255,0.3)" }}>
            <Check className="w-10 h-10 text-[#00E5FF]" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-4">Order Confirmed!</h1>
          <p className="text-gray-400 mb-3 text-lg">Thank you for choosing DualDeer.</p>
          <p className="text-sm text-gray-600 mb-10">
            Confirmation sent to <span style={{ color: "#C084FF" }}>{form.email}</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/"
              className="px-8 py-3 rounded-full text-white font-bold"
              style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 30px rgba(106,0,255,0.35)" }}>
              Back to Home
            </Link>
            <Link href="/shop"
              className="px-8 py-3 rounded-full font-bold"
              style={{ border: "1px solid rgba(157,77,255,0.3)", color: "#9D4DFF" }}>
              Shop More
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050508] pt-24 px-6 md:px-12 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-10">
          <p className="text-xs font-mono tracking-[0.35em] mb-2" style={{ color: "#9D4DFF" }}>SECURE CHECKOUT</p>
          <h1 className="text-4xl font-black text-white">Complete Your Order</h1>
        </motion.div>

        {/* Step progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = STEPS.findIndex((x) => x.id === step) > i;
            return (
              <div key={s.id} className="flex items-center gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                    style={{
                      background: done ? "rgba(0,229,255,0.2)" : active ? "linear-gradient(135deg, #6A00FF, #9D4DFF)" : "rgba(255,255,255,0.05)",
                      color: done ? "#00E5FF" : active ? "#fff" : "#4b5563",
                      border: done ? "1px solid rgba(0,229,255,0.4)" : active ? "none" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: active ? "0 0 20px rgba(157,77,255,0.4)" : "none",
                    }}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="text-sm font-semibold hidden sm:block"
                    style={{ color: active ? "#fff" : done ? "#00E5FF" : "#4b5563" }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-12 md:w-20 h-px mx-3"
                    style={{ background: done ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.06)" }} />
                )}
              </div>
            );
          })}
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ─── Left Column: Steps ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <AnimatePresence mode="wait">

                {/* STEP 1: SHIPPING */}
                {step === "shipping" && (
                  <motion.div key="shipping"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }} className="space-y-5">

                    {/* Contact info */}
                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full text-xs flex items-center justify-center font-mono"
                          style={{ background: "rgba(157,77,255,0.2)", color: "#9D4DFF" }}>1</span>
                        Contact Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="First Name" name="firstName" placeholder="Marcus" value={form.firstName} onChange={handleChange} />
                        <InputField label="Last Name" name="lastName" placeholder="Veloce" value={form.lastName} onChange={handleChange} />
                        <InputField label="Email" name="email" type="email" placeholder="athlete@example.com" value={form.email} onChange={handleChange} span />
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Truck className="w-5 h-5" style={{ color: "#9D4DFF" }} /> Shipping Address
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Street Address" name="address" placeholder="123 Sprint Avenue" value={form.address} onChange={handleChange} span />
                        <InputField label="City" name="city" placeholder="New York" value={form.city} onChange={handleChange} />
                        <InputField label="ZIP / Postal Code" name="zip" placeholder="10001" value={form.zip} onChange={handleChange} />
                      </div>
                    </div>

                    {/* Delivery options */}
                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Zap className="w-5 h-5" style={{ color: "#9D4DFF" }} /> Delivery Options
                      </h2>
                      <div className="space-y-3">
                        {DELIVERY_OPTIONS.map(({ id, label, sub, price, icon: Icon }) => (
                          <button key={id} type="button" onClick={() => setDelivery(id)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                            style={{
                              background: delivery === id ? "rgba(157,77,255,0.08)" : "rgba(255,255,255,0.02)",
                              border: `1px solid ${delivery === id ? "rgba(157,77,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: delivery === id ? "0 0 20px rgba(157,77,255,0.12)" : "none",
                            }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: delivery === id ? "rgba(157,77,255,0.2)" : "rgba(255,255,255,0.04)" }}>
                              <Icon className="w-4 h-4" style={{ color: delivery === id ? "#9D4DFF" : "#6b7280" }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-sm">{label}</p>
                              <p className="text-gray-500 text-xs">{sub}</p>
                            </div>
                            <p className="text-sm font-bold" style={{ color: delivery === id ? "#9D4DFF" : "#9ca3af" }}>
                              {price === 0 ? "FREE" : `$${price}`}
                            </p>
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: delivery === id ? "#9D4DFF" : "rgba(255,255,255,0.2)" }}>
                              {delivery === id && <div className="w-2 h-2 rounded-full bg-[#9D4DFF]" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-black text-sm transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 40px rgba(106,0,255,0.4)" }}>
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: PAYMENT */}
                {step === "payment" && (
                  <motion.div key="payment"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }} className="space-y-5">

                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Lock className="w-5 h-5" style={{ color: "#9D4DFF" }} />
                        Payment Method
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                          <ShieldCheck className="w-3.5 h-3.5" /> SSL Encrypted
                        </span>
                      </h2>

                      {/* Payment method selector */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {PAYMENT_METHODS.map(({ id, label, icon: Icon, sub, color }) => (
                          <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200"
                            style={{
                              background: paymentMethod === id ? `${color}12` : "rgba(255,255,255,0.02)",
                              border: `1px solid ${paymentMethod === id ? color + "50" : "rgba(255,255,255,0.07)"}`,
                              boxShadow: paymentMethod === id ? `0 0 20px ${color}18` : "none",
                            }}>
                            <Icon className="w-5 h-5" style={{ color: paymentMethod === id ? color : "#4b5563" }} />
                            <span className="text-xs font-bold" style={{ color: paymentMethod === id ? color : "#6b7280" }}>{label}</span>
                            <span className="text-[9px] text-gray-700">{sub}</span>
                          </button>
                        ))}
                      </div>

                      {/* Card placeholder */}
                      <div className="p-6 rounded-2xl text-center"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(157,77,255,0.4)" }} />
                        <p className="text-gray-400 text-sm font-semibold mb-1">
                          {paymentMethod === "card" && "Stripe Secure Payment"}
                          {paymentMethod === "razorpay" && "Razorpay Gateway"}
                          {paymentMethod === "applepay" && "Apple Pay"}
                          {paymentMethod === "googlepay" && "Google Pay"}
                        </p>
                        <p className="text-gray-700 text-xs">Integration coming soon — demo mode active</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep("shipping")}
                        className="px-6 py-4 rounded-full font-bold text-sm"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                        ← Back
                      </button>
                      <button type="submit"
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-white font-black text-sm transition-all hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 40px rgba(106,0,255,0.4)" }}>
                        Review Order <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW */}
                {step === "review" && (
                  <motion.div key="review"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }} className="space-y-5">

                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6">Review Your Order</h2>

                      {/* Summary lines */}
                      <div className="space-y-4 pb-6 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-mono text-xs">SHIPPING TO</span>
                          <span className="text-white text-right text-xs">{form.address}, {form.city} {form.zip}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-mono text-xs">DELIVERY</span>
                          <span className="text-white text-xs">{deliveryOption?.label}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-mono text-xs">PAYMENT</span>
                          <span className="text-white text-xs">{PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}</span>
                        </div>
                      </div>

                      <p className="text-xs font-mono tracking-widest text-gray-500 mb-4">ORDER ITEMS</p>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex-shrink-0"
                              style={{
                                background: `radial-gradient(circle, ${item.product.accentColor}30, ${item.product.accentColor}08)`,
                                border: `1px solid ${item.product.accentColor}25`,
                              }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{item.product.name}</p>
                              <p className="text-gray-600 text-xs">Size {item.size} × {item.qty}</p>
                            </div>
                            <p className="text-white font-bold text-sm">${(item.product.price * item.qty).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep("payment")}
                        className="px-6 py-4 rounded-full font-bold text-sm"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                        ← Back
                      </button>
                      <button type="submit"
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-white font-black text-sm transition-all hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 40px rgba(106,0,255,0.4)" }}>
                        <Lock className="w-4 h-4" /> Place Order
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Right Column: Order Summary ────────────────────── */}
            <div>
              <div className="p-6 rounded-3xl sticky top-24 space-y-5"
                style={{ background: "rgba(10,10,20,0.8)", border: "1px solid rgba(157,77,255,0.12)", backdropFilter: "blur(12px)" }}>
                <h2 className="text-white font-bold text-base">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex-shrink-0"
                          style={{
                            background: `radial-gradient(circle, ${item.product.accentColor}25, transparent)`,
                            border: `1px solid ${item.product.accentColor}20`,
                          }} />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{item.product.name}</p>
                          <p className="text-gray-600 text-[10px]">Size {item.size} × {item.qty}</p>
                        </div>
                      </div>
                      <span className="text-white font-bold text-xs flex-shrink-0">${(item.product.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Discount code */}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      placeholder="Discount code"
                      className="flex-1 px-3 py-2 rounded-lg text-white text-xs outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    />
                    <button type="button" onClick={applyDiscount}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-white"
                      style={{ background: "rgba(157,77,255,0.2)", border: "1px solid rgba(157,77,255,0.3)" }}>
                      Apply
                    </button>
                  </div>
                  {discountApplied && <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" /> 10% discount applied!</p>}
                  {discountError && <p className="text-red-400 text-xs mt-1.5">{discountError}</p>}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span><span className="text-white">${cartTotal.toLocaleString()}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount (10%)</span>
                      <span className="text-green-400">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="text-white">{deliveryPrice === 0 ? "FREE" : `$${deliveryPrice}`}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-white">Total</span>
                    <span className="text-2xl" style={{ color: "#C084FF" }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <ShieldCheck className="w-4 h-4 text-gray-700" />
                  <span className="text-[10px] text-gray-700 font-mono">256-bit SSL · Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
