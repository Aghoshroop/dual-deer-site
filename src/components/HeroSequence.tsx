"use client";

// ─────────────────────────────────────────────────────────────────
//  HeroSequence — root export
//
//  Mobile  (< 768px): Premium static hero, server-rendered, instant.
//  Desktop (≥ 768px): 240-frame scroll animation, client-only via
//                     next/dynamic({ ssr: false }) — this is the
//                     ONLY way to prevent framer-motion useScroll
//                     from causing a hydration mismatch in Next.js 15.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

// DesktopHero is never server-rendered — completely skipped by Next.js SSR.
const DesktopHero = dynamic(() => import("./DesktopHero"), {
  ssr: false,
  loading: () => null,   // nothing shown server-side or during load on mobile
});

// ─────────────────────────────────────────────────────────────────
//  MOBILE HERO  (< 768px)
//  Static / SSR-safe — no scroll hooks, no canvas, instant display.
// ─────────────────────────────────────────────────────────────────

function MobileHero() {
  const [particles, setParticles] = useState<
    { id: number; size: number; x: number; y: number; delay: number; duration: number; opacity: number }[]
  >([]);

  // Particles generated client-side only to avoid hydration mismatch from Math.random()
  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.5,
      }))
    );
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-background flex flex-col overflow-hidden">

      {/* Product image background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frames/ezgif-frame-030.jpg"
        alt="DualDeer Speed Suit"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.30) 40%, rgba(5,5,8,0.75) 80%, rgba(5,5,8,0.97) 100%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `radial-gradient(circle, rgba(192,132,255,${p.opacity}), transparent)`,
              boxShadow: `0 0 ${p.size * 3}px rgba(157,77,255,0.6)`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Scanline grid decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          zIndex: 2,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 40px)",
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center flex-1 px-6 pt-32 pb-12 text-center" style={{ zIndex: 10 }}>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[10px] font-mono tracking-[0.4em] uppercase mb-5"
          style={{ color: "#9D4DFF" }}
        >
          Performance Lab · Est. 2019
        </motion.p>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl font-black text-white tracking-widest mb-3 leading-none"
          style={{ textShadow: "0 0 60px rgba(157,77,255,0.45)" }}
        >
          DUAL
          <span
            style={{
              background: "linear-gradient(135deg, #9D4DFF, #C084FF, #00E5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DEER
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-lg font-light text-gray-300 mb-2 tracking-wide"
        >
          Engineered for speed.
        </motion.p>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm text-gray-500 mb-10 max-w-[280px] leading-relaxed"
        >
          Carbon-fiber compression suits built for elite athletes who refuse to slow down.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex gap-3 flex-wrap justify-center mb-10"
        >
          {[
            { val: "0.04 cd", label: "Drag Coeff." },
            { val: "64-Layer", label: "Carbon Weave" },
            { val: "4.9★", label: "Rated" },
          ].map((s) => (
            <div
              key={s.val}
              className="flex flex-col items-center px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(157,77,255,0.08)", border: "1px solid rgba(157,77,255,0.18)" }}
            >
              <span className="text-white font-black text-sm">{s.val}</span>
              <span className="text-[10px] text-gray-500 font-mono mt-0.5">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm tracking-wide"
            style={{
              background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
              boxShadow: "0 0 32px rgba(106,0,255,0.45)",
            }}
          >
            Shop the Collection
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/story"
            className="w-full flex items-center justify-center py-3.5 rounded-2xl font-semibold text-sm text-gray-300"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            Our Story
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative flex flex-col items-center gap-2 pb-8"
        style={{ zIndex: 10 }}
      >
        <div className="w-px h-10 relative overflow-hidden" style={{ background: "rgba(157,77,255,0.15)" }}>
          <motion.div
            className="absolute top-0 left-0 w-full"
            style={{ background: "linear-gradient(to bottom, #9D4DFF, transparent)", height: "50%" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="text-[9px] font-mono tracking-[0.3em] text-gray-600 uppercase">Scroll</span>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ zIndex: 3, background: "linear-gradient(to top, rgba(5,5,8,0.9), transparent)" }}
      />

      {/* Violet bottom glow bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ zIndex: 4, background: "linear-gradient(to right, transparent, #9D4DFF, #C084FF, #9D4DFF, transparent)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  ROOT EXPORT
// ─────────────────────────────────────────────────────────────────

export default function HeroSequence() {
  return (
    <>
      {/* Mobile: server-rendered static hero, hidden on tablet+ */}
      <div className="md:hidden">
        <MobileHero />
      </div>

      {/* Desktop: dynamic (ssr:false) animation, hidden on mobile */}
      {/* next/dynamic with ssr:false guarantees this never runs on the server */}
      <div className="hidden md:block">
        <DesktopHero />
      </div>
    </>
  );
}