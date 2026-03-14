"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronRight, Lock, Package, CreditCard, Truck,
  Zap, Check, ShieldCheck, Star, Smartphone, Apple,
  MapPin, User, Mail,
} from "lucide-react";
import Link from "next/link";
import { saveOrder, notifyNewOrder, requestNotificationPermission, Order, applyDiscount as applyDiscountCode } from "@/lib/store";

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

// Payment methods — COD is active, rest are coming soon
const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when delivered",
    icon: "🏠",
    color: "#00C896",
    isActive: true,
  },
  {
    id: "gpay",
    label: "Google Pay",
    sub: "Coming Soon",
    icon: "G",
    color: "#4285F4",
    isActive: false,
  },
  {
    id: "phonepay",
    label: "PhonePe / UPI",
    sub: "Coming Soon",
    icon: "₹",
    color: "#5F259F",
    isActive: false,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    sub: "Coming Soon",
    icon: "💳",
    color: "#6772E5",
    isActive: false,
  },
  {
    id: "applepay",
    label: "Apple Pay",
    sub: "Coming Soon",
    icon: "",
    color: "#f0f0f0",
    isActive: false,
  },
];

function InputField({
  label, name, type = "text", placeholder, value, onChange, required = true, span = false, icon: Icon,
}: {
  label: string; name: string; type?: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; span?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2">
        {label.toUpperCase()}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 ${Icon ? "pl-9 pr-4" : "px-4"}`}
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
    </div>
  );
}

// ─── Animated Delivery Van SVG ─────────────────────────────────────────────────
function DeliveryVanAnimation({ stage }: { stage: "confirmed" | "shipped" }) {
  const controls = useAnimation();
  const roadControls = useAnimation();
  const successControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Van rolls in
      await controls.start({
        x: ["-120%", "0%"],
        transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
      });
      // Bounce on stop
      await controls.start({
        y: [0, -8, 0],
        transition: { duration: 0.4, ease: "easeOut" },
      });
      // Success pulse
      successControls.start({
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        transition: { duration: 0.5, delay: 0.2 },
      });
    };
    sequence();
    // Road animation
    roadControls.start({
      x: [0, -200],
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    });
  }, [controls, roadControls, successControls]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Road */}
      <div className="relative w-72 h-14 overflow-hidden rounded-2xl mb-2"
        style={{ background: "linear-gradient(135deg, rgba(10,5,30,0.9), rgba(5,5,15,0.95))", border: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Road surface */}
        <div className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: "linear-gradient(to bottom, #1a1a2e, #0f0f1a)" }} />
        {/* Dashed center line */}
        <motion.div animate={roadControls} className="absolute bottom-3 flex gap-5" style={{ left: 0 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          ))}
        </motion.div>
        {/* Van */}
        <motion.div animate={controls} className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <VanSVG accentColor={stage === "shipped" ? "#00E5FF" : "#9D4DFF"} />
        </motion.div>
      </div>

      {/* Status badge */}
      <motion.div animate={successControls} initial={{ scale: 0, opacity: 0 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full mt-2"
        style={{
          background: stage === "shipped"
            ? "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,229,255,0.15))"
            : "linear-gradient(135deg, rgba(157,77,255,0.15), rgba(106,0,255,0.15))",
          border: stage === "shipped" ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(157,77,255,0.3)",
        }}>
        <div className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: stage === "shipped" ? "#00E5FF" : "#C084FF" }} />
        <span className="text-xs font-mono tracking-widest"
          style={{ color: stage === "shipped" ? "#00E5FF" : "#C084FF" }}>
          {stage === "shipped" ? "OUT FOR DELIVERY" : "ORDER CONFIRMED"}
        </span>
      </motion.div>
    </div>
  );
}

function VanSVG({ accentColor }: { accentColor: string }) {
  return (
    <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Van body */}
      <rect x="2" y="8" width="58" height="22" rx="4" fill={accentColor} fillOpacity="0.25" stroke={accentColor} strokeWidth="1.5" />
      {/* Cab */}
      <path d="M60 14 L72 14 L76 20 L76 30 L60 30 Z" fill={accentColor} fillOpacity="0.3" stroke={accentColor} strokeWidth="1.5" />
      {/* Windshield */}
      <path d="M62 16 L70 16 L73 21 L62 21 Z" fill={accentColor} fillOpacity="0.5" />
      {/* Logo on side */}
      <text x="22" y="23" fontSize="6" fill={accentColor} fontFamily="monospace" fontWeight="bold">DUALDEER</text>
      {/* Wheels */}
      <circle cx="18" cy="31" r="5" fill="#0a0512" stroke={accentColor} strokeWidth="1.5" />
      <circle cx="18" cy="31" r="2" fill={accentColor} fillOpacity="0.5" />
      <circle cx="64" cy="31" r="5" fill="#0a0512" stroke={accentColor} strokeWidth="1.5" />
      <circle cx="64" cy="31" r="2" fill={accentColor} fillOpacity="0.5" />
      {/* Headlight */}
      <rect x="74" y="20" width="3" height="5" rx="1" fill="#FFF176" fillOpacity="0.9" />
      {/* Speed lines */}
      <line x1="0" y1="15" x2="-8" y2="15" stroke={accentColor} strokeWidth="1" strokeOpacity="0.4" />
      <line x1="0" y1="19" x2="-12" y2="19" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="0" y1="23" x2="-8" y2="23" stroke={accentColor} strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );
}

// ─── Order Success Screen ─────────────────────────────────────────────────────
function OrderSuccess({ email }: { email: string }) {
  const [stage, setStage] = useState<"confirmed" | "shipped">("confirmed");

  useEffect(() => {
    const t = setTimeout(() => setStage("shipped"), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#050508] pt-24 flex items-center justify-center px-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(157,77,255,0.08) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-lg w-full relative z-10"
      >
        {/* Check mark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(0,200,150,0.2), rgba(0,229,255,0.15))",
            border: "1.5px solid rgba(0,229,255,0.4)",
            boxShadow: "0 0 60px rgba(0,229,255,0.2)",
          }}
        >
          <Check className="w-9 h-9 text-[#00E5FF]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-xs font-mono tracking-[0.4em] mb-3" style={{ color: "#00E5FF" }}>ORDER PLACED</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            {stage === "confirmed" ? "Order Confirmed!" : "On Its Way!"}
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-gray-400 mb-2 text-base"
            >
              {stage === "confirmed"
                ? "Thank you for choosing DualDeer. Your order is being prepared."
                : "Your DualDeer gear is being shipped to you shortly."}
            </motion.p>
          </AnimatePresence>
          {email && (
            <p className="text-sm text-gray-600 mb-10">
              Confirmation sent to <span style={{ color: "#C084FF" }}>{email}</span>
            </p>
          )}
        </motion.div>

        {/* Delivery van animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <DeliveryVanAnimation stage={stage} />
        </motion.div>

        {/* Order tracking steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-0 mb-10"
        >
          {[
            { label: "Confirmed", done: true },
            { label: "Processing", done: stage === "shipped" },
            { label: "Shipped", done: false },
            { label: "Delivered", done: false },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.15 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: s.done
                      ? "linear-gradient(135deg, #00C896, #00E5FF)"
                      : i === (stage === "shipped" ? 2 : 1)
                        ? "linear-gradient(135deg, #6A00FF, #9D4DFF)"
                        : "rgba(255,255,255,0.04)",
                    border: s.done || i === (stage === "shipped" ? 2 : 1)
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: s.done ? "0 0 12px rgba(0,229,255,0.3)" : "none",
                  }}
                >
                  {s.done ? <Check className="w-3 h-3 text-white" /> : <span className="text-gray-600">·</span>}
                </motion.div>
                <span className="text-[9px] font-mono tracking-widest"
                  style={{ color: s.done ? "#00E5FF" : "#4b5563" }}>
                  {s.label.toUpperCase()}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 md:w-12 h-px mx-1 mb-4"
                  style={{
                    background: s.done
                      ? "linear-gradient(to right, #00E5FF, #9D4DFF)"
                      : "rgba(255,255,255,0.06)"
                  }} />
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-4 justify-center"
        >
          <Link href="/"
            className="px-8 py-3 rounded-full text-white font-bold text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #6A00FF, #9D4DFF)", boxShadow: "0 0 30px rgba(106,0,255,0.35)" }}>
            Back to Home
          </Link>
          <Link href="/shop"
            className="px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{ border: "1px solid rgba(157,77,255,0.3)", color: "#9D4DFF" }}>
            Shop More
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

// ─── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("shipping");
  const [delivery, setDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // COD is default & only active
  const [ordered, setOrdered] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [appliedDiscountAmount, setAppliedDiscountAmount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { requestNotificationPermission(); }, []);

  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    address: "",
    city: "",
    zip: "",
    country: "India",
    discount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const applyDiscount = () => {
    const result = applyDiscountCode(form.discount, cartTotal);
    if (result.valid) {
      setDiscountApplied(true);
      setAppliedDiscountAmount(cartTotal - result.finalPrice);
      setDiscountError("");
    } else {
      setDiscountApplied(false);
      setAppliedDiscountAmount(0);
      setDiscountError("Invalid or inactive discount code.");
    }
  };

  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === delivery);
  const deliveryPrice = deliveryOption?.price ?? 0;
  const discount = discountApplied ? appliedDiscountAmount : 0;
  const total = cartTotal - discount + deliveryPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "shipping") { setStep("payment"); return; }
    if (step === "payment") { setStep("review"); return; }

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
      paymentMethod: "cod",
      status: "new",
      read: false,
    };

    saveOrder(order);
    notifyNewOrder(order);
    clearCart();
    setOrdered(true);
  };

  // ─── Empty cart ────────────────────────────────────────────────────
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

  // ─── Success screen ────────────────────────────────────────────────
  if (ordered) return <OrderSuccess email={form.email} />;

  return (
    <main className="min-h-screen bg-[#050508] pt-24 px-4 md:px-12 pb-20">
      {/* Page ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at top right, rgba(106,0,255,0.06) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

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

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ─── Left Column: Steps ──────────────────────────────── */}
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
                        <InputField label="First Name" name="firstName" icon={User} placeholder="Marcus" value={form.firstName} onChange={handleChange} />
                        <InputField label="Last Name" name="lastName" placeholder="Veloce" value={form.lastName} onChange={handleChange} />
                        <InputField label="Email" name="email" icon={Mail} type="email" placeholder="athlete@example.com" value={form.email} onChange={handleChange} span />
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: "#9D4DFF" }} /> Shipping Address
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Street Address" name="address" placeholder="123 Sprint Avenue" value={form.address} onChange={handleChange} span />
                        <InputField label="City" name="city" placeholder="Mumbai" value={form.city} onChange={handleChange} />
                        <InputField label="ZIP / Postal Code" name="zip" placeholder="400001" value={form.zip} onChange={handleChange} />
                        <div>
                          <label className="block text-[10px] font-mono tracking-[0.25em] text-gray-500 mb-2">COUNTRY</label>
                          <select name="country" value={form.country} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", appearance: "none" }}>
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Delivery options */}
                    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(157,77,255,0.12)" }}>
                      <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                        <Truck className="w-5 h-5" style={{ color: "#9D4DFF" }} /> Delivery Options
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
                              {price === 0 ? "FREE" : `₹${price}`}
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
                      <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-3">
                        <Lock className="w-5 h-5" style={{ color: "#9D4DFF" }} />
                        Payment Method
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                          <ShieldCheck className="w-3.5 h-3.5" /> SSL Encrypted
                        </span>
                      </h2>
                      <p className="text-xs text-gray-600 mb-6 ml-8">Select how you&apos;d like to pay</p>

                      <div className="space-y-3">
                        {PAYMENT_METHODS.map(({ id, label, sub, icon, color, isActive }) => {
                          const isSelected = paymentMethod === id && isActive;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => isActive && setPaymentMethod(id)}
                              disabled={!isActive}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 relative overflow-hidden"
                              style={{
                                background: isSelected
                                  ? `${color}12`
                                  : isActive ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                                border: `1px solid ${isSelected ? color + "50" : isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                                boxShadow: isSelected ? `0 0 24px ${color}20` : "none",
                                opacity: isActive ? 1 : 0.55,
                                cursor: isActive ? "pointer" : "not-allowed",
                              }}
                            >
                              {/* Icon */}
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black"
                                style={{
                                  background: isSelected ? `${color}22` : "rgba(255,255,255,0.04)",
                                  color: isSelected ? color : "#6b7280",
                                  border: `1px solid ${isSelected ? color + "30" : "rgba(255,255,255,0.06)"}`,
                                }}>
                                {id === "cod" ? <Package className="w-5 h-5" style={{ color: isSelected ? color : "#6b7280" }} /> :
                                  id === "card" ? <CreditCard className="w-5 h-5" style={{ color: isSelected ? color : "#6b7280" }} /> :
                                  id === "applepay" ? <Apple className="w-5 h-5" style={{ color: isSelected ? color : "#6b7280" }} /> :
                                  id === "phonepay" ? <Smartphone className="w-5 h-5" style={{ color: isSelected ? color : "#6b7280" }} /> :
                                  <span style={{ color: isSelected ? color : "#6b7280" }}>{icon}</span>}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm" style={{ color: isActive ? "#fff" : "#6b7280" }}>{label}</p>
                                <p className="text-xs mt-0.5" style={{ color: isActive ? (isSelected ? color : "#6b7280") : "#374151" }}>{sub}</p>
                              </div>

                              {/* Coming soon badge OR radio */}
                              {!isActive ? (
                                <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono tracking-widest"
                                  style={{ background: "rgba(255,255,255,0.05)", color: "#4b5563", border: "1px solid rgba(255,255,255,0.07)" }}>
                                  COMING SOON
                                </span>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                  style={{ borderColor: isSelected ? color : "rgba(255,255,255,0.2)" }}>
                                  {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* COD notice */}
                      <div className="mt-6 p-4 rounded-2xl flex items-start gap-3"
                        style={{ background: "rgba(0,200,150,0.06)", border: "1px solid rgba(0,200,150,0.2)" }}>
                        <Package className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#00C896" }} />
                        <div>
                          <p className="text-sm text-white font-semibold">Cash on Delivery</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Pay in cash when your order arrives. No upfront payment required. Our delivery partner will collect payment at your door.
                          </p>
                        </div>
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
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#00C896" }}>
                            <Package className="w-3 h-3" /> Cash on Delivery
                          </span>
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
                            <p className="text-white font-bold text-sm">₹{(item.product.price * item.qty).toLocaleString()}</p>
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
                        style={{ background: "linear-gradient(135deg, #00C896, #6A00FF)", boxShadow: "0 0 40px rgba(0,200,150,0.3)" }}>
                        <Package className="w-4 h-4" /> Place Order (COD)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Right Column: Order Summary ────────────────────── */}
            <div>
              <div className="p-6 rounded-3xl sticky top-24 space-y-5"
                style={{ background: "rgba(10,10,20,0.85)", border: "1px solid rgba(157,77,255,0.12)", backdropFilter: "blur(12px)" }}>
                <h2 className="text-white font-bold text-base">Order Summary</h2>

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
                      <span className="text-white font-bold text-xs flex-shrink-0">₹{(item.product.price * item.qty).toLocaleString()}</span>
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
                    <span>Subtotal</span><span className="text-white">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount (10%)</span>
                      <span className="text-green-400">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="text-white">{deliveryPrice === 0 ? "FREE" : `₹${deliveryPrice}`}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-white">Total</span>
                    <span className="text-2xl" style={{ color: "#C084FF" }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* COD badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "rgba(0,200,150,0.06)", border: "1px solid rgba(0,200,150,0.15)" }}>
                  <Package className="w-3.5 h-3.5" style={{ color: "#00C896" }} />
                  <span className="text-[10px] text-gray-400 font-mono">Cash on Delivery — Pay at door</span>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
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
