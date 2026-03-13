"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Check } from "lucide-react";

const STORAGE_KEY = "dualdeer_popup_dismissed";
const EMAILS_KEY = "dualdeer_captured_emails";

export default function DiscountPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    let shown = false;

    // Trigger 1: scroll to 40%
    const onScroll = () => {
      const scrollPct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPct >= 40 && !shown) {
        shown = true;
        setIsVisible(true);
      }
    };

    // Trigger 2: 10 seconds
    const timer = setTimeout(() => {
      if (!shown) {
        shown = true;
        setIsVisible(true);
      }
    }, 10000);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    // Store email
    try {
      const existing = JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]") as string[];
      if (!existing.includes(email.toLowerCase())) {
        existing.push(email.toLowerCase());
        localStorage.setItem(EMAILS_KEY, JSON.stringify(existing));
      }
    } catch {
      // ignore
    }
    setSubmitted(true);
    setTimeout(dismiss, 3000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          />

          {/* Popup card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 24, stiffness: 200 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0e0520 0%, #050508 100%)",
              border: "1px solid rgba(157,77,255,0.3)",
              boxShadow: "0 0 80px rgba(106,0,255,0.3), 0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top accent bar */}
            <div className="h-0.5" style={{ background: "linear-gradient(to right, #6A00FF, #9D4DFF, #C084FF)" }} />

            {/* Background orb */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at top, rgba(106,0,255,0.12) 0%, transparent 65%)",
              }}
            />

            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: "rgba(157,77,255,0.15)", border: "1px solid rgba(157,77,255,0.3)" }}
                    >
                      <Mail className="w-5 h-5" style={{ color: "#C084FF" }} />
                    </div>

                    <p className="text-xs font-mono tracking-[0.25em] mb-3" style={{ color: "#9D4DFF" }}>
                      EXCLUSIVE OFFER
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Unlock <span className="text-gradient">10% Off</span>
                    </h2>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Your First Order
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      Join the DualDeer Performance Club and get instant access to your exclusive discount code, early product drops, and athlete training tips.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(""); }}
                          className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(157,77,255,0.2)"}`,
                          }}
                        />
                        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
                        style={{
                          background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                          boxShadow: "0 0 30px rgba(106,0,255,0.4)",
                        }}
                      >
                        Get My 10% Off →
                      </button>
                    </form>

                    <button onClick={dismiss} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-colors mt-4">
                      No thanks, I&apos;ll pay full price.
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: "rgba(0,229,255,0.15)", border: "1px solid rgba(0,229,255,0.3)" }}
                    >
                      <Check className="w-6 h-6" style={{ color: "#00E5FF" }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">You&apos;re in! 🎉</h3>
                    <p className="text-gray-400 text-sm mb-4">Your exclusive discount code is:</p>
                    <div
                      className="text-2xl font-mono font-bold tracking-[0.2em] py-3 px-6 rounded-xl mx-auto inline-block"
                      style={{
                        background: "rgba(157,77,255,0.12)",
                        border: "1px solid rgba(157,77,255,0.3)",
                        color: "#C084FF",
                      }}
                    >
                      DUAL10
                    </div>
                    <p className="text-gray-600 text-xs mt-4">Apply at checkout. Valid on your next order.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
