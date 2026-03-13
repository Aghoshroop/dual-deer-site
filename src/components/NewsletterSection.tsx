"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";

const EMAILS_KEY = "dualdeer_captured_emails";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]") as string[];
      if (!existing.includes(email.toLowerCase())) {
        existing.push(email.toLowerCase());
        localStorage.setItem(EMAILS_KEY, JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="relative py-28 px-6 md:px-12 overflow-hidden" style={{ background: "#070512" }}>
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 30% 60%, rgba(106,0,255,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(0,229,255,0.05) 0%, transparent 50%)",
          }}
        />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(157,77,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(157,77,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </motion.div>

      {/* Top accent */}
      <div className="neon-line absolute top-0 left-0 right-0" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(157,77,255,0.12)",
              border: "1px solid rgba(157,77,255,0.25)",
              boxShadow: "0 0 30px rgba(106,0,255,0.15)",
            }}
          >
            <Mail className="w-6 h-6" style={{ color: "#C084FF" }} />
          </div>

          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: "#9D4DFF" }}>
            PERFORMANCE CLUB
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the DualDeer{" "}
            <span className="text-gradient">Performance Club.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Get exclusive first access to new drops, athlete training insights, early sale invites, and 10% off your first order.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,229,255,0.15)", border: "1px solid rgba(0,229,255,0.3)" }}
              >
                <Check className="w-5 h-5" style={{ color: "#00E5FF" }} />
              </div>
              <p className="text-white font-semibold">You&apos;re in the Club!</p>
              <p className="text-gray-400 text-sm">
                Your 10% code: <span className="font-mono font-bold" style={{ color: "#C084FF" }}>DUAL10</span> — apply at checkout.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-5 py-4 rounded-full text-white text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(157,77,255,0.2)"}`,
                  }}
                />
                {error && <p className="text-red-400 text-xs mt-1.5 text-left pl-4">{error}</p>}
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-bold text-sm transition-all hover:scale-105 whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                  boxShadow: "0 0 28px rgba(106,0,255,0.4)",
                }}
              >
                Join Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-gray-700 text-xs mt-5 font-mono">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-8 mt-12 text-xs font-mono text-gray-700"
        >
          {["12,000+ members", "Weekly drops", "Exclusive access"].map((item, i) => (
            <div key={item} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: "rgba(157,77,255,0.3)" }}>·</span>}
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="neon-line absolute bottom-0 left-0 right-0" />
    </section>
  );
}
