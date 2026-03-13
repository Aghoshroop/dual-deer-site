"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  // Parallax speeds for layered depth
  const bgImgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-48 overflow-hidden flex items-center justify-center"
      style={{ minHeight: "70vh" }}
    >
      {/* Layer 1 — Parallax background image */}
      <motion.div style={{ y: bgImgY }} className="absolute inset-0 z-0 scale-110">
        <Image
          src="/cta-bg.png"
          alt="DualDeer performance speed background"
          fill
          className="object-cover object-center"
          style={{ opacity: 0.35 }}
          priority={false}
        />
      </motion.div>

      {/* Dark overlay to maintain contrast */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(135deg, rgba(5,5,5,0.75) 0%, rgba(14,5,32,0.55) 50%, rgba(5,5,5,0.75) 100%)" }}
      />

      {/* Layer 2 — Parallax glow orb */}
      <motion.div style={{ y: glowY }} className="absolute inset-0 z-[2] pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(106,0,255,0.22) 0%, rgba(157,77,255,0.06) 50%, transparent 80%)",
            filter: "blur(50px)",
          }}
        />
        {/* Orbiting rings */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ border: "1px solid rgba(157,77,255,0.08)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ border: "1px solid rgba(157,77,255,0.04)" }}
        />
        {/* Speed lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px pointer-events-none"
            style={{
              width: `${20 + i * 12}%`,
              top: `${20 + i * 12}%`,
              left: i % 2 === 0 ? 0 : "auto",
              right: i % 2 === 1 ? 0 : "auto",
              background: `linear-gradient(${i % 2 === 0 ? "to right" : "to left"}, transparent, rgba(157,77,255,0.15), transparent)`,
            }}
          />
        ))}
      </motion.div>

      {/* Layer 3 — Text content, scrolls fastest for depth */}
      <motion.div style={{ y: textY }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.35em" }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-xs font-mono mb-8 uppercase"
          style={{ color: "#9D4DFF" }}
        >
          Join the Elite
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-5xl md:text-8xl font-bold text-white tracking-tight mb-4 leading-none"
          style={{ textShadow: "0 0 80px rgba(157,77,255,0.4)" }}
        >
          Built for Those Who
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold tracking-tight mb-14 leading-none text-gradient"
        >
          Refuse to Slow Down.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/shop"
            className="px-10 py-5 text-white text-base font-bold rounded-full transition-all hover:scale-105 inline-block"
            style={{
              background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
              boxShadow: "0 0 50px rgba(106,0,255,0.5), 0 0 100px rgba(106,0,255,0.2)",
            }}
          >
            Shop DualDeer →
          </Link>
          <Link
            href="/shop"
            className="px-10 py-5 text-white text-base font-semibold rounded-full transition-all hover:scale-105 inline-block"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(157,77,255,0.35)",
            }}
          >
            Explore Technology
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.7 }}
          className="flex items-center justify-center gap-6 mt-14 text-xs font-mono tracking-widest text-gray-500"
        >
          <span>FREE SHIPPING $200+</span>
          <span style={{ color: "rgba(157,77,255,0.4)" }}>·</span>
          <span>30-DAY RETURNS</span>
          <span style={{ color: "rgba(157,77,255,0.4)" }}>·</span>
          <span>ATHLETE APPROVED</span>
        </motion.div>
      </motion.div>

      {/* Bottom footer line */}
      <div className="absolute bottom-0 w-full px-6 pb-8 z-10">
        <div
          className="w-full h-px mb-8"
          style={{ background: "linear-gradient(to right, transparent, rgba(157,77,255,0.25), transparent)" }}
        />
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto text-xs font-mono text-gray-700 tracking-widest">
          <span>© {new Date().getFullYear()} DUALDEER PERFORMANCE LAB. ALL RIGHTS RESERVED.</span>
          <div className="space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-400 transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-gray-400 transition-colors">TERMS</a>
            <a href="#" className="hover:text-gray-400 transition-colors">CONTACT</a>
          </div>
        </div>
      </div>
    </section>
  );
}
