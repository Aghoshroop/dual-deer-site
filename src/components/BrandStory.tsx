"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function BrandStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Image moves slightly slower than scroll — classic parallax
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  // Text moves slightly faster — creates depth separation
  const textY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Full-bleed background image with parallax */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 scale-110">
        <Image
          src="/brand-hero.png"
          alt="DualDeer elite athlete engineered for speed"
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
      </motion.div>

      {/* Left-side dark gradient overlay — keeps text readable */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(5,5,8,0.97) 0%, rgba(5,5,8,0.88) 25%, rgba(5,5,8,0.55) 55%, rgba(5,5,8,0.1) 80%, transparent 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, #050508, transparent)" }}
      />

      {/* Top vignette */}
      <div
        className="absolute top-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #050508, transparent)" }}
      />

      {/* Text content — left-aligned, parallax upward */}
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-20 lg:px-28 max-w-3xl"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xs font-mono tracking-[0.4em] mb-6 uppercase"
          style={{ color: "#9D4DFF" }}
        >
          The DualDeer Story
        </motion.p>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] text-white mb-4"
          style={{ textShadow: "0 0 60px rgba(106,0,255,0.25)" }}
        >
          Built for
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.18 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-10"
          style={{
            background: "linear-gradient(135deg, #9D4DFF, #C084FF, #00E5FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Speed.
        </motion.h2>

        {/* Body copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-lg mb-10"
        >
          Every thread woven with intention. Every seam placed with precision.
          DualDeer is the culmination of material science, biomechanics research,
          and years of elite athlete collaboration.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex gap-10"
        >
          {[
            { value: "0.04", unit: "Cd", label: "Drag Coefficient" },
            { value: "64", unit: "×", label: "Fiber Layers" },
            { value: "12", unit: "+", label: "Compression Zones" },
          ].map(({ value, unit, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-white">
                {value}<span className="text-purple-400 text-xl">{unit}</span>
              </p>
              <p className="text-[10px] font-mono tracking-widest text-gray-500 mt-1 uppercase">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10"
        >
          <a
            href="/shop"
            className="inline-flex items-center gap-3 text-sm font-bold text-white tracking-wider group"
          >
            <span
              className="px-6 py-3 rounded-full transition-all group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6A00FF, #9D4DFF)",
                boxShadow: "0 0 30px rgba(106,0,255,0.4)",
              }}
            >
              Shop the Collection →
            </span>
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom-right: subtle image credit / tech badge */}
      <div className="absolute bottom-6 right-8 z-20 text-right">
        <p className="text-[9px] font-mono tracking-[0.3em] text-gray-600 uppercase">
          Carbon · Graphene · DuPont™
        </p>
      </div>
    </section>
  );
}
